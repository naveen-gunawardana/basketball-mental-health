"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-sm px-4 py-16 text-center text-muted-foreground">Loading…</div>}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // Carried through to the application step so mentorship CTAs can pre-select intent.
  const roleHint = searchParams.get("role") === "mentor" ? "mentor" : searchParams.get("role") === "player" ? "player" : null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const applyHref = roleHint ? `/apply?role=${roleHint}` : "/apply";

  // Supabase surfaces raw auth errors that mean nothing to a signup visitor
  // ("Email rate limit exceeded"). Map the ones users actually hit to copy that
  // tells them what to do next; anything unrecognised falls through as-is.
  function friendlyAuthError(message: string) {
    const m = message.toLowerCase();
    if (m.includes("rate limit") || m.includes("too many requests")) {
      return "We're sending more emails than usual right now. Wait a minute and try again — if it keeps happening, email hello@mentalitysports.com and we'll get you set up.";
    }
    if (m.includes("already registered") || m.includes("already been registered")) {
      return "That email already has an account. Try signing in instead, or reset your password if you've forgotten it.";
    }
    if (m.includes("invalid email") || (m.includes("email address") && m.includes("invalid"))) {
      return "That email address doesn't look right. Double-check it and try again.";
    }
    if (m.includes("password") && (m.includes("short") || m.includes("at least") || m.includes("weak"))) {
      return "Please pick a password with at least 6 characters.";
    }
    return message;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      setError(friendlyAuthError(error.message));
      setLoading(false);
      return;
    }

    setLoading(false);
    if (!data.session) {
      router.push("/verify-email");
    } else {
      router.push(applyHref);
      router.refresh();
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-6">
          <Logo href="/" size="md" variant="dark" />
        </div>
        <h1 className="text-2xl font-bold text-navy mb-1.5">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          One quick step to get in the door. You can apply to be matched, RSVP to sessions, and track courses once you&apos;re in.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Full name</label>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)} required
            placeholder="Your full name"
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            placeholder="your@email.com"
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
            placeholder="••••••••"
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-input accent-navy"
          />
          <span className="text-sm text-muted-foreground">
            I agree to the{" "}
            <a href="/terms" target="_blank" className="font-medium text-navy underline underline-offset-2 hover:text-orange-500 transition-colors">Terms of Service</a>
            {" "}and{" "}
            <a href="/privacy" target="_blank" className="font-medium text-navy underline underline-offset-2 hover:text-orange-500 transition-colors">Privacy Policy</a>
          </span>
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit" disabled={loading || !agreedToTerms}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Creating account…" : <>Create account <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <div className="mt-6 rounded-lg bg-offWhite border border-offWhite-300 p-4">
        <p className="text-xs font-semibold text-navy mb-2 flex items-center gap-1.5">
          <CheckCircle className="h-3.5 w-3.5 text-orange-500" /> What happens next
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          After you create your account, you can <strong className="text-navy/80">apply to the 1-on-1 mentorship program</strong> — that&apos;s where you tell us about yourself so we can match you (or, for mentors, review your application).
        </p>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/signin" className="font-medium text-navy hover:text-orange-500 transition-colors underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </div>
  );
}
