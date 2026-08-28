# Gameday

**Gameday by Mentality Sports** — a mental-performance app built around the athlete's own clock: the days before a game, the locker room, halftime, and the drive home.

A sixteen-year-old will not download a mental health app. The same kid will download something that helps them play better on Saturday. Gameday delivers the skills the Mentality mentorship program already teaches — arousal regulation, self-talk, attentional control, post-performance processing — wrapped as performance tools rather than wellness tools.

The unit of the app is **a game**, not a day. Athletes already organize their lives around games, so there's no new habit to invent.

---

## Getting it running

**Node 20.19.4 or newer.** React Native 0.81 requires it; older Node bundles fine but native builds get flaky.

```bash
cp .env.example .env      # fill in the Supabase URL + anon key
npm install
npx expo start
```

The app points at the **same Supabase project the website uses**. An athlete who signed up on mentalitysports.org signs in here with the account they already have, and keeps their profile, mentor match, and message history.

Apply the two migrations first — they live in the website repo, since that's where the database is owned:

```bash
cd ../code_repo
npx supabase db push
#   20260826000000_gameday_app.sql      tables, RLS, the v_game_log view
#   20260826000100_gameday_storage.sql  the two buckets and their policies
```

Both are additive. Nothing the website already relies on is altered, except one optional foreign key from `debriefs` into the existing `reflections`.

### Server environment

The Next.js side needs one new variable on top of what it already has:

```
SUPABASE_SERVICE_ROLE_KEY=…    # already set for the website
CRON_SECRET=…                  # already set for the website
OPENAI_API_KEY=…               # NEW, and optional — voice notes still save
                               # without it, they just arrive untranscribed
```

### Checks

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npx expo-doctor      # SDK / dependency alignment
npx expo export --platform all   # proves the whole graph bundles
```

All four are green as of the last commit.

### Builds

`eas.json` defines three profiles. `development` gives a dev client, `preview` an internal build, `production` a store build with auto-incrementing versions. You'll need `eas init` once to get a project id into `EAS_PROJECT_ID` — push tokens don't work without it.

---

## How it's put together

```
app/                      expo-router routes
├── (onboarding)/         nine steps, account asked for last
├── (auth)/               sign-in for existing Mentality accounts
├── (tabs)/               Now · Games · Train · Me
├── gameday/[id]          the takeover — inside four hours the tabs disappear
├── run/[id]              routine runner: offline, pocketable, screen-lockable
├── reset                 thirty seconds, logs nothing
├── debrief/[id]          the ninety seconds that matter most
└── recap                 shareable season card

src/
├── theme/                tokens + the Training ↔ Gameday surface switch
├── icons/                the icon set and sport glyphs, drawn here not imported
├── components/
│   ├── primitives/       Dial · Pad · BodyMap · Chips · VoiceNote · Runner
│   └── ui/               Screen, Card, Button, Text
├── features/             games · routines · profile · onboarding
├── lib/                  supabase, api, outbox, haptics, notifications
├── store/                auth + onboarding draft
└── data/catalog.ts       every chip list, drill, and routine template
```

### Six input primitives

Everything in the app is built from these. A small reused vocabulary is what separates a designed product from a pile of toys.

| | What it is |
|---|---|
| **Dial** | Drag an arc for any 1–10. The ring breathes faster and the hue runs sage → terracotta as it climbs. |
| **Pad** | Two axes, one drag: calm↔activated and rough↔good. The word appears as you enter the quadrant. |
| **BodyMap** | Tap a silhouette where you feel it. Somatic awareness with no vocabulary required. |
| **Chips** | The twelve answers athletes actually give. Free text is the escape hatch, never the default. |
| **VoiceNote** | Hold to talk. Beats thumb-typing and catches tone the text wouldn't. |
| **Runner** | Full-screen timed steps that advance themselves. Powers routines, breathing, resets, drills. |

### The anti-chore rules

Hard rules, checked in review:

1. Never ask for a number a gesture can give you.
2. Voice beats keyboard, always.
3. Chips before blank fields.
4. Every input animates the thing it measures.
5. One thing per screen on game day.
6. Timers run themselves — you tap only to skip.
7. Ninety seconds, hard ceiling, per flow.
8. Cold hands, one thumb, no signal.
9. The app gets *quieter* when it matters most.
10. Never withhold something the athlete needs. No streak guilt, no locked content.

---

## Backend

Two paths, deliberately:

- **supabase-js direct** for everything the athlete owns — games, check-ins, debriefs, routines. Lowest latency, and the offline queue is simple when writes are plain table ops.
- **`/api/app/v1/*` on the Next.js app** for anything needing the service role or a secret: push registration, transcription, the safety scan, insight computation, the season recap. The service-role key never ships in an app binary, and logic there changes without an App Store review.

### Offline

Game day happens in buildings with no signal, which is exactly when the app matters most. Drills, routines, and upcoming games cache to SQLite. Every write lands in an outbox keyed by a client-generated uuid, so a retry upserts rather than duplicates. The runner, the reset, and the debrief never await the network.

### Notifications

Three per game, one per non-game day, capped **server-side** in `notification_sends` — a cap the client owns is a cap that eventually creeps. Every send is tied to a moment in the arc. There is no "we miss you" send and there never will be.

### Insights

Nothing publishes under **six** debriefed games or an effect under 0.8 points, and every claim carries the game ids behind it. A confident-sounding finding from four data points would poison trust in the feature, and that trust is the only reason the log gets filled in.

---

## Positioning and safety

- **13+.** Under-13 means COPPA verifiable parental consent.
- **Performance, not treatment.** No diagnosis language, no PHQ-9 or GAD-7. Validated symptom scales pull the app into a far harder App Store review.
- **Crisis path always reachable.** 988 and Crisis Text Line, two taps from anywhere. The debrief text is scanned server-side *after* the write — it never blocks, never stores the text, and never notifies anyone else.
- **Nothing is shared by default.** A debrief reaches a mentor only through an explicit per-item tap, which writes into the website's existing `reflections` table where `shared_with_mentor` already gates visibility.

---

Full product and engineering plan: <https://claude.ai/code/artifact/378db242-a92e-43da-9e9b-84eb0845a15b>
