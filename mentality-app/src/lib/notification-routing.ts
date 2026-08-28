import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";

/**
 * Routes a tapped notification to the screen it's about.
 *
 * Every send carries `data.route`. Without this the debrief nudge — the single
 * highest-value notification in the product — would drop the athlete on the
 * home screen and make them go find it, which is exactly the friction the
 * notification existed to remove.
 *
 * `useLastNotificationResponse` covers both cases: a tap while the app is
 * running, and a cold start from the notification itself.
 *
 * This lives in its own file because the underlying native module has no web
 * implementation and throws on call. A hook can't be called conditionally, so
 * the split is at the module level — `notification-routing.web.ts` is the
 * no-op Metro picks up for the browser.
 */
export function useNotificationRouting() {
  const response = Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!response) return;

    // The same response object is served until another arrives, so without a
    // guard any re-render would re-navigate.
    const id = response.notification.request.identifier;
    if (handled.current === id) return;

    const route = response.notification.request.content.data?.route;
    if (typeof route !== "string" || !route.startsWith("/")) return;

    handled.current = id;
    router.push(route as never);
  }, [response, router]);
}
