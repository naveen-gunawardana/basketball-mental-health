import type { StepKind } from "@/components/primitives/Runner";
import { PATTERNS, type BreathPattern } from "@/components/primitives/Breath";

/**
 * Everything the athlete picks from.
 *
 * The chip lists here are the product. Blank fields are where check-ins go to
 * die, so every question in the app ships with the answers athletes actually
 * give — written in their words, not a clinician's. When something isn't on
 * the list they can add it, and their own wording gets remembered.
 */

/* ── Sports ─────────────────────────────────────────────────────────────── */

export type SportId =
  | "basketball"
  | "soccer"
  | "football"
  | "volleyball"
  | "baseball"
  | "track"
  | "swimming"
  | "tennis"
  | "lacrosse"
  | "wrestling"
  | "hockey"
  | "golf"
  | "other";

export type Sport = {
  id: SportId;
  name: string;
  /** What a competition is called. Drives copy everywhere. */
  eventWord: string;
  /** The mid-competition break, if there is one. */
  breakWord: string | null;
  /** Position prompts. Empty means the app skips the position step. */
  positions: readonly string[];
};

export const SPORTS: readonly Sport[] = [
  {
    id: "basketball",
    name: "Basketball",
    eventWord: "Game",
    breakWord: "Halftime",
    positions: ["Guard", "Wing", "Forward", "Center", "Sixth man"],
  },
  {
    id: "soccer",
    name: "Soccer",
    eventWord: "Match",
    breakWord: "Halftime",
    positions: ["Keeper", "Defender", "Midfield", "Forward"],
  },
  {
    id: "football",
    name: "Football",
    eventWord: "Game",
    breakWord: "Halftime",
    positions: ["QB", "Skill", "Line", "Defense", "Special teams"],
  },
  {
    id: "volleyball",
    name: "Volleyball",
    eventWord: "Match",
    breakWord: "Between sets",
    positions: ["Setter", "Outside", "Middle", "Libero", "Opposite"],
  },
  {
    id: "baseball",
    name: "Baseball / Softball",
    eventWord: "Game",
    breakWord: "Between innings",
    positions: ["Pitcher", "Catcher", "Infield", "Outfield"],
  },
  { id: "track", name: "Track & Field", eventWord: "Meet", breakWord: null, positions: ["Sprints", "Distance", "Jumps", "Throws", "Hurdles"] },
  { id: "swimming", name: "Swimming", eventWord: "Meet", breakWord: null, positions: ["Sprint", "Distance", "IM", "Relay"] },
  { id: "tennis", name: "Tennis", eventWord: "Match", breakWord: "Changeover", positions: ["Singles", "Doubles"] },
  { id: "lacrosse", name: "Lacrosse", eventWord: "Game", breakWord: "Halftime", positions: ["Attack", "Midfield", "Defense", "Goalie"] },
  { id: "wrestling", name: "Wrestling", eventWord: "Match", breakWord: "Between periods", positions: [] },
  { id: "hockey", name: "Hockey", eventWord: "Game", breakWord: "Intermission", positions: ["Forward", "Defense", "Goalie"] },
  { id: "golf", name: "Golf", eventWord: "Round", breakWord: "The turn", positions: [] },
  { id: "other", name: "Something else", eventWord: "Competition", breakWord: "The break", positions: [] },
] as const;

export function getSport(id: SportId | undefined): Sport {
  return SPORTS.find((s) => s.id === id) ?? SPORTS[0];
}

/* ── Level ──────────────────────────────────────────────────────────────── */

export const LEVELS = [
  "Middle school",
  "JV",
  "Varsity",
  "Club / travel",
  "College",
  "Just play",
] as const;

/* ── What they're here for ──────────────────────────────────────────────── */

export type FocusId =
  | "pressure"
  | "confidence"
  | "mistakes"
  | "focus"
  | "coach"
  | "comparison"
  | "identity"
  | "motivation"
  | "injury"
  | "sleep";

