# Mentality Sports — Dashboard Redesign Spec
**For:** UI implementation  
**Backend status:** All DB work complete. See "Backend / Data" sections — do not re-create tables or policies.

---

## Overview

The goal is to make the dashboard force interaction. Right now users land and don't know what to do. After this redesign, every new matched user is guided into their first conversation, every returning user has a clear next action, and the layout centers on chat with supporting context alongside it.

---

## Feature 1 — Icebreaker Overlay (First Match, First Visit)

### What it does
The first time a matched user opens their dashboard and has zero messages in their match, they see a full-screen overlay instead of the normal dashboard. It prompts them to send their first message. Once they send it, the overlay disappears permanently and never shows again.

### Trigger condition
- User has an active match
- `messages` table has 0 rows for that `match_id`
- Check this on load; dismiss state stored in `localStorage` key `icebreaker_sent_{matchId}`

### Mentor overlay
- Heading: **"Say hello to your athlete"**
- Subheading: "They're waiting to hear from you. Introduce yourself — one sentence about your sport and why you're here."
- Pre-filled input draft: `"Hey [mentee first name]! I'm [mentor name]. I played [sport] at [level] and I'm here because..."` — editable
- CTA button: **"Send intro"** — sends the message, sets localStorage flag, closes overlay
- Small secondary link: "Skip for now" — closes overlay without sending, does NOT set the flag (so it shows again next visit until they actually send)

### Mentee overlay
- Heading: **"Your mentor is ready"**
- Subheading: "Break the ice — tell [mentor first name] what's been on your mind."
- Show 3 challenge-specific prompt suggestions (pull from their `player_profiles.challenges`; see Feature 2 for the prompt bank). Each is a tappable chip that pre-fills the input.
- Pre-filled input draft: empty, cursor focused
- CTA button: **"Send message"**
- Small secondary link: "Skip for now"

### Layout
- Full viewport overlay, semi-transparent navy backdrop
- Centered card, max-width 480px
- Same font/color system as the rest of the app

### Backend / Data
- No new tables needed
- Read mentee's `player_profiles.challenges` from the existing `player_profiles` table (already fetched on dashboard load)
- Read mentor's `profiles.sport` and `mentor_profiles.playing_level` (already fetched)
- Dismiss flag: `localStorage.setItem('icebreaker_sent_' + matchId, '1')`

---

## Feature 2 — Conversation Starter Chips

### What it does
A horizontal strip of 3 prompt chips sits just below the chat input. Tapping a chip pre-fills the input field. Chips rotate after each message sent. Users can collapse the strip; collapsed state persists via localStorage.

### Mentee prompts
Mapped to the 14 challenge categories from signup. Each category has 5–6 unique prompts. On load, pick 3 random ones from the user's selected challenges. After each message sent, pick 3 new random ones from the same pool (no repeat until the pool is exhausted).

**Prompt bank (per challenge):**

