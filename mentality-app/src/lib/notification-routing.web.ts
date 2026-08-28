/**
 * Web has no notifications to route.
 *
 * Metro resolves this file instead of `notification-routing.ts` for the web
 * bundle. The native module behind `useLastNotificationResponse` throws the
 * moment it's called in a browser, and a hook can't be called conditionally —
 * so the branch has to happen at module resolution, not at runtime.
 */
export function useNotificationRouting() {
  // Intentionally empty.
}