export const FOCUS_AREAS: readonly {
  id: FocusId;
  label: string;
  /** How the athlete would describe it, not how a textbook would. */
  detail: string;
}[] = [
  { id: "pressure", label: "Big moments", detail: "I tighten up when it matters" },
  { id: "mistakes", label: "Shaking mistakes", detail: "One bad play lives in my head all game" },
  { id: "confidence", label: "Confidence", detail: "I don't trust myself out there" },
  { id: "focus", label: "Staying locked in", detail: "My head drifts — crowd, bench, scoreboard" },
  { id: "coach", label: "Coach stuff", detail: "Getting yelled at wrecks me" },
  { id: "comparison", label: "Comparing myself", detail: "I measure against everyone else" },
  { id: "identity", label: "Who I am off the court", detail: "A bad game ruins my whole week" },
  { id: "motivation", label: "Wanting it again", detail: "I've stopped loving this" },
  { id: "injury", label: "Coming back", detail: "I'm not the same since I got hurt" },
  { id: "sleep", label: "Sleep before games", detail: "I lie there running it over" },
] as const;

/* ── Anchor words ───────────────────────────────────────────────────────── */

/**
 * The word an athlete returns to after a mistake. Short, physical, and about
 * what to *do* rather than what to stop doing — "breathe" works, "don't panic"
 * doesn't, because the mind can't act on a negation under load.
 */
export const ANCHOR_WORDS = [
  "Next",
  "Breathe",
  "Feet",
  "Now",
  "Hunt",
  "Loose",
  "Simple",
  "Attack",
  "Reset",
  "Mine",
  "Flush it",
  "Play free",
] as const;

/* ── Controllables ──────────────────────────────────────────────────────── */

export const CONTROLLABLES = [
  "My effort on defense",
  "Talking on the floor",
  "First to the loose ball",
  "How I react to a bad call",
  "Being a good teammate on the bench",
  "Running back every time",
  "My body language",
  "Taking the shots I've earned",
  "Breathing at the line",
  "Hard cuts every possession",
] as const;

/* ── Debrief chips ──────────────────────────────────────────────────────── */

export const WORKED = [
  "My warmup",
  "Talking early",
  "Playing fast",
  "Letting mistakes go",
  "Trusting my shot",
  "Defense first",
  "Staying with my teammates",
  "Breathing between plays",
  "Simple reads",
  "Competing the whole time",
] as const;

export const DIDNT_WORK = [
  "Overthinking",
  "Hunting stats",
  "Watching the crowd",
  "Getting stuck on one play",
  "Arguing calls",
  "Playing scared",
  "Rushing",
  "Going quiet",
  "Comparing myself",
  "Low energy from the jump",
] as const;

export const LETTING_GO = [
  "A shot I missed",
  "Something coach said",
  "A turnover",
  "My minutes",
  "The result",
  "A ref call",
  "How I looked",
  "Nothing — I'm good",
] as const;

/* ── Routine templates ──────────────────────────────────────────────────── */

export type RoutineTemplate = {
  id: string;
  name: string;
  tagline: string;
  kind: "warmup" | "reset" | "wind_down" | "mistake";
  minutes: number;
  steps: {
    kind: StepKind;
    label: string;
    seconds: number;
    detail?: string;
    pattern?: BreathPattern;
  }[];
};

