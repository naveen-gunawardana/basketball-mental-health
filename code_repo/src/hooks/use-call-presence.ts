"use client";

import { useState } from "react";

export function useCallPresence(matchId: string | null) {
  const [showPostCallBanner, setShowPostCallBanner] = useState(false);

  function startCall() {
    if (!matchId) return;
    window.open(`https://meet.jit.si/mentality-${matchId.replace(/-/g, "").slice(0, 20)}`, "_blank");
    setShowPostCallBanner(true);
  }

  function dismissPostCallBanner() {
    setShowPostCallBanner(false);
  }

  return { startCall, showPostCallBanner, dismissPostCallBanner };
}
