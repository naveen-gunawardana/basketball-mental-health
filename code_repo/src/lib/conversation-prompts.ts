// Prompt bank for conversation starter chips.
// Mentee prompts are challenge-specific; mentor prompts are a single rotating pool.

export const MENTEE_PROMPTS_BY_CHALLENGE: Record<string, string[]> = {
  "Practice-to-game confidence gap": [
    "Why am I good in practice and then nothing in games",
    "Did this ever go away for you or did you just learn to live with it",
    "What was the actual difference for you — practice vs games",
    "I'm fine until tipoff and then I tighten up. Any idea why",
    "How long did it take you to figure this out",
  ],
  "Fear of making mistakes": [
    "I can't let go of mistakes. Like for days. Did you ever do that",
    "How do you play loose when you're scared to screw up",
    "What do you say to yourself after a bad rep",
    "I play not to lose. How do I flip that",
    "Does messing up still get to you or does it eventually stop",
  ],
  "Pre-competition anxiety": [
    "I feel sick before big games. Is that something I can fix",
    "What did your pre-game routine actually look like",
    "It gets worse the bigger the game. Did you deal with that",
    "What's your head doing in the hour before tipoff",
    "How do you stop spiraling before a game",
  ],
  "Communicating with my coach": [
    "How do you talk to a coach who won't tell you why you're not playing",
    "I want more minutes. How do I bring it up without sounding entitled",
    "My coach and I just don't click. What would you do",
    "Is it dumb to push back on your coach",
    "How do you stand up for yourself without becoming the problem",
  ],
  "Unclear role on team": [
    "I genuinely don't know what I'm supposed to do on this team",
    "How do you find your role when no one tells you what it is",
    "What do you do when you're not a starter and not a bench guy — just floating",
    "How do you stay locked in when your role keeps changing",
    "I feel invisible out there. Did you ever feel that",
  ],
  "Dealing with bench / less playing time": [
    "How do you stay ready when you barely play",
    "How did you not go crazy sitting",
    "Did you ever ride the bench. How did you handle it",
    "How do you keep grinding knowing you won't see the floor Saturday",
    "I'm starting to think my worth is my minutes. Is that normal",
  ],
  "Staying motivated": [
    "Some days I just don't want to be there. Is that a problem",
    "How do you keep going when nothing's working",
    "Did you ever fall out of love with your sport",
    "What kept you showing up on the worst days",
    "How do you find it again when you've lost it",
  ],
  "Handling pressure moments": [
    "I go blank in the big moments. How do I stop that",
    "What's running through your head with the game on the line",
    "How do you not freak yourself out before a clutch play",
    "I want the moment and I'm scared of it at the same time. Normal?",
    "How do you stay loose when everything matters",
  ],
  "Team dynamics / fitting in": [
    "I feel like a stranger on my own team. Did you ever",
    "How do you deal with a teammate who's trying to undercut you",
    "I'm new — how do you earn respect without trying too hard",
    "Is team politics just a thing or is mine actually bad",
    "How do you be a good teammate without being a pushover",
  ],
  "Injury recovery": [
    "Watching my team play without me is killing me. How'd you get through that",
    "I'm scared to come back at full speed. Did you have that",
    "Did you ever feel like you lost a part of yourself when you were hurt",
    "What did recovery actually look like for you mentally",
    "What do you wish someone had told you while you were out",
  ],
  "Balancing athletics and school": [
    "How did you do both without losing it",
    "School is wrecking my play right now. What did you do",
    "How do you show up to practice when you're already cooked",
    "What did your actual day look like when you were playing",
    "Is it ok to let one slip for a week to save the other",
  ],
  "Self-talk / inner critic": [
    "I'm brutal to myself in my head. How do I stop",
    "What does your inner voice sound like in a game",
    "How do you shut yourself up when you won't stop spiraling",
    "Did you ever beat yourself up like this",
    "Is positive self-talk actually a real thing or kind of corny",
  ],
  "Burnout": [
    "I love it but I'm exhausted by it. Is that burnout",
    "How do you know when you need an actual break",
    "What did coming back from burnout look like for you",
    "Did you ever hit a wall and have to step back",
    "What are the signs I should be watching for",
  ],
  "Identity — my worth beyond sport": [
    "Who am I if I'm not playing",
    "Did you ever feel like you were only your sport",
    "What helped you figure out who you were outside of it",
    "I feel like nothing when I'm not performing. How do I fix that",
    "What's something you're proud of that has nothing to do with sport",
  ],
};

