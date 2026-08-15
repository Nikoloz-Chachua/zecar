import "server-only";
import { redirect } from "next/navigation";
import { authorizeAdminAccess, hasSuperAdminRole } from "./config";
import { createSupabaseServerClient } from "./server";

export async function adminAccess(options: { allowAal1?: boolean } = {}) {
  const client = await createSupabaseServerClient();
  if (!client) redirect("/admin/login");

  const [{ data: { user } }, { data: aal }] = await Promise.all([
    client.auth.getUser(),
    client.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);
  if (!user) redirect("/admin/login");
  if (!hasSuperAdminRole(user)) return { client, user, authorized: false as const, reason: "role" as const };

  const { data: membership } = await client
    .from("analytics_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) return { client, user, authorized: false as const, reason: "membership" as const };

  const currentLevel = aal?.currentLevel ?? null;
  if (!options.allowAal1 && currentLevel !== "aal2") redirect("/admin/mfa");
  return {
    client,
    user,
    authorized: authorizeAdminAccess(user, true, currentLevel, Boolean(options.allowAal1)),
    reason: null,
  };
}
