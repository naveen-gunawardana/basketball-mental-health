"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase automatically exchanges the token from the URL hash on load
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setErrorMsg("Passwords don't match."); return; }
    if (password.length < 8) { setErrorMsg("Password must be at least 8 characters."); return; }
    setErrorMsg("");
    setStatus("loading");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("done");
      setTimeout(() => router.push("/dashboard"), 2000);
    }
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-sm px-4 py-20 text-center">
        <p className="text-muted-foreground text-sm">Verifying your reset link...</p>
        <p className="text-xs text-muted-foreground mt-2">If nothing happens, the link may have expired. <a href="/signin" className="underline text-navy">Request a new one.</a></p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-navy mb-2">New Password</h1>
        <p className="text-sm text-muted-foreground">Choose a strong password for your account.</p>
      </div>

      {status === "done" ? (
        <div className="rounded-lg bg-sage-50 border border-sage-200 p-5 text-center">
          <p className="font-medium text-sage-700">Password updated!</p>
          <p className="text-sm text-sage-600 mt-1">Redirecting you to your dashboard...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="••••••••"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full inline-flex items-center justify-center rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy/90 transition-colors disabled:opacity-50"
          >
            {status === "loading" ? "Updating..." : "Update Password"}
          </button>
        </form>
      )}
    </div>
  );
}
