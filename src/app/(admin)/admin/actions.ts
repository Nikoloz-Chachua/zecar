"use server";

import { redirect } from "next/navigation";
import { hasSuperAdminRole } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };
export type MfaState = {
  error?: string;
  factorId?: string;
  qr?: string;
  secret?: string;
};

const denied = { error: "Access denied." };
const mfaError = { error: "MFA verification is unavailable." };

async function hasMembership(client: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>, userId: string) {
  const { data } = await client
    .from("analytics_admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data);
}

async function requireMfaAccess() {
  const client = await createSupabaseServerClient();
  if (!client) return null;
  const [{ data: { user } }, { data: aal }] = await Promise.all([
    client.auth.getUser(),
    client.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);
  if (!user || !hasSuperAdminRole(user) || !(await hasMembership(client, user.id))) return null;
  return { client, user, level: aal?.currentLevel ?? null };
}

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const client = await createSupabaseServerClient();
  if (!client) return { error: "Analytics is not configured." };
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Enter your email and password." };
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "Invalid email or password." };
  if (!hasSuperAdminRole(data.user) || !(await hasMembership(client, data.user.id))) {
    await client.auth.signOut();
    return denied;
  }
  const aal = await client.auth.mfa.getAuthenticatorAssuranceLevel();
  redirect(aal.data?.currentLevel === "aal2" ? "/admin" : "/admin/mfa");
}

export async function beginMfa(previous: MfaState, formData: FormData): Promise<MfaState> {
  void previous;
  void formData;
  const access = await requireMfaAccess();
  if (!access || access.level !== "aal1") return denied;
  const listed = await access.client.auth.mfa.listFactors();
  if (listed.error) return mfaError;
  const verified = listed.data.totp.find(factor => factor.status === "verified");
  if (verified) return { factorId: verified.id };
  const enrolled = await access.client.auth.mfa.enroll({ factorType: "totp", friendlyName: "ZECAR owner console" });
  if (enrolled.error) return mfaError;
  return {
    factorId: enrolled.data.id,
    qr: enrolled.data.totp.qr_code,
    secret: enrolled.data.totp.secret,
  };
}

export async function verifyMfa(previous: MfaState, formData: FormData): Promise<MfaState> {
  const access = await requireMfaAccess();
  if (!access || access.level !== "aal1") return denied;
  const code = String(formData.get("code") || "").trim();
  if (!/^\d{6}$/.test(code) || !previous.factorId) return { ...previous, error: "Enter a valid 6-digit code." };
  const listed = await access.client.auth.mfa.listFactors();
  const factor = listed.data?.totp.find(item => item.id === previous.factorId);
  if (listed.error || !factor) return mfaError;
  const result = await access.client.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (result.error) return { ...previous, error: "The verification code could not be accepted." };
  redirect("/admin");
}

export async function logout() {
  const client = await createSupabaseServerClient();
  if (!client) return;
  const { error } = await client.auth.signOut();
  if (error) throw new Error("Sign out failed");
  redirect("/admin/login");
}
