"use client";

import { FormEvent, useState } from "react";

const OWNER_EMAIL = "ethiopages@gmail.com";
const PASSWORD_SHA256 = "f7f8c4d0894c871c99459e25745dabeed4ffdba3e25e37ee3aacd8ab627a97e3";

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (email.trim().toLowerCase() !== OWNER_EMAIL || await sha256(password) !== PASSWORD_SHA256) {
      setError("The owner email or password is incorrect.");
      return;
    }
    sessionStorage.setItem("ethiopages-owner-session", "active");
    window.location.href = "/admin";
  };

  return <main className="auth-page"><div className="auth-card"><a className="brand" href="/"><span className="brand-mark">E</span><span>Ethio<span>Pages</span></span></a><span className="kicker">Owner access</span><h1>Welcome back.</h1><p>Sign in to manage EthioPages listings.</p><form onSubmit={submit}><label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required /></label><label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>{error && <div className="auth-error">{error}</div>}<button className="cta-button" type="submit">Sign in <span>↗</span></button></form><a className="text-link" href="/">← Back to EthioPages</a></div></main>;
}