| Challenge | Prompts |
|-----------|---------|
| Practice-to-game confidence gap | "Can you help me figure out why I play better in practice than in games?" · "I feel like a different athlete when the lights are on — is that normal?" · "How do I bring practice-me into a real game?" · "What's going through your head right before tip-off / kickoff / your event?" · "I've been stuck in my head during games — where do I even start?" |
| Fear of making mistakes | "How do you handle the fear of messing up in front of your team?" · "What do you do when you can't stop thinking about a mistake mid-game?" · "How do I stop playing not to lose and start playing to win?" · "I replay mistakes for days — did you ever deal with that?" · "What's your go-to reset when you mess up?" |
| Pre-competition anxiety | "Walk me through what your pre-game routine looked like at its best." · "I get sick before big games — is that something you can control?" · "How do you channel nerves instead of fighting them?" · "What do you tell yourself in the locker room right before a game?" · "My anxiety gets worse the bigger the game — how did you handle that?" |
| Communicating with my coach | "How do you approach a coach who doesn't explain why you're benched?" · "What's the best way to advocate for yourself without looking like a problem?" · "I disagree with my coach's decision — how do you handle that?" · "How do I ask for more playing time without it being awkward?" · "My coach and I just aren't clicking — what would you do?" |
| Unclear role on team | "How do you stay motivated when your role keeps changing?" · "I don't know where I fit on this team — how do I figure that out?" · "What do you do when you feel invisible even though you're putting in the work?" · "How do you define your value when it's not just stats?" · "My teammates seem to know their role — how do I find mine?" |
| Dealing with bench / less playing time | "How did you handle sitting the bench when you knew you could contribute?" · "What kept you working hard when you weren't getting minutes?" · "How do you separate your worth as a person from your playing time?" · "What's the mental difference between someone who fights for their spot vs. gives up?" · "How do I stay ready when I never know if I'll play?" |
| Staying motivated | "What do you do on the days you just don't want to show up?" · "How do you reconnect with why you started playing?" · "I've been going through the motions — how do you fix that?" · "What keeps you grinding when results aren't coming?" · "How do you build habits that don't rely on motivation?" |
| Handling pressure moments | "How do you slow down time in a high-pressure moment?" · "What's your mental routine for clutch situations?" · "I go blank in big moments — how do I fix that?" · "How do you separate the importance of a moment from performing in it?" · "What do you do when the pressure feels like too much?" |
| Team dynamics / fitting in | "How do you deal with cliques or politics on a team?" · "What's the best way to earn respect from teammates when you're new?" · "I feel like an outsider on my own team — did you ever feel that way?" · "How do you deal with a teammate who undermines your confidence?" · "What does it look like to be a good teammate when you're not the star?" |
| Injury recovery | "How did you stay mentally strong when you couldn't play?" · "What was the hardest part of coming back from injury for you?" · "I'm scared of re-injuring — how do you get past that?" · "How do you deal with watching your team play without you?" · "What advice do you wish someone gave you during your recovery?" |
| Balancing athletics and school | "How did you manage the mental load of sport and school at the same time?" · "What do you do when school stress bleeds into your performance?" · "I'm falling behind in school because of sport — how did you handle that?" · "How do you stay present during practice when school is overwhelming?" · "What's your system for not letting one thing tank the other?" |
| Self-talk / inner critic | "How do you quiet the voice that says you're not good enough?" · "What does your internal monologue sound like in a high-pressure moment?" · "I'm my own worst critic — how do you turn that into fuel instead of poison?" · "How do you coach yourself through a bad stretch?" · "What does positive self-talk actually sound like in practice?" |
| Burnout | "How do you know the difference between burnout and a rough patch?" · "I love my sport but I'm exhausted by it — is that burnout?" · "What did recovery from burnout actually look like for you?" · "How do you take a mental break without losing your edge?" · "What warning signs should I watch for before hitting a wall?" |
| Identity — my worth beyond sport | "How do you see yourself when sport isn't going well?" · "What does your identity look like outside of athletics?" · "I feel like I'm only worth something when I perform — how do you work through that?" · "How did you handle the fear of who you are without your sport?" · "What's something you're proud of that has nothing to do with athletics?" |

### Mentor prompts
Not challenge-specific. Rotate randomly from this single pool of 20:

1. "Tell me about a time you played your best — what was going through your mind?"
2. "Walk me through what your head is like in the hour before a game."
3. "What's one mental habit you wish you'd built earlier in your career?"
4. "How do you handle a tough loss in the 24 hours after a game?"
5. "When do you feel most locked in? What's different about those moments?"
6. "What's been on your mind since our last conversation?"
7. "If we focus on one mental area this season, what would make the biggest difference?"
8. "How are you feeling about your role on the team right now?"
9. "What would a perfect practice week look like for your mental game?"
10. "Tell me about a setback you had to bounce back from — on or off the field."
11. "What does your internal voice sound like in a high-pressure moment?"
12. "How are you managing the mental load of school and sport together?"
13. "Is there something you've been wanting to say to a teammate or coach but haven't?"
14. "What part of your schedule feels hardest to control right now?"
15. "On a scale of 1–10, how confident are you going into your next game — and why?"
16. "What's something you're doing well mentally that you don't give yourself credit for?"
17. "How would you describe your relationship with failure right now?"
18. "What's the gap between how you perform in practice vs. games, and what do you think drives it?"
19. "If your best friend described how you handle pressure, what would they say?"
20. "What's one small thing you could do differently this week to feel more in control?"

