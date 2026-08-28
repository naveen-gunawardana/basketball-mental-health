import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";

/**
 * Segmented progress. One bar per step rather than a single filling line, so
 * the athlete can see exactly how many questions are left — the honest version
 * of "almost there".
 */
export function Progress({ step, total }: { step: number; total: number }) {
  const { space } = useTheme();
  return (
    <View style={[styles.row, { gap: 4, paddingHorizontal: space.lg }]}>
      {Array.from({ length: total }).map((_, i) => (
        <Segment key={i} active={i <= step} current={i === step} />
      ))}
    </View>
  );
}

function Segment({ active, current }: { active: boolean; current: boolean }) {
  const { colors } = useTheme();

  const style = useAnimatedStyle(() => ({
    backgroundColor: withTiming(active ? colors.accent : colors.borderSoft, {
      duration: 320,
    }),
    transform: [{ scaleY: withSpring(current ? 1.9 : 1, { damping: 16 }) }],
    opacity: withTiming(active ? 1 : 0.7, { duration: 240 }),
  }));

  return <Animated.View style={[styles.seg, style]} />;
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  seg: { flex: 1, height: 3, borderRadius: 2 },
});
