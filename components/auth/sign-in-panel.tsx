"use client";

import { useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function SignInPanel() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"success" | "error">("success");

  const signIn = async () => {
    const client = createClient();
    if (!client) {
      setTone("error");
      setMessage("Cloud history is not configured yet.");
      return;
    }

    const { error } = await client.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/history`,
      },
    });

    setTone(error ? "error" : "success");
    setMessage(error ? error.message : "Check your email for the sign-in link.");
  };

  if (!isSupabaseConfigured()) {
    return <p className="muted">Cloud history is not configured on this deployment yet.</p>;
  }

  return (
    <div className="save-panel">
      <label className="field-label" htmlFor="email">
        Email for cloud history
      </label>
      <input id="email" className="text-input" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
      <button className="primary-button button-gap" type="button" onClick={signIn} disabled={!email}>
        Send sign-in link
      </button>
      {message && <p className={tone === "success" ? "notice notice-success" : "notice notice-error"}>{message}</p>}
    </div>
  );
}
