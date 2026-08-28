import React, { useMemo } from "react";
import { View, Pressable, Linking } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/theme/ThemeProvider";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Card, Divider, StatTile, Well } from "@/components/ui/Card";
import { Body, Heading, Label } from "@/components/ui/Text";
import { ChipList } from "@/components/primitives/Chips";
import {
  IconArrowRight,
  IconMentor,
  IconRecord,
  IconSupport,
  IconPressure,
} from "@/icons";
import { SportGlyph } from "@/icons/sports";
import { useDebriefs, useGames } from "@/features/games/queries";
import { useSettings, useProfile, useMentorMatch } from "@/features/profile/queries";
import { insights as insightsApi, type Insight } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { unregisterPush } from "@/lib/notifications";
import { confirmDestructive } from "@/lib/confirm";
import { CRISIS, FOCUS_AREAS, getSport } from "@/data/catalog";

/**
 * Me — what the season is telling the athlete about themselves, plus the parts
 * of the app that aren't about one game.
 */
export default function Me() {
  const { colors, space } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ support?: string }>();

  const { data: profile } = useProfile();
  const { data: settings } = useSettings();
  const { data: games = [] } = useGames();
  const { data: debriefs = [] } = useDebriefs();
  const { data: match } = useMentorMatch();
  const signOut = useAuth((s) => s.signOut);

  const played = games.filter((g) => g.status === "complete").length;

  // Insights are computed server-side with a hard sample threshold. A
  // confident claim from four data points would poison trust in the feature,
  // so nothing publishes under six games.
  const { data: insightData } = useQuery({
    queryKey: ["insights"],
    enabled: played >= 6,
    staleTime: 60 * 60 * 1000,
    queryFn: () => insightsApi.list(),
    retry: 1,
  });

  const stats = useMemo(() => {
    if (!debriefs.length) return null;
    const avg = debriefs.reduce((s, d) => s + d.performance, 0) / debriefs.length;
    const withRoutine = debriefs.filter((d) => d.routine_followed);
    const without = debriefs.filter((d) => d.routine_followed === false);
    const routineLift =
      withRoutine.length >= 2 && without.length >= 2
        ? withRoutine.reduce((s, d) => s + d.performance, 0) / withRoutine.length -
          without.reduce((s, d) => s + d.performance, 0) / without.length
        : null;
    return { avg, routineLift, best: Math.max(...debriefs.map((d) => d.performance)) };
  }, [debriefs]);

  const sport = getSport(settings?.primary_sport);

  const confirmSignOut = async () => {
    const ok = await confirmDestructive({
      title: "Sign out?",
      message: "Your log stays on your account.",
      confirmLabel: "Sign out",
    });
    if (!ok) return;

    await unregisterPush();
    await signOut();
    router.replace("/");
  };

  return (
    <Screen eyebrow={profile?.name ?? "Your season"} title="Me">
      {/* Identity strip */}
      <Animated.View entering={FadeInDown.duration(380)}>
        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.base }}>
            <View
              style={{
                width: 54,
                height: 54,
                borderRadius: 27,
                backgroundColor: colors.accentSoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SportGlyph sport={sport.id} size={27} color={colors.accent} strokeWidth={1.8} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Heading size={18}>{profile?.name ?? "Athlete"}</Heading>
              <Label size={9.5} tone="faint">
                {[sport.name, settings?.level, settings?.position].filter(Boolean).join(" · ")}
              </Label>
            </View>
            {settings?.anchor_word && (
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 999,
                  backgroundColor: colors.calmSoft,
                }}
              >
                <Label size={10} tone="calm">
                  {settings.anchor_word}
                </Label>
              </View>
            )}
          </View>
        </Card>
      </Animated.View>

      {/* Numbers */}
      <View style={{ flexDirection: "row", gap: space.sm }}>
        <StatTile value={String(played)} label="Logged" />
        <StatTile
          value={stats ? stats.avg.toFixed(1) : "—"}
          label="Avg"
          tone={stats ? "accent" : "default"}
        />
        <StatTile
          value={stats ? String(stats.best) : "—"}
          label="Best"
          tone={stats ? "record" : "default"}
        />
      </View>

      {/* Insights */}
      <View style={{ gap: space.md }}>
        <Label>What the season says</Label>

        {played < 6 ? (
          <Card accent="calm">
            <View style={{ gap: space.sm }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
                <IconPressure size={19} color={colors.calm} />
                <Label size={10} tone="calm">
                  {6 - played} more {6 - played === 1 ? "game" : "games"}
                </Label>
              </View>
              <Body size={14}>
                Around six logged games there's enough to say something real about how you
                play. Anything sooner would be a guess dressed up as a fact.
              </Body>

              <View style={{ flexDirection: "row", gap: 4, marginTop: 4 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <View
                    key={i}
                    style={{
                      flex: 1,
                      height: 5,
                      borderRadius: 3,
                      backgroundColor: i < played ? colors.calm : colors.borderSoft,
                    }}
                  />
                ))}
              </View>
            </View>
          </Card>
        ) : insightData?.insights?.length ? (
          insightData.insights.map((ins, i) => (
            <Animated.View key={ins.id} entering={FadeInDown.delay(i * 60).duration(360)}>
              <InsightCard insight={ins} />
            </Animated.View>
          ))
        ) : (
          <Card>
            <Body size={14} tone="faint">
              {stats?.routineLift && Math.abs(stats.routineLift) >= 0.8
                ? `You rate yourself ${Math.abs(stats.routineLift).toFixed(1)} points ${
                    stats.routineLift > 0 ? "higher" : "lower"
                  } in games where you finished your warmup.`
                : "Nothing solid yet. Keep logging — the patterns show up whether you're looking for them or not."}
            </Body>
          </Card>
        )}
      </View>

      {/* Season recap */}
      {played >= 8 && (
        <Animated.View entering={FadeIn.duration(400)}>
          <Card accent="record" onPress={() => router.push("/recap")}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: space.base }}>
              <IconRecord size={26} color={colors.record} />
              <View style={{ flex: 1, gap: 2 }}>
                <Label tone="record">Season recap</Label>
                <Body size={14} tone="faint">
                  Everything this season did to your head, on one card.
                </Body>
              </View>
              <IconArrowRight size={17} color={colors.record} />
            </View>
          </Card>
        </Animated.View>
      )}

      {/* Mentorship — at the edge on purpose */}
      {match && (
        <Card onPress={() => Linking.openURL("https://mentalitysports.org/dashboard/player")}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.base }}>
            <IconMentor size={24} color={colors.calm} />
            <View style={{ flex: 1, gap: 2 }}>
              <Label size={9.5} tone="calm">
                Your mentor
              </Label>
              <Heading size={17}>{match.profiles?.name ?? "Matched"}</Heading>
              <Body size={12.5} tone="faint">
                Messages and calls live on the Mentality site.
              </Body>
            </View>
            <IconArrowRight size={16} color={colors.textFaint} />
          </View>
        </Card>
      )}

      {/* Focus areas */}
      {!!settings?.focus_areas?.length && (
        <View style={{ gap: space.sm }}>
          <Label>What you're working on</Label>
          <ChipList
            items={settings.focus_areas
              .map((f) => FOCUS_AREAS.find((x) => x.id === f)?.label)
              .filter((x): x is string => !!x)}
            tone="calm"
          />
        </View>
      )}

      {/* Support — always here, highlighted if we were sent here for it */}
      <Animated.View entering={params.support ? FadeIn.duration(300) : undefined}>
        <Well tone={params.support ? "accent" : "calm"}>
          <View style={{ gap: space.sm }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
              <IconSupport size={19} color={params.support ? colors.accent : colors.calm} />
              <Label size={10} tone={params.support ? "accent" : "calm"}>
                If it's bigger than a game
              </Label>
            </View>
            <Body size={14}>{CRISIS.note}</Body>

            <View style={{ gap: space.sm, marginTop: 4 }}>
              <Button
                label={`Call ${CRISIS.line}`}
                variant="secondary"
                size="md"
                onPress={() => Linking.openURL(`tel:${CRISIS.line}`)}
              />
              <Button
                label={CRISIS.text}
                variant="secondary"
                size="md"
                onPress={() => Linking.openURL("sms:741741&body=HOME")}
              />
            </View>
          </View>
        </Well>
      </Animated.View>

      {/* Settings */}
      <View style={{ gap: space.sm }}>
        <Label>Settings</Label>
        <Card padded={false}>
          <SettingRow label="Notifications" value={settings?.notifications_opt_in ? "On" : "Off"} onPress={() => router.push("/settings/notifications")} />
          <Divider inset={16} />
          <SettingRow label="Your word" value={settings?.anchor_word ?? "Not set"} onPress={() => router.push("/settings/anchor")} />
          <Divider inset={16} />
          <SettingRow label="Sport and level" value={sport.name} onPress={() => router.push("/settings/sport")} />
          <Divider inset={16} />
          <SettingRow label="Privacy" value="" onPress={() => Linking.openURL("https://mentalitysports.org/privacy")} />
        </Card>
      </View>

      <Pressable onPress={() => void confirmSignOut()} style={{ alignSelf: "center", paddingVertical: space.base }}>
        <Body size={14} tone="danger" weight="medium">
          Sign out
        </Body>
      </Pressable>

      <Body size={11} tone="faint" align="center" style={{ paddingBottom: space.lg }}>
        Gameday by Mentality Sports. A performance tool, not medical care.
      </Body>
    </Screen>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const { colors, space } = useTheme();
  return (
    <Card accent="accent">
      <View style={{ gap: space.sm }}>
        <Label tone="accent">{insight.title}</Label>
        <Body size={15} style={{ color: colors.text }}>
          {insight.body}
        </Body>
        <Label size={9} tone="faint">
          From {insight.sample_size} games
        </Label>
      </View>
    </Card>
  );
}

function SettingRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  const { colors, space } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}${value ? `, ${value}` : ""}`}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: space.md,
        paddingHorizontal: space.base,
        paddingVertical: 15,
      }}
    >
      <Body size={15} weight="medium" style={{ flex: 1, color: colors.text }}>
        {label}
      </Body>
      {!!value && (
        <Body size={14} tone="faint">
          {value}
        </Body>
      )}
      <IconArrowRight size={15} color={colors.textFaint} />
    </Pressable>
  );
}