export const ROUTINE_TEMPLATES: readonly RoutineTemplate[] = [
  {
    id: "settle",
    name: "Settle down",
    tagline: "For when you're too lit up before tip",
    kind: "warmup",
    minutes: 6,
    steps: [
      { kind: "breath", label: "Long exhale", seconds: 72, detail: "The out-breath is what slows you down. Let it run long.", pattern: PATTERNS.settle },
      { kind: "cue", label: "Name it", seconds: 30, detail: "Say what you're feeling, out loud or in your head. Naming it takes its power." },
      { kind: "visualize", label: "First three minutes", seconds: 90, detail: "Watch yourself play the opening. Not highlights — ordinary, correct plays." },
      { kind: "cue", label: "Your word", seconds: 20, detail: "Say your anchor word. Feel where it lands in your body." },
      { kind: "movement", label: "Shake it loose", seconds: 45, detail: "Roll your shoulders, shake out your hands, get your feet moving." },
      { kind: "silence", label: "Quiet", seconds: 60, detail: "Nothing to do. Just stand in it." },
    ],
  },
  {
    id: "charge",
    name: "Wake up",
    tagline: "For flat legs and a flat head",
    kind: "warmup",
    minutes: 5,
    steps: [
      { kind: "movement", label: "Get the blood going", seconds: 60, detail: "Pogos, arm swings, whatever gets you off the floor." },
      { kind: "breath", label: "Sharp breathing", seconds: 40, detail: "Quick in, quick out. This one is supposed to speed you up.", pattern: PATTERNS.charge },
      { kind: "cue", label: "Pick your fight", seconds: 30, detail: "One thing you're going after tonight. Say it." },
      { kind: "visualize", label: "See the first play", seconds: 60, detail: "Your first touch. Make it aggressive." },
      { kind: "music", label: "Your track", seconds: 90, detail: "The one that works. You already know which." },
    ],
  },
  {
    id: "focus",
    name: "Lock in",
    tagline: "Narrow everything down to the next play",
    kind: "warmup",
    minutes: 4,
    steps: [
      { kind: "breath", label: "Box breathing", seconds: 64, detail: "Four in, four hold, four out, four hold.", pattern: PATTERNS.box },
      { kind: "cue", label: "Three things you control", seconds: 45, detail: "Effort. Attitude. Where your eyes go. Nothing else is yours tonight." },
      { kind: "visualize", label: "Run your reads", seconds: 75, detail: "Walk through what you'll see. Where the help comes from. What you do about it." },
      { kind: "silence", label: "Close your eyes", seconds: 45, detail: "Let the gym noise go by." },
    ],
  },
  {
    id: "halftime",
    name: "Halftime reset",
    tagline: "Thirty seconds, nothing logged",
    kind: "reset",
    minutes: 1,
    steps: [
      { kind: "breath", label: "Four breaths", seconds: 36, detail: "In for three, out for six.", pattern: PATTERNS.reset },
      { kind: "cue", label: "One adjustment", seconds: 20, detail: "One thing for the second half. Just one." },
    ],
  },
  {
    id: "mistake",
    name: "After a mistake",
    tagline: "Ten seconds. Rehearse it now so it's there later.",
    kind: "mistake",
    minutes: 1,
    steps: [
      { kind: "movement", label: "Physical cue", seconds: 5, detail: "Tug your jersey. Slap the floor. Something you do every single time." },
      { kind: "breath", label: "One breath", seconds: 9, detail: "In for three, out for six. One is enough.", pattern: PATTERNS.reset },
      { kind: "cue", label: "Your word", seconds: 6, detail: "Say it. Then go." },
    ],
  },
  {
    id: "winddown",
    name: "Night before",
    tagline: "For the night you can't stop running it",
    kind: "wind_down",
    minutes: 8,
    steps: [
      { kind: "cue", label: "Put it down", seconds: 60, detail: "Say what you're carrying into tomorrow. All of it. Out loud if you can." },
      { kind: "breath", label: "Slow it down", seconds: 110, detail: "Long exhales. This is the one that actually helps you sleep.", pattern: PATTERNS.settle },
      { kind: "visualize", label: "Tomorrow, calmly", seconds: 120, detail: "Walking into the gym. Warmups. The first play. Ordinary, not heroic." },
      { kind: "cue", label: "One line", seconds: 30, detail: "What kind of teammate are you tomorrow? One sentence." },
      { kind: "silence", label: "Phone down", seconds: 60, detail: "That's it. Put it face-down and leave it." },
    ],
  },
] as const;

/* ── Drills ─────────────────────────────────────────────────────────────── */

export type Drill = {
  slug: string;
  title: string;
  category: FocusId;
  seconds: number;
  blurb: string;
  steps: RoutineTemplate["steps"];
};

