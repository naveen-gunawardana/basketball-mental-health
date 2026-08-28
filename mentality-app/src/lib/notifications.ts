import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { push } from "./api";

/**
 * Push registration.
 *
 * The scheduling itself lives on the server (three Vercel crons, described in
 * the plan) because the cap has to be enforced somewhere the app can't
 * bypass: three notifications per game, one per non-game day, and every one
 * tied to a moment in the arc. There is no "we miss you" send, ever.
 *
 * Teenagers turn notifications off permanently the first time an app wastes
 * one, and there's no getting that permission back.
 */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function registerForPush(): Promise<string | null> {
  if (Platform.OS === "web") return null;

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;

  if (status !== "granted") {
    const asked = await Notifications.requestPermissionsAsync();
    status = asked.status;
  }
  if (status !== "granted") return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("gameday", {
      name: "Game reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 180],
      lightColor: "#C4633A",
    });
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants as unknown as { easConfig?: { projectId?: string } }).easConfig?.projectId;

  // This throws in three real situations: no EAS project id configured, running
  // inside Expo Go (remote push was removed there in SDK 53), and a flaky
  // network on a real device. None of them should take down the screen that
  // called us — returning null lets the caller say "we couldn't turn these on"
  // and move on.
  let token: string;
  try {
    token = (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined))
      .data;
  } catch (err) {
    console.warn("[gameday] Couldn't get a push token:", err);
    return null;
  }

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  await push.register(token, Platform.OS === "ios" ? "ios" : "android", tz).catch(() => {
    // The token is worth having even if the server is briefly unreachable —
    // the next app launch re-registers it.
  });

  return token;
}

export async function unregisterPush() {
  if (Platform.OS === "web") return;
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const token = (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined))
      .data;
    await push.unregister(token);
  } catch {
    // Signing out matters more than cleanly dropping the token; the server
    // prunes tokens that start failing to deliver.
  }
}

/**
 * The one locally-scheduled notification: the post-game debrief nudge.
 *
 * It's local because it has to fire ninety minutes after a game that may have
 * ended in a gym with no signal, and because that's the highest-value moment
 * in the whole product — it can't depend on a round trip.
 */
export async function scheduleDebriefNudge(
  gameId: string,
  endsAt: Date,
  opponent: string | null,
) {
  if (Platform.OS === "web") return;

  const fireAt = new Date(endsAt.getTime() + 90 * 60 * 1000);
  if (fireAt.getTime() <= Date.now()) return;

  await Notifications.scheduleNotificationAsync({
    identifier: `debrief:${gameId}`,
    content: {
      title: opponent ? `${opponent} — before you sleep on it` : "Before you sleep on it",
      body: "Ninety seconds. Rate the performance, not the result.",
      data: { route: `/debrief/${gameId}` },
      categoryIdentifier: "gameday",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireAt,
      channelId: "gameday",
    },
  });
}

export async function cancelDebriefNudge(gameId: string) {
  if (Platform.OS === "web") return;
  await Notifications.cancelScheduledNotificationAsync(`debrief:${gameId}`).catch(() => {});
}

/**
 * Clears every scheduled nudge. Used when an athlete turns reminders off.
 *
 * Guarded like the rest: on web the underlying method is missing and throws
 * *synchronously*, so a trailing `.catch()` at the call site never runs.
 */
export async function cancelAllNudges() {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
}
