"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shown when a 1-month / 4-session program is complete. Lets either side request
 * their certificate — mentors get a Certificate of Mentorship (which compounds
 * into a downloadable transcript over multiple mentorships), athletes get a
 * Certificate of Completion. The request emails the team, who issue and send it.
 */
export function CertificateRequest({
  userId,
  role,
  matchId,
  programInfo,
  className = "",
}: {
  userId: string;
  role: "mentor" | "mentee";
  matchId: string;
  programInfo?: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const isMentor = role === "mentor";
  const storageKey = `cert_req_${role}_${matchId}`;

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey) === "1") setState("done");
    } catch {}
  }, [storageKey]);

  async function request() {
    setState("loading");
    try {
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "certificate_request", userId, role, programInfo }),
      });
    } catch {}
    try {
      localStorage.setItem(storageKey, "1");
    } catch {}
    setState("done");
  }

  return (
    <div className={`rounded-lg border-2 border-orange-200 bg-orange-50 p-5 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 shrink-0">
          <Award className="h-5 w-5 text-orange-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-navy">
            {isMentor ? "Program complete — claim your Certificate of Mentorship" : "You finished the program 🎉"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {isMentor
              ? "You guided an athlete through all 4 sessions. Request your certificate and we'll email it to you. Every mentorship you complete adds to your transcript."
              : "All 4 sessions done. Request your Certificate of Completion and we'll email it to you."}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            {state === "done" ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-sage-700">
                <Check className="h-4 w-4" /> Requested — we&apos;ll email it to you
              </span>
            ) : (
              <Button onClick={request} disabled={state === "loading"} variant="secondary">
                <Award className="h-4 w-4 mr-1.5" />
                {state === "loading" ? "Requesting…" : "Request certificate"}
              </Button>
            )}

            {isMentor && (
              <Button asChild variant="outline">
                <Link href="/dashboard/mentor/transcript">
                  <FileText className="h-4 w-4 mr-1.5" /> View transcript
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