/**
 * The starter library, bundled with the app so day one works offline. Anything
 * published later comes down through /api/app/v1/content/sync.
 */
export const DRILLS: readonly Drill[] = [
  {
    slug: "the-flush",
    title: "The flush",
    category: "mistakes",
    seconds: 120,
    blurb: "Build the ten-second thing you do after a bad play, before you need it.",
    steps: [
      { kind: "cue", label: "Pick your cue", seconds: 30, detail: "A physical action you can do in a live game. Same one every time." },
      { kind: "breath", label: "Attach the breath", seconds: 45, detail: "Cue, then one long exhale. Link them.", pattern: PATTERNS.reset },
      { kind: "visualize", label: "Rehearse it dirty", seconds: 45, detail: "Picture the worst turnover you've had. Run the cue. Go to the next play." },
    ],
  },
  {
    slug: "controllables",
    title: "Three things",
    category: "pressure",
    seconds: 90,
    blurb: "Shrink the game down to what's actually yours.",
    steps: [
      { kind: "cue", label: "What's not yours", seconds: 30, detail: "Refs. Coach's rotation. Whether shots fall. Name them and set them down." },
      { kind: "cue", label: "What is", seconds: 30, detail: "Effort. Attitude. Where your eyes go. That's the whole list." },
      { kind: "breath", label: "Seal it", seconds: 30, detail: "Four breaths on the short list.", pattern: PATTERNS.box },
    ],
  },
  {
    slug: "first-three",
    title: "First three minutes",
    category: "confidence",
    seconds: 150,
    blurb: "The most useful visualization there is, and the most skipped.",
    steps: [
      { kind: "visualize", label: "Walk in", seconds: 40, detail: "The doors, the floor, the smell of the gym. Get specific." },
      { kind: "visualize", label: "Warmups", seconds: 40, detail: "Your hands on the ball. The first shot going in." },
      { kind: "visualize", label: "The opening", seconds: 70, detail: "First possession. Ordinary and correct — not a highlight." },
    ],
  },
  {
    slug: "eyes",
    title: "Where your eyes go",
    category: "focus",
    seconds: 120,
    blurb: "Attention is trainable. This is the rep.",
    steps: [
      { kind: "silence", label: "Wide", seconds: 30, detail: "Take in everything in the room without looking at any of it." },
      { kind: "cue", label: "Narrow", seconds: 30, detail: "One point. Lock on. Hold it." },
      { kind: "cue", label: "Switch", seconds: 60, detail: "Wide, narrow, wide, narrow. That switch is the skill." },
    ],
  },
  {
    slug: "quiet-the-crowd",
    title: "Quiet the crowd",
    category: "coach",
    seconds: 100,
    blurb: "For voices you can't turn off — the bench, the stands, coach.",
    steps: [
      { kind: "cue", label: "Let it be loud", seconds: 30, detail: "Don't fight it. Noise is allowed to be there." },
      { kind: "breath", label: "Come back in", seconds: 40, detail: "Find your breath underneath it.", pattern: PATTERNS.settle },
      { kind: "cue", label: "One voice", seconds: 30, detail: "Yours. Say your word. That's the one you're running on." },
    ],
  },
  {
    slug: "who-you-are",
    title: "The game isn't you",
    category: "identity",
    seconds: 140,
    blurb: "For when a bad night follows you all week.",
    steps: [
      { kind: "cue", label: "Say the score", seconds: 30, detail: "Out loud. It's a number. It happened." },
      { kind: "cue", label: "Say what's true anyway", seconds: 50, detail: "Three things about you that a box score can't touch." },
      { kind: "breath", label: "Let it settle", seconds: 60, detail: "Long exhales.", pattern: PATTERNS.settle },
    ],
  },
] as const;

/* ── Copy used across the arc ───────────────────────────────────────────── */

export const CRISIS = {
  line: "988",
  lineLabel: "988 Suicide & Crisis Lifeline",
  text: "Text HOME to 741741",
  textLabel: "Crisis Text Line",
  note: "Free, 24/7, and they talk to people your age all day long.",
};