export const MENTOR_PROMPTS: string[] = [
  "How was practice this week",
  "Anything been on your mind since we last talked",
  "What's the next game you're nervous about",
  "How are things with your coach right now",
  "How are you feeling about your role this week",
  "Anything about your team that's been bugging you",
  "How's school going alongside everything",
  "What's been the hardest part of this season so far",
  "Anything you want to figure out before your next game",
  "When did you last feel really good out there",
  "How are you sleeping lately",
  "Any moment from this week you're still thinking about",
  "Anything you wish you'd done differently last game",
  "What are you working on right now",
  "Anything you don't usually tell anyone — you can tell me",
  "How was the locker room this week",
  "What does this season feel like so far, honestly",
  "Anything you want to vent about",
  "What would a good week look like for you",
  "What's one thing you'd want to be better at by the next game",
];

// Best-effort mapping from session topic strings to challenge keys.
const TOPIC_TO_CHALLENGE: Array<[RegExp, string]> = [
  [/confidence|practice.*game|game.*practice/i, "Practice-to-game confidence gap"],
  [/mistake|fear/i, "Fear of making mistakes"],
  [/anxi|pre-?game|pre-?comp/i, "Pre-competition anxiety"],
  [/coach/i, "Communicating with my coach"],
  [/role/i, "Unclear role on team"],
  [/bench|playing time|minutes/i, "Dealing with bench / less playing time"],
  [/motivat/i, "Staying motivated"],
  [/pressure|clutch/i, "Handling pressure moments"],
  [/team|teammate|chemistry|fit/i, "Team dynamics / fitting in"],
  [/injur|recover/i, "Injury recovery"],
  [/school|academ|balanc/i, "Balancing athletics and school"],
  [/self.?talk|inner|critic/i, "Self-talk / inner critic"],
  [/burnout|exhaust/i, "Burnout"],
  [/identity|worth|outside/i, "Identity — my worth beyond sport"],
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickMenteePrompts(challenges: string[] | null | undefined, count = 3): string[] {
  const pool = new Set<string>();
  for (const c of challenges ?? []) {
    const direct = MENTEE_PROMPTS_BY_CHALLENGE[c];
    if (direct) {
      direct.forEach(p => pool.add(p));
      continue;
    }
    const lower = c.toLowerCase();
    for (const key of Object.keys(MENTEE_PROMPTS_BY_CHALLENGE)) {
      if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase().split(/[\s—/]/)[0])) {
        MENTEE_PROMPTS_BY_CHALLENGE[key].forEach(p => pool.add(p));
      }
    }
  }
  if (pool.size === 0) {
    [...MENTEE_PROMPTS_BY_CHALLENGE["Self-talk / inner critic"], ...MENTEE_PROMPTS_BY_CHALLENGE["Staying motivated"]].forEach(p => pool.add(p));
  }
  return shuffle(Array.from(pool)).slice(0, count);
}

export function pickMentorPrompts(count = 3): string[] {
  return shuffle(MENTOR_PROMPTS).slice(0, count);
}

export function challengeForTopic(topic: string): string | null {
  for (const [re, key] of TOPIC_TO_CHALLENGE) {
    if (re.test(topic)) return key;
  }
  return null;
}

export function followUpPromptForTopics(topics: string[] | null | undefined, role: "mentor" | "mentee"): string | null {
  if (!topics || topics.length === 0) return null;
  for (const t of topics) {
    const key = challengeForTopic(t);
    if (key && MENTEE_PROMPTS_BY_CHALLENGE[key]) {
      const pool = MENTEE_PROMPTS_BY_CHALLENGE[key];
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }
  if (role === "mentor") return MENTOR_PROMPTS[Math.floor(Math.random() * MENTOR_PROMPTS.length)];
  return MENTEE_PROMPTS_BY_CHALLENGE["Staying motivated"][0];
}
