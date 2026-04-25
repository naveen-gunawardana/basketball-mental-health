export const REFLECTION_PROMPTS: string[] = [
  "What's one thing that surprised you this week",
  "What did you avoid today, and why",
  "When did you feel most like yourself out there",
  "What's something you're not proud of from this week",
  "What's a question you can't stop asking yourself",
  "If you could redo one moment from this week, which one",
  "What's draining you right now",
  "What gave you energy this week",
  "What's a story you're telling yourself that might not be true",
  "What did your body tell you today that your head ignored",
];

export const MOODS: Array<{ key: string; emoji: string; label: string }> = [
  { key: "fired_up", emoji: "🔥", label: "Fired up" },
  { key: "locked_in", emoji: "😎", label: "Locked in" },
  { key: "frustrated", emoji: "😤", label: "Frustrated" },
  { key: "drained", emoji: "😴", label: "Drained" },
  { key: "stuck", emoji: "😶‍🌫️", label: "Stuck" },
];

export function moodFor(key: string | null | undefined) {
  if (!key) return null;
  return MOODS.find(m => m.key === key) ?? null;
}

export function pickReflectionPrompts(count = 5): string[] {
  const a = [...REFLECTION_PROMPTS];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, count);
}
