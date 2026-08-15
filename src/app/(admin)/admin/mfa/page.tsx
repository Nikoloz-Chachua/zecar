import { redirect } from "next/navigation";
import { logout } from "../actions";
import { MfaForm } from "@/components/admin/mfa-form";
import { adminAccess } from "@/lib/supabase/admin-access";

export const dynamic = "force-dynamic";

export default async function MfaPage() {
  const access = await adminAccess({ allowAal1: true });
  if (!access.authorized) {
    return <section className="admin-login">
      <div className="admin-login-card">
        <p className="admin-kicker">Private access</p>
        <h1>Access denied</h1>
        <p>This account is not authorized to use the owner console.</p>
        <form action={logout}><button className="admin-signout" type="submit">Sign out</button></form>
      </div>
    </section>;
  }
  const { data: aal } = await access.client.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel === "aal2") redirect("/admin");
  const listed = await access.client.auth.mfa.listFactors();
  const verified = listed.data?.totp.find(factor => factor.status === "verified");
  return <MfaForm factorId={verified?.id} />;
}
