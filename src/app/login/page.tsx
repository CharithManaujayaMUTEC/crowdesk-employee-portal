"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

function LoginForm() {
  const { login, user, ready } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (ready && user) router.replace("/dashboard"); }, [ready, user, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      const requested = params.get("next");
      const next = requested && requested.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard";
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="login-screen">
    <div className="login-left">
      <div className="login-brand"><div className="brand-mark brand-mark-large"><Image src="/crow-logo.png" alt="Crow.lk logo" width={32} height={32} priority /></div><div className="brand-name brand-name-light">CROW<span>DESK</span></div></div>
      <div className="login-hero">
        <div className="eyebrow"><span className="eyebrow-line" /> YOUR WORKDAY, CONNECTED</div>
        <h1>Great work<br />starts <em>here.</em></h1>
        <p>One calm space to manage your day, stay connected with your team, and keep your work moving forward.</p>
        <div className="login-benefits"><div><span className="benefit-check">✓</span> Attendance & leave in one place</div><div><span className="benefit-check">✓</span> Tasks and team approvals</div><div><span className="benefit-check">✓</span> Your work information, always close</div></div>
      </div>
      <div className="login-left-foot"><span>© {new Date().getFullYear()} Crow.lk</span><span>Thoughtfully made for teams.</span></div>
      <div className="login-orb login-orb-one" /><div className="login-orb login-orb-two" />
    </div>
    <div className="login-right">
      <div className="login-card-wrap">
        <div className="login-mobile-brand"><div className="brand-mark"><Image src="/crow-logo.png" alt="Crow.lk logo" width={27} height={27} /></div><div className="brand-name">CROW<span>DESK</span></div></div>
        <div className="login-card-heading"><div className="login-kicker">WELCOME BACK</div><h2>Sign in to your space</h2><p>Use your Crow.lk work account to continue.</p></div>
        <form onSubmit={submit} className="login-form">
          <label htmlFor="email">Work email</label>
          <div className="input-wrap"><Mail size={18} /><input id="email" type="email" autoComplete="username" inputMode="email" maxLength={254} required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@crow.lk" /></div>
          <label htmlFor="password">Password</label>
          <div className="input-wrap"><LockKeyhole size={18} /><input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" maxLength={256} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" /><button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          {error && <div className="alert-error" role="alert">{error}</div>}
          <button className="primary-button login-submit" type="submit" disabled={busy}>{busy ? <><span className="button-spinner" /> Signing you in…</> : <>Sign in <span>→</span></>}</button>
        </form>
        <div className="login-secure-note"><ShieldCheck size={17} /><span>Your session is protected. Never share your password or sign-in token.</span></div>
        <div className="login-help">Having trouble signing in? Contact your system administrator.</div>
      </div>
      <div className="login-right-foot">CROW.LK <span>•</span> EMPLOYEE WORKSPACE</div>
    </div>
  </main>;
}

import { Suspense } from "react";
export default function LoginPage() {
  return <Suspense fallback={<div className="loading-screen"><div className="spinner" /></div>}><LoginForm /></Suspense>;
}
