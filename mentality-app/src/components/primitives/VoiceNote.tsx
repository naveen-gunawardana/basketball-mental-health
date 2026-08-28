import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Pressable, TextInput, StyleSheet } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import {
  useAudioRecorder,
  useAudioRecorderState,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  RecordingPresets,
} from "expo-audio";
import { useTheme } from "@/theme/ThemeProvider";
import { withAlpha } from "@/theme/tokens";
import { Body, Label, Stat } from "@/components/ui/Text";
import { IconMic, IconClose, IconCheck } from "@/icons";
import { voice as voiceApi } from "@/lib/api";
import * as haptics from "@/lib/haptics";

export type VoiceResult = {
  /** Local file uri. Uploaded and transcribed when there's a connection. */
  uri?: string;
  durationMs?: number;
  /** What the athlete ends up with, typed or transcribed. */
  text: string;
};

type Props = {
  value: VoiceResult;
  onChange: (v: VoiceResult) => void;
  placeholder?: string;
  caption?: string;
  /** Rendered when the athlete hasn't started. */
  prompt?: string;
  maxSeconds?: number;
};

/**
 * Voice — primitive 05.
 *
 * Thirty seconds of talking in the back of a car beats three sentences of
 * thumb-typing, and it catches tone the text never would. So the mic is the
 * default affordance and the keyboard is the alternative, not the other way
 * around.
 *
 * The recording stays on the device until the athlete keeps it. Transcription
 * is best-effort: if it fails, or there's no signal, the audio is still saved
 * and they can type instead. The transcript is always editable before anything
 * is written — a bad transcription of something private is worse than none.
 */
export function VoiceNote({
  value,
  onChange,
  placeholder = "Or type it",
  caption,
  prompt,
  maxSeconds = 120,
}: Props) {
  const { colors, space, radius } = useTheme();

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder, 200);

  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [mode, setMode] = useState<"idle" | "text">(value.text ? "text" : "idle");
  const [error, setError] = useState<string | null>(null);

  const ring = useSharedValue(0);
  const press = useSharedValue(0);
  const stopping = useRef(false);

  const elapsed = Math.floor((state.durationMillis ?? 0) / 1000);

  useEffect(() => {
    ring.value = recording
      ? withRepeat(
          withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
          -1,
          true,
        )
      : withTiming(0, { duration: 240 });
  }, [recording, ring]);

  const start = useCallback(async () => {
    setError(null);

    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      setError("Your phone is blocking the mic. You can type it instead.");
      setMode("text");
      haptics.warn();
      return;
    }

    try {
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      haptics.breathIn();
      setRecording(true);
    } catch {
      setError("Couldn't start recording. Type it instead.");
      setMode("text");
      haptics.warn();
    }
  }, [recorder]);

  const stop = useCallback(
    async (keep: boolean) => {
      // The auto-stop at the length cap can race the athlete tapping stop.
      if (stopping.current) return;
      stopping.current = true;

      const durationMs = state.durationMillis ?? 0;

      try {
        await recorder.stop();
      } catch {
        // Already stopped, or the session was interrupted by a call. Either
        // way there's nothing left to do here.
      }

      setRecording(false);
      // Hand the audio session back so other apps aren't left muted.
      await setAudioModeAsync({ allowsRecording: false }).catch(() => {});

      const uri = recorder.uri;

      if (!keep || !uri || durationMs < 700) {
        haptics.warn();
        stopping.current = false;
        return;
      }

      haptics.commit();
      onChange({ ...value, uri, durationMs });
      setMode("text");
      stopping.current = false;

      // Transcription is a convenience, not a requirement. A failure here
      // leaves the audio saved and the athlete typing, which is worse but not
      // broken — so it never surfaces as an error.
      setTranscribing(true);
      try {
        const result = await voiceApi.transcribe(uri);
        if (result.text.trim()) {
          onChange({ uri, durationMs, text: result.text.trim() });
        }
      } catch {
        // Offline, most likely. The recording is on the device either way.
      } finally {
        setTranscribing(false);
      }
    },
    [onChange, recorder, state.durationMillis, value],
  );

  // Length cap. Long enough that nobody bumps it in normal use.
  useEffect(() => {
    if (recording && elapsed >= maxSeconds) void stop(true);
  }, [recording, elapsed, maxSeconds, stop]);

  // Leaving the screen mid-recording shouldn't leave the mic hot.
  useEffect(
    () => () => {
      if (recorder.isRecording) {
        recorder.stop().catch(() => {});
        setAudioModeAsync({ allowsRecording: false }).catch(() => {});
      }
    },
    [recorder],
  );

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + ring.value * 0.35 }],
    opacity: 0.35 - ring.value * 0.28,
  }));

  const micStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1 - press.value * 0.06) }],
  }));

  return (
    <View style={{ gap: space.base }}>
      {caption && <Body size={15}>{caption}</Body>}

      {recording ? (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(160)}
          style={{
            backgroundColor: colors.accentSoft,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: withAlpha(colors.accent, 0.5),
            padding: space.lg,
            alignItems: "center",
            gap: space.base,
          }}
        >
          <Waveform color={colors.accent} metering={state.metering} />

          <Stat size={34} style={{ color: colors.accent }}>
            {format(elapsed)}
          </Stat>
          <Label size={10} tone="accent">
            Listening
          </Label>

          <View style={{ flexDirection: "row", gap: space.md, marginTop: space.xs }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Discard recording"
              onPress={() => void stop(false)}
              style={[styles.roundBtn, { borderColor: colors.border }]}
            >
              <IconClose size={20} color={colors.textMuted} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Keep recording"
              onPress={() => void stop(true)}
              style={[
                styles.roundBtn,
                { backgroundColor: colors.accent, borderColor: colors.accent },
              ]}
            >
              <IconCheck size={22} color={colors.accentText} strokeWidth={2.5} />
            </Pressable>
          </View>
        </Animated.View>
      ) : (
        <View style={{ alignItems: "center", gap: space.md }}>
          {prompt && mode === "idle" && (
            <Body size={14} tone="faint" align="center" style={{ maxWidth: 280 }}>
              {prompt}
            </Body>
          )}

          <View style={{ width: 96, height: 96, alignItems: "center", justifyContent: "center" }}>
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                ringStyle,
                { borderRadius: 48, backgroundColor: colors.accent },
              ]}
            />
            <Animated.View style={micStyle}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Record a voice note"
                onPressIn={() => (press.value = 1)}
                onPressOut={() => (press.value = 0)}
                onPress={() => void start()}
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 42,
                  backgroundColor: colors.accent,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: colors.accent,
                  shadowOpacity: 0.45,
                  shadowRadius: 20,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 6,
                }}
              >
                <IconMic size={34} color={colors.accentText} />
              </Pressable>
            </Animated.View>
          </View>

          <Label size={10} tone="faint">
            {value.uri ? "Recorded — tap to redo" : "Tap to talk"}
          </Label>
        </View>
      )}

      {error && (
        <Body size={13} tone="danger" align="center">
          {error}
        </Body>
      )}

      {/* The keyboard escape hatch. Always present, never the headline. */}
      {(mode === "text" || value.text.length > 0) && (
        <Animated.View entering={FadeIn.duration(200)}>
          {value.uri && (
            <Label size={10} tone={transcribing ? "faint" : "accent"} style={{ marginBottom: 6 }}>
              {transcribing
                ? "Writing it out…"
                : value.text
                  ? "Transcribed — edit anything that came out wrong"
                  : "Saved. Add anything you want in writing."}
            </Label>
          )}
          <TextInput
            multiline
            editable={!transcribing}
            value={value.text}
            onChangeText={(text) => onChange({ ...value, text })}
            placeholder={placeholder}
            placeholderTextColor={colors.textFaint}
            style={{
              minHeight: 96,
              backgroundColor: colors.surfaceAlt,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.border,
              padding: space.base,
              color: colors.text,
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              lineHeight: 22,
              textAlignVertical: "top",
              opacity: transcribing ? 0.5 : 1,
            }}
          />
        </Animated.View>
      )}

      {mode === "idle" && !value.text && !value.uri && (
        <Pressable
          accessibilityRole="button"
          onPress={() => setMode("text")}
          style={{ alignSelf: "center", paddingVertical: 6 }}
        >
          <Body size={13} tone="faint" weight="medium" style={{ textDecorationLine: "underline" }}>
            {placeholder}
          </Body>
        </Pressable>
      )}
    </View>
  );
}

