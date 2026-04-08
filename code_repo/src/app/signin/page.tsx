"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setForgotStatus("sending");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail }),
    });
    setForgotStatus(res.ok ? "sent" : "error");
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-6">
          <Logo href="/" size="md" variant="dark" />
        </div>
        <h1 className="text-2xl font-bold text-navy mb-1.5">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account.
        </p>
      </div>

      {!showForgot ? (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-foreground">Password</label>
                <button
                  type="button"
                  onClick={() => { setShowForgot(true); setForgotEmail(email); }}
                  className="text-xs text-navy/60 hover:text-navy transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-navy hover:text-orange-500 transition-colors underline underline-offset-2">
              Sign up
            </Link>
          </p>
        </>
      ) : (
        <>
          <div className="mb-6 text-center">
            <p className="text-sm text-muted-foreground">Enter your email and we&apos;ll send you a reset link.</p>
          </div>

          {forgotStatus === "sent" ? (
            <div className="rounded-lg bg-sage-50 border border-sage-200 p-5 text-center mb-4">
              <p className="font-medium text-sage-700">Check your email</p>
              <p className="text-sm text-sage-600 mt-1">We sent a password reset link to {forgotEmail}.</p>
              <p className="text-xs text-sage-500 mt-2">Don&apos;t see it? Check your spam folder.</p>
            </div>
          ) : (
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              {forgotStatus === "error" && <p className="text-sm text-red-500">Something went wrong. Try again.</p>}
              <button
                type="submit"
                disabled={forgotStatus === "sending"}
                className="w-full inline-flex items-center justify-center rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy/90 transition-colors disabled:opacity-50"
              >
                {forgotStatus === "sending" ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() => { setShowForgot(false); setForgotStatus("idle"); }}
            className="mt-4 w-full text-center text-sm text-navy/60 hover:text-navy transition-colors"
          >
            Back to sign in
          </button>
        </>
      )}
    </div>
  );
}
