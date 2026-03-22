"use client";

export function useCallPresence(matchId: string | null) {
  function startCall() {
    if (!matchId) return;
    window.open(`https://meet.jit.si/mentality-${matchId.replace(/-/g, "").slice(0, 20)}`, "_blank");
  }

  return { startCall };
}