### UI spec
- Strip sits between the last message and the input box
- 3 chips, each ~160px wide, horizontally scrollable on mobile if needed
- Chip style: rounded-full, border, muted background, navy text — same as tag chips elsewhere in app
- On tap: text pre-fills input, cursor moves to end
- On message send: replace all 3 chips with new random picks from pool (no animation needed, just swap)
- Top-right of strip: small "Hide" button (eye-slash icon). On click, strip collapses to a single small "Show suggestions" link. State saved to `localStorage` key `starters_hidden_{userId}`
- Collapsed state shows a single line: "💡 Show suggestions" — clicking reopens the strip

### Backend / Data
- No new tables. Prompts are hardcoded in the frontend.
- Mentee challenges read from `player_profiles.challenges` (already fetched on dashboard load)
- Random selection and rotation logic is client-side only

---

## Feature 3 — Chat-First Layout with Right Panel

### What it does
The dashboard is restructured so chat is the primary surface. Supporting context — upcoming calls, mentor/mentee info, hours log — lives in a collapsible right panel. Navigation tabs are removed or minimized.

### Layout (desktop, ≥768px)
```
┌─────────────────────────────────┬──────────────────────┐
│                                 │  RIGHT PANEL          │
│         CHAT AREA               │  ─────────────────── │
│                                 │  Upcoming Calls       │
│  [message bubbles]              │  [Schedule Call btn]  │
│                                 │  ─────────────────── │
│  [starter chips]                │  Mentor/Mentee Card   │
│  [input box]                    │  [collapsed by def.]  │
│                                 │  ─────────────────── │
│                                 │  Log Hours (mentor)   │
│                                 │  OR                   │
│                                 │  Reflections (mentee) │
└─────────────────────────────────┴──────────────────────┘
```
- Chat area: ~65% width
- Right panel: ~35% width, independently scrollable
- Right panel can be collapsed to a thin icon rail on desktop (chevron toggle)

### Layout (mobile, <768px)
- Chat takes full screen
- Right panel content accessible via a bottom sheet triggered by a "ⓘ" button top-right
- Bottom sheet slides up, shows same sections as desktop panel in stacked layout

### Right panel sections (top to bottom)

**1. Upcoming Calls**
- Shows next 1–2 scheduled calls with date, time, and a "Reschedule" link
- "Schedule a call" button — opens the existing ScheduleCallModal
- If no calls scheduled: "No calls yet — schedule your first one" with the button
- If a match is brand new (no sessions, no scheduled calls): show a prompt "Start with a 15-min intro call" with the schedule button highlighted in orange

**2. Mentor / Mentee Info Card** (collapsed by default, expand on click)
- For mentee: shows mentor's name, sport(s), playing level(s), bio, why they mentor, skills they listed
- For mentor: shows mentee's name, sport(s), grade, school, challenges they selected (as tags), their goal statement
- Header row shows avatar + name + a chevron — tap to expand/collapse
- Collapsed state is the default; state not persisted (resets to collapsed on each visit)

**3a. Log Hours** (mentor only)
- Simple inline form: date picker + minutes input + optional notes + "Log" button
- On submit: inserts to `service_hours` table (see Backend below)
- Below the form: running total for this match — "X hrs Y min logged total"
- Small "View all" link that expands a list of past entries (date, minutes, notes) inline — no new page

**3b. Reflections** (mentee only)
- Same as existing reflection editor, moved here from Sessions tab
- Short textarea + "Save reflection" button
- Toggle: "Share with mentor" checkbox
- Shows last saved reflection date below the form