/**
 * Fourteen bars. When the recorder reports metering they follow the athlete's
 * actual voice; without it (Android often doesn't) they fall back to
 * independent loops, which reads as "hearing you" rather than as a fake meter.
 */
function Waveform({ color, metering }: { color: string; metering?: number }) {
  // Metering is dBFS: roughly -60 (silence) to 0 (clipping).
  const level =
    typeof metering === "number" && Number.isFinite(metering)
      ? Math.max(0, Math.min(1, (metering + 60) / 60))
      : null;

  return (
    <View style={styles.wave}>
      {Array.from({ length: 14 }).map((_, i) => (
        <Bar key={i} index={i} color={color} level={level} />
      ))}
    </View>
  );
}

function Bar({
  index,
  color,
  level,
}: {
  index: number;
  color: string;
  level: number | null;
}) {
  const h = useSharedValue(0.25);

  useEffect(() => {
    if (level === null) return;
    // Bars away from the centre respond a little less, so the shape reads as a
    // waveform rather than fourteen identical bars.
    const falloff = 1 - Math.abs(index - 6.5) / 9;
    h.value = withTiming(Math.max(0.12, level * falloff * 1.35), { duration: 180 });
  }, [level, index, h]);

  useEffect(() => {
    if (level !== null) return;
    const dur = 420 + ((index * 137) % 360);
    h.value = withRepeat(
      withSequence(
        withTiming(0.35 + ((index * 53) % 65) / 100, {
          duration: dur,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(0.2, { duration: dur, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level === null]);

  const style = useAnimatedStyle(() => ({ height: `${h.value * 100}%` }));

  return (
    <Animated.View
      style={[{ width: 4, borderRadius: 2, backgroundColor: color, minHeight: 4 }, style]}
    />
  );
}

function format(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  wave: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    height: 52,
  },
  roundBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
