import React, { useState } from "react";
import { View, Pressable } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Body, Label } from "@/components/ui/Text";
import { Chips } from "@/components/primitives/Chips";
import { SportGlyph } from "@/icons/sports";
import { useSettings, useUpdateSettings } from "@/features/profile/queries";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/store/auth";
import {
  SPORTS,
  LEVELS,
  FOCUS_AREAS,
  getSport,
  type SportId,
  type FocusId,
} from "@/data/catalog";
import * as haptics from "@/lib/haptics";

export default function SportSettings() {
  const { colors, space, radius } = useTheme();
  const router = useRouter();
  const uid = useAuth((s) => s.user?.id);
  const { data: settings } = useSettings();
  const update = useUpdateSettings();

  const [sport, setSport] = useState<SportId>(settings?.primary_sport ?? "basketball");
  const [level, setLevel] = useState<string[]>(settings?.level ? [settings.level] : []);
  const [position, setPosition] = useState<string[]>(
    settings?.position ? [settings.position] : [],
  );
  const [focus, setFocus] = useState<FocusId[]>(settings?.focus_areas ?? []);

  const current = getSport(sport);

  const save = async () => {
    await update.mutateAsync({
      primary_sport: sport,
      level: level[0] ?? null,
      position: position[0] ?? null,
      focus_areas: focus,
    });
    // Keep the shared `profiles` row in step so the website shows the same sport.
    if (uid) await supabase.from("profiles").update({ sport: [sport] }).eq("id", uid);
    router.back();
  };

  const toggleFocus = (id: FocusId) => {
    const on = focus.includes(id);
    if (!on && focus.length >= 3) {
      haptics.warn();
      return;
    }
    haptics.step();
    setFocus(on ? focus.filter((f) => f !== id) : [...focus, id]);
  };

  return (
    <Screen
      nav="back"
      eyebrow="Settings"
      title="Your sport"
      footer={<Button label="Save" onPress={save} loading={update.isPending} />}
    >
      <View style={{ gap: space.md }}>
        <Label size={10}>Sport</Label>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: "2.75%", rowGap: 12 }}>
          {SPORTS.map((s) => {
            const selected = sport === s.id;
            return (
              <Pressable
                key={s.id}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={s.name}
                onPress={() => {
                  haptics.step();
                  setSport(s.id);
                  if (position[0] && !s.positions.includes(position[0])) setPosition([]);
                }}
                style={{
                  width: "31.5%",
                  aspectRatio: 0.92,
                  borderRadius: radius.lg,
                  borderWidth: selected ? 2 : 1,
                  borderColor: selected ? colors.accent : colors.border,
                  backgroundColor: selected ? colors.accentSoft : colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  paddingHorizontal: 6,
                }}
              >
                <SportGlyph
                  sport={s.id}
                  size={32}
                  color={selected ? colors.accent : colors.textMuted}
                  strokeWidth={selected ? 1.9 : 1.5}
                />
                <Body
                  size={11.5}
                  align="center"
                  weight={selected ? "semi" : "medium"}
                  style={{ color: selected ? colors.accent : colors.textMuted, lineHeight: 14 }}
                >
                  {s.name}
                </Body>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Chips caption="Level" options={LEVELS} value={level} onChange={setLevel} single />

      {current.positions.length > 0 && (
        <Animated.View entering={FadeIn.duration(280)}>
          <Chips
            caption="Position"
            options={current.positions}
            value={position}
            onChange={setPosition}
            allowCustom
            single
          />
        </Animated.View>
      )}

      <View style={{ gap: space.md }}>
        <Label size={10}>What you're working on — up to three</Label>
        <View style={{ gap: space.sm }}>
          {FOCUS_AREAS.map((f) => {
            const selected = focus.includes(f.id);
            return (
              <Pressable
                key={f.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`${f.label}. ${f.detail}`}
                onPress={() => toggleFocus(f.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: space.base,
                  padding: space.base,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: selected ? colors.accent : colors.border,
                  backgroundColor: selected ? colors.accentSoft : colors.surface,
                  opacity: !selected && focus.length >= 3 ? 0.45 : 1,
                }}
              >
                <View style={{ flex: 1, gap: 1 }}>
                  <Body
                    size={15}
                    weight="semi"
                    style={{ color: selected ? colors.accent : colors.text }}
                  >
                    {f.label}
                  </Body>
                  <Body size={12.5} tone="faint">
                    {f.detail}
                  </Body>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}
