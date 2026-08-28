import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { useTheme } from "@/theme/ThemeProvider";
import { Label } from "@/components/ui/Text";
import { IconNow, IconGames, IconTrain, IconMe, type IconProps } from "@/icons";
import * as haptics from "@/lib/haptics";

const TABS: {
  name: string;
  label: string;
  Icon: React.ComponentType<IconProps>;
}[] = [
  { name: "index", label: "Now", Icon: IconNow },
  { name: "games", label: "Games", Icon: IconGames },
  { name: "train", label: "Train", Icon: IconTrain },
  { name: "me", label: "Me", Icon: IconMe },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false, animation: "shift" }}
      tabBar={(props) => <TabBar {...props} />}
    >
      {TABS.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.label }} />
      ))}
    </Tabs>
  );
}

/**
 * A hand-built tab bar rather than the default.
 *
 * Two reasons: the icons are our own and need to animate on selection, and the
 * whole bar has to be able to disappear when Gameday mode takes the screen —
 * which the stock bar fights.
 */
function TabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: insets.bottom + 6,
          backgroundColor: colors.ground,
          borderTopColor: colors.borderSoft,
        },
      ]}
    >
      {state.routes.map((route, i) => {
        const def = TABS.find((t) => t.name === route.name);
        if (!def) return null;
        const focused = state.index === i;

        return (
          <TabButton
            key={route.key}
            label={def.label}
            Icon={def.Icon}
            focused={focused}
            onPress={() => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                haptics.step();
                navigation.navigate(route.name);
              }
            }}
          />
        );
      })}
    </View>
  );
}

function TabButton({
  label,
  Icon,
  focused,
  onPress,
}: {
  label: string;
  Icon: React.ComponentType<IconProps>;
  focused: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const press = useSharedValue(0);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(focused ? 1.06 : 1, { damping: 15 }) },
      { translateY: withSpring(focused ? -1 : 0) },
      { scale: withSpring(1 - press.value * 0.1) },
    ],
  }));

  const pipStyle = useAnimatedStyle(() => ({
    opacity: withTiming(focused ? 1 : 0, { duration: 200 }),
    transform: [{ scale: withSpring(focused ? 1 : 0.4, { damping: 14 }) }],
  }));

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      onPressIn={() => (press.value = 1)}
      onPressOut={() => (press.value = 0)}
      onPress={onPress}
      style={styles.tab}
    >
      <Animated.View style={iconStyle}>
        <Icon
          size={25}
          color={focused ? colors.accent : colors.textFaint}
          strokeWidth={focused ? 2 : 1.7}
        />
      </Animated.View>

      <Label
        size={9}
        style={{ color: focused ? colors.accent : colors.textFaint, letterSpacing: 1.1 }}
      >
        {label}
      </Label>

      <Animated.View
        style={[
          styles.pip,
          pipStyle,
          { backgroundColor: colors.accent, shadowColor: colors.accent },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 2,
  },
  pip: {
    position: "absolute",
    bottom: -5,
    width: 4,
    height: 4,
    borderRadius: 2,
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
});
