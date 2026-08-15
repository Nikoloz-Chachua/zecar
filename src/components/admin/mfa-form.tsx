/* eslint-disable @next/next/no-img-element -- Supabase returns an ephemeral data-URI TOTP QR code. */
"use client";

import { useActionState } from "react";
import { beginMfa, logout, verifyMfa, type MfaState } from "@/app/(admin)/admin/actions";

function VerificationForm({ initialState }: { initialState: MfaState }) {
  const [state, action, pending] = useActionState(verifyMfa, initialState);
  return <>
    {state.qr && state.secret && <div className="admin-mfa-setup">
      <p>Scan this QR code with an authenticator app, or enter the secret manually.</p>
      <img src={state.qr} alt="TOTP authenticator QR code" width="192" height="192" />
      <label>Manual setup secret<output>{state.secret}</output></label>
    </div>}
    <form action={action} className="admin-login-form">
      <div>
        <label htmlFor="totp">6-digit authenticator code</label>
        <input id="totp" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required disabled={pending} />
      </div>
      {state.error && <p className="admin-alert" role="alert">{state.error}</p>}
      <button className="admin-primary" disabled={pending}>{pending ? "Verifying…" : "Verify and continue"}</button>
    </form>
  </>;
}

export function MfaForm({ factorId }: { factorId?: string }) {
  const [setup, beginAction, pending] = useActionState(beginMfa, {} as MfaState);
  const ready = setup.factorId ? setup : factorId ? { factorId } : null;
  return <section className="admin-login">
    <div className="admin-login-brand"><span>Z</span><strong>ZECAR</strong><small>OWNER CONSOLE</small></div>
    <div className="admin-login-card">
      <p className="admin-kicker">Two-step verification</p>
      <h1>Protect the console</h1>
      {ready
        ? <VerificationForm key={ready.factorId} initialState={ready} />
        : <form action={beginAction} className="admin-login-form">
            <p>Set up an authenticator app to protect this private console.</p>
            {setup.error && <p className="admin-alert" role="alert">{setup.error}</p>}
            <button className="admin-primary" disabled={pending}>{pending ? "Preparing…" : "Begin authenticator setup"}</button>
          </form>}
      <form action={logout}><button className="admin-signout" type="submit">Sign out</button></form>
    </div>
  </section>;
}
