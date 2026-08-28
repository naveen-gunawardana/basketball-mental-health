import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

/**
 * Haptics are a second output channel here, not garnish.
 *
 * The breathing drills are the reason: an athlete on the bench can run a reset
 * with the phone face-down in their lap, pacing off the buzz alone. That only
 * works if the vocabulary stays consistent everywhere else in the app, so all
 * feedback routes through this module rather than calling expo-haptics direct.
 */

const enabled = Platform.OS !== "web";

/** One unit of change on a dial or pad. The lightest thing we have. */
export function tick() {
  if (!enabled) return;
  Haptics.selectionAsync();
}

/** A step landed — routine advanced, chip selected, page turned. */
export function step() {
  if (!enabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** A real commitment — game saved, debrief filed, routine finished. */
export function commit() {
  if (!enabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/** Turn of the breath. Heavier on the inhale so the two are distinguishable. */
export function breathIn() {
  if (!enabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function breathOut() {
  if (!enabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** Reserved for the record moment. Rationed like the gold it ships with. */
export function record() {
  if (!enabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 90);
}

export function warn() {
  if (!enabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}
