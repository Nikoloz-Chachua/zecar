"use client";

import { useState } from "react";
import type { Vehicle } from "@/types/vehicle";
import { getVehicleTitle } from "@/lib/vehicles";
import { buildMailtoUrl } from "@/lib/inquiry";
import { useLocale } from "./locale-provider";
import { Arrow } from "./icons";

export function ContactForm({ vehicle }: { vehicle?: Vehicle }) {
  const [note, setNote] = useState(false);
  const { locale, dictionary: t } = useLocale();
  return <form className="contact-form" onSubmit={(event) => {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    window.location.href = buildMailtoUrl(vehicle, { name: String(data.get("name")), email: String(data.get("email")), phone: String(data.get("phone")), message: String(data.get("message")) }, locale); setNote(true);
  }}>
    <div className="form-row"><label><span>{t.form.name}</span><input name="name" autoComplete="name" required /></label><label><span>{t.form.email}</span><input name="email" type="email" autoComplete="email" required /></label></div>
    <label><span>{t.form.phone} <small>({t.form.optional})</small></span><input name="phone" type="tel" autoComplete="tel" /></label>
    <label><span>{t.form.message}</span><textarea name="message" rows={5} required key={locale} defaultValue={vehicle ? t.form.defaultMessage.replace("{vehicle}", getVehicleTitle(vehicle)) : ""} /></label>
    <button className="button primary" type="submit">{t.form.submit} <Arrow className="icon" /></button>
    <p className="form-note" aria-live="polite">{note ? t.form.opened : t.form.prepared}</p>
  </form>;
}
