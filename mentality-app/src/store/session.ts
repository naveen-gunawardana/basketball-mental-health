import { create } from "zustand";

type SessionState = {
  /**
   * Games whose Gameday takeover the athlete has explicitly backed out of.
   *
   * Without this, NOW redirects into `/gameday/[id]` whenever the game is
   * inside four hours, and leaving the takeover lands back on NOW, which
   * redirects again — the athlete can't get to their log or their settings
   * during the exact window they're most likely to want them.
   *
   * Session-scoped on purpose. Killing the app and coming back an hour before
   * tip should put them straight back in Gameday mode; that's the whole idea.
   */
  leftGameday: Record<string, true>;
  leaveGameday: (gameId: string) => void;
  clearLeftGameday: (gameId: string) => void;
};

export const useSession = create<SessionState>((set) => ({
  leftGameday: {},

  leaveGameday: (gameId) =>
    set((s) => ({ leftGameday: { ...s.leftGameday, [gameId]: true } })),

  clearLeftGameday: (gameId) =>
    set((s) => {
      if (!s.leftGameday[gameId]) return s;
      const next = { ...s.leftGameday };
      delete next[gameId];
      return { leftGameday: next };
    }),
}));
