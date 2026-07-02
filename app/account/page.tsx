"use client";

/**
 * Account & sync. Deliberately framed like Obsidian's sync settings:
 * the app is complete without an account; signing in only adds an
 * encrypted-in-transit private cloud history.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { cloudConfigured, getSupabase } from "@/lib/supabase/client";
import { clearAllLocalData } from "@/lib/local-store/indexed-db";
import { GhostButton, PrimaryButton, SecondaryButton } from "@/components/ui/buttons";
import { TopBar } from "@/components/app/top-bar";

type Mode = "signin" | "signup";

export default function AccountPage() {
  // undefined = still checking; null = signed out (or cloud not configured)
  const [user, setUser] = useState<User | null | undefined>(() =>
    cloudConfigured() ? undefined : null
  );
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const supabase = cloudConfigured() ? getSupabase() : null;

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) {
          setNotice("Check your email to confirm your account, then sign in here.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const clearLocal = async () => {
    await clearAllLocalData();
    setConfirmClear(false);
    setNotice("All local entries and drafts on this device were cleared.");
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col">
      <TopBar />
      <main className="flex flex-1 flex-col px-5 pb-8">
        <h1 className="mb-2 font-display text-[1.625rem] text-ink">Account &amp; sync</h1>
        <p className="mb-6 text-[0.9375rem] text-ink-soft">
          Thought Log works fully without an account — entries stay on this device.
          Sign in only if you want a private cloud history across devices.
        </p>

        {!cloudConfigured() && (
          <p className="rounded-xl border border-line bg-paper-raised p-4 text-[0.9375rem] text-ink-soft">
            Cloud sync isn&apos;t configured for this deployment. Local save and export
            still work completely.
          </p>
        )}

        {supabase && user === undefined && (
          <p className="text-[0.875rem] text-ink-faint">Loading…</p>
        )}

        {supabase && user && (
          <section className="rounded-xl border border-line bg-paper-raised p-5">
            <p className="text-[0.9375rem] text-ink">
              Signed in as <span className="font-medium">{user.email}</span>
            </p>
            <p className="mt-1 text-[0.875rem] text-ink-soft">
              Entries you choose to save to cloud are visible only to this account.
            </p>
            <div className="mt-4 flex gap-2">
              <Link
                href="/history"
                className="min-h-11 rounded-full border border-line-strong bg-paper px-5 py-2.5 text-[0.9375rem] text-ink-soft"
              >
                View history
              </Link>
              <SecondaryButton onClick={() => supabase.auth.signOut()}>Sign out</SecondaryButton>
            </div>
          </section>
        )}

        {supabase && user === null && (
          <form onSubmit={submit} className="rounded-xl border border-line bg-paper-raised p-5">
            <div className="mb-4 flex rounded-full border border-line bg-paper p-1">
              {(["signin", "signup"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  aria-pressed={mode === m}
                  className={`min-h-10 flex-1 rounded-full text-[0.875rem] transition-colors ${
                    mode === m ? "bg-ink text-paper" : "text-ink-soft"
                  }`}
                >
                  {m === "signin" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>
            <label className="mb-1 block text-[0.8125rem] text-ink-soft" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="write-surface mb-3 min-h-12 !py-2.5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label className="mb-1 block text-[0.8125rem] text-ink-soft" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="write-surface mb-4 min-h-12 !py-2.5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PrimaryButton type="submit" disabled={busy}>
              {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
            </PrimaryButton>
          </form>
        )}

        {notice && (
          <p role="status" className="mt-3 text-[0.875rem] text-ink-soft">
            {notice}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-3 text-[0.875rem] text-danger">
            {error}
          </p>
        )}

        <section className="mt-10 border-t border-line pt-5">
          <h2 className="mb-1 text-[0.75rem] uppercase tracking-[0.08em] text-ink-faint">
            This device
          </h2>
          <p className="mb-3 text-[0.875rem] text-ink-soft">
            Remove every draft and entry stored in this browser. Cloud entries are not affected.
          </p>
          {confirmClear ? (
            <div className="rounded-xl border border-line bg-paper-raised p-4">
              <p className="text-[0.9375rem] text-ink">
                Clear all local data? This can&apos;t be undone.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={clearLocal}
                  className="min-h-11 rounded-full border border-danger px-5 text-[0.9375rem] text-danger"
                >
                  Clear local data
                </button>
                <GhostButton onClick={() => setConfirmClear(false)}>Cancel</GhostButton>
              </div>
            </div>
          ) : (
            <GhostButton onClick={() => setConfirmClear(true)} className="!text-danger/70">
              Clear local data…
            </GhostButton>
          )}
        </section>

        <p className="mt-10 text-[0.8125rem] leading-relaxed text-ink-faint">
          Privacy: worksheet content is never sent anywhere unless you explicitly choose
          “Save to cloud history.” Local saves and exports never leave this device. There
          are no analytics and no tracking.
        </p>
      </main>
    </div>
  );
}