### Backend / Data
**service_hours table** — already created. Schema:
```
id          uuid PK
mentor_id   uuid → profiles.id
match_id    uuid → matches.id  
session_id  uuid → sessions.id (nullable, for future linking)
date        date
minutes     integer (> 0)
notes       text (nullable)
created_at  timestamptz
```
RLS policies already applied:
- Mentors can INSERT/SELECT/UPDATE/DELETE their own rows (`mentor_id = auth.uid()`)
- Admin can SELECT all rows

**Supabase query for total hours:**
```ts
const { data } = await supabase
  .from("service_hours")
  .select("minutes")
  .eq("match_id", matchId)
  .eq("mentor_id", userId);
const totalMinutes = (data ?? []).reduce((sum, r) => sum + r.minutes, 0);
```

**Insert new entry:**
```ts
await supabase.from("service_hours").insert({
  mentor_id: userId,
  match_id: matchId,
  date: selectedDate,   // "YYYY-MM-DD"
  minutes: minutesInt,
  notes: notes || null,
});
```

---

## Feature 4 — First Call Prompt

### What it does
When a match has no scheduled calls and no completed sessions, a soft prompt appears at the top of the right panel (and inside the chat as a system-style message) encouraging both users to schedule their intro call.

### Trigger condition
- Active match exists
- `scheduled_calls` table has 0 rows for that `match_id`
- `sessions` table has 0 rows for that `match_id`

### UI
- Inside chat: a card with a calendar icon, text "Ready to meet? Schedule your first 15-min call", and a "Schedule now" button — rendered as a special non-message card at the top of the message list, above any bubbles
- In right panel: same prompt replaces the "No calls yet" empty state, but with orange highlight border
- Once a call is scheduled OR a session is logged, this card disappears permanently

### Backend / Data
- No new tables. Check `scheduled_calls` and `sessions` counts on load (already fetched).

---

## Feature 5 — Post-Session Topic Nudge

### What it does
After a mentor logs a session, the chat input area shows a one-time suggestion: "Based on your last session, consider asking about [topic]." This is static — it just surfaces the topics array from the last logged session.

### Trigger
- User is a mentor
- A session was logged in the last 7 days
- The session has a non-empty `topics` array

### UI
- Appears as a single dismissible banner above the starter chips
- Text: "Last session covered [topic 1], [topic 2] — here's a good follow-up:" followed by one auto-selected starter chip from a matching challenge category
- "×" dismiss button — dismissed state in `localStorage` keyed to the session id

### Backend / Data
- No new tables. Uses `sessions.topics` (already fetched on dashboard load).
- Topic-to-challenge mapping is a hardcoded lookup in the frontend.

---

## Implementation Order (for UI dev)

1. **Conversation starters** (Feature 2) — self-contained, no layout changes, highest immediate value
2. **Icebreaker overlay** (Feature 1) — standalone component rendered over existing layout
3. **Right panel** (Feature 3) — layout restructure, most effort
4. **Log hours form** (Feature 3a) — lives inside right panel, build after panel exists
5. **First call prompt** (Feature 4) — small addition inside panel + chat list
6. **Post-session nudge** (Feature 5) — small banner, lowest priority

---

## What's Already Built (don't rebuild)

- `ChatWindow` component — `src/components/chat-window.tsx`
- `ScheduleCallModal` — `src/components/schedule-call-modal.tsx`
- `UpcomingCalls` — `src/components/upcoming-calls.tsx`
- `SessionReflectionEditor` — `src/components/session-reflection-editor.tsx`
- `LogSessionForm` — `src/components/log-session-form.tsx`
- Read receipts + unread dot — working, DB-backed via `messages.read_at`
- `service_hours` table — already in DB and in TypeScript types (`src/lib/supabase/types.ts`)

## Color / Design Tokens

```
navy:     #1B2E4B  (primary text, buttons)
orange:   #F97316  (CTAs, badges, alerts)
sage:     #6B8F71  (success, approve)
parchment / offWhite: #F5F0E8  (backgrounds)
muted:    slate-400 / text-muted-foreground
```
All existing components use Tailwind + shadcn/ui. Match that system exactly — no new component libraries.
