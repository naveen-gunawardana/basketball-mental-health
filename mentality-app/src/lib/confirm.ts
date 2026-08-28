import { Alert, Linking, Platform } from "react-native";

/**
 * A destructive-action confirmation that works on every platform.
 *
 * react-native-web ships `Alert.alert` as a literal no-op — `static alert() {}`
 * — so a native-only implementation means "Sign out" and "Delete this game"
 * silently do nothing in a browser, forever, with no error to notice. That's
 * worse than a crash, because nothing surfaces it.
 *
 * Resolves true if the athlete confirmed.
 */
export function confirmDestructive({
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
}: {
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
}): Promise<boolean> {
  if (Platform.OS === "web") {
    // `window.confirm` is blocking and plain, but it is real. Anything fancier
    // belongs in a proper in-app sheet, not in a cross-platform shim.
    const ok =
      typeof window !== "undefined" && typeof window.confirm === "function"
        ? window.confirm(message ? `${title}\n\n${message}` : title)
        : false;
    return Promise.resolve(ok);
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelLabel, style: "cancel", onPress: () => resolve(false) },
      { text: confirmLabel, style: "destructive", onPress: () => resolve(true) },
    ]);
  });
}

/**
 * Opens the OS settings page for the app.
 *
 * `Linking.openSettings` has no web implementation and throws when called, so
 * the caller gets told plainly instead — there's no browser equivalent of
 * "turn notifications back on for this app" that we could deep-link to.
 */
export async function openAppSettings(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    await Linking.openSettings();
    return true;
  } catch {
    return false;
  }
}
