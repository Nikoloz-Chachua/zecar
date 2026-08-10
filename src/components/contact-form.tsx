"use client";

import { useState } from "react";
import type { Vehicle } from "@/types/vehicle";
import { buildMailtoUrl } from "@/lib/inquiry";
import { Arrow } from "./icons";

export function ContactForm({ vehicle }: { vehicle?: Vehicle }) {
  const [note, setNote] = useState(false);
  return <form className="contact-form" onSubmit={(event) => {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    window.location.href = buildMailtoUrl(vehicle, { name: String(data.get("name")), email: String(data.get("email")), phone: String(data.get("phone")), message: String(data.get("message")) }); setNote(true);
  }}>
    <div className="form-row"><label><span>Name</span><input name="name" autoComplete="name" required /></label><label><span>Email</span><input name="email" type="email" autoComplete="email" required /></label></div>
    <label><span>Phone <small>(optional)</small></span><input name="phone" type="tel" autoComplete="tel" /></label>
    <label><span>Message</span><textarea name="message" rows={5} required defaultValue={vehicle ? `I’m interested in the ${vehicle.year} ${vehicle.make} ${vehicle.model}. Please confirm its availability.` : ""} /></label>
    <button className="button primary" type="submit">Open email to send <Arrow className="icon" /></button>
    <p className="form-note" aria-live="polite">{note ? "Your email app should now be open. Please review and send the message there." : "Submitting opens your email app with this message prepared. Nothing is sent automatically."}</p>
  </form>;
}
