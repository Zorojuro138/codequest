"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const isSignup = mode === "signup";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Add your Supabase URL and anon key to .env.local to turn on accounts.");
      return;
    }

    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const result = isSignup
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    setBusy(false);
    setMessage(result.error?.message ?? (isSignup ? "Check your email to confirm your account." : "You’re in! Your learning journey starts now."));
  }

  async function signInWithGoogle() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Add your Supabase URL and anon key to .env.local to turn on accounts.");
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setMessage(error.message);
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label htmlFor="email">Email address</label>
      <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} minLength={8} placeholder="At least 8 characters" required />
      <button className="button button-primary auth-submit" disabled={busy} type="submit">
        {busy ? "One sec…" : isSignup ? "Create my free account" : "Log in"}
      </button>
      <div className="auth-divider"><span>or</span></div>
      <button className="button button-google" onClick={signInWithGoogle} type="button">
        <span className="google-g" aria-hidden="true">G</span> Continue with Google
      </button>
      {message && <p className="auth-message" role="status">{message}</p>}
      <p className="auth-switch">
        {isSignup ? "Already have an account? " : "New around here? "}
        <Link href={isSignup ? "/login" : "/signup"}>{isSignup ? "Log in" : "Sign up free"}</Link>
      </p>
    </form>
  );
}
