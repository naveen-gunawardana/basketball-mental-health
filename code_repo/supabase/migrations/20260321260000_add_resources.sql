create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null,
  excerpt text,
  category text,
  read_time text,
  status text not null default 'pending', -- 'pending', 'published', 'rejected'
  submitted_by uuid references auth.users(id) on delete set null,
  submitted_by_name text,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

alter table public.resources enable row level security;

-- Anyone (including unauthenticated) can read published resources
create policy "Published resources are public" on public.resources
  for select using (status = 'published');

-- Authenticated mentors can submit (insert) resources
create policy "Mentors can submit resources" on public.resources
  for insert with check (
    auth.uid() = submitted_by and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'mentor')
  );

-- Admin can do everything
create policy "Admin full access to resources" on public.resources
  for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Seed existing articles as published
insert into public.resources (title, slug, content, excerpt, category, read_time, status, published_at) values

(
  'Pre-Game Confidence Routine',
  'pre-game-confidence-routine',
  E'## Why a Pre-Game Routine Matters\n\nMost athletes spend hours preparing their body — warming up, stretching, shooting around. But the mental warm-up gets skipped. That''s a problem, because your brain performs the same way your body does: it needs a consistent signal to shift into competition mode.\n\nA pre-game confidence routine isn''t superstition. It''s programming. Every time you go through the same process before competing, you''re training your nervous system to associate those actions with a specific mental state — focused, calm, ready.\n\n## What Goes Into It\n\n**1. Physical anchor**\nStart with something physical that you always do — a specific stretch, a few deep breaths, bouncing on your heels. The body leads the mind. Movement tells your brain something is about to happen.\n\n**2. Intentional self-talk**\nNot "I hope I play well." Something specific and controllable: "I stay locked in on the next play." "I compete hard on every possession." Keep it present tense, first person, process-focused.\n\n**3. Reset from yesterday**\nLast game doesn''t matter — good or bad. Five minutes before this game, you close that file. One technique: physically write down what you''re leaving behind, then put the paper away.\n\n**4. Focus cue**\nPick one word or phrase that brings you back when your mind drifts mid-game. Practiced during your routine, it becomes a reliable anchor in-the-moment.\n\n## Building Yours\n\nStart with 5 minutes. Same order, every time. It will feel forced at first — that''s normal. After three or four repetitions it starts to feel automatic. After two or three weeks, you''ll notice the difference when you skip it.\n\nThe goal isn''t to eliminate nerves. It''s to walk into competition feeling like you''ve already shown up — because mentally, you have.',
  'A 5-minute mental warm-up you can run before any game or competition — no equipment, no coach required.',
  'Confidence',
  '5 min',
  'published',
  now()
),

(
  'Dealing with Mistakes During Games',
  'dealing-with-mistakes-during-games',
  E'## The Mistake Spiral\n\nYou turn it over. Miss the open shot. Get beat on defense. In the next three seconds, your brain replays it, judges it, and carries it into the next play. That''s the spiral — and it''s what separates athletes who recover quickly from those who compound errors.\n\nMistakes are inevitable. Your response to them is a skill, and it''s trainable.\n\n## Why Athletes Dwell\n\nThe brain is wired to flag threats and hold onto negative experiences longer than positive ones. In evolutionary terms, that''s useful. In competition, it''s a liability. A mistake activates the same fear response as a physical threat — your heart rate spikes, your attention narrows, your thinking gets reactive.\n\nYou can''t stop the initial reaction. But you can shorten it.\n\n## The 3-Second Rule\n\nGive yourself exactly three seconds to feel it. Then move. Not suppress — feel it, then move.\n\nSome athletes use a physical release: clap once, wipe it on their shorts, tap their chest. This is called a "reset cue." It signals to the brain: acknowledged, done, next play.\n\nChoose yours and practice it in low-stakes moments — practice, training, pickup games. When the real moment comes, it needs to be automatic.\n\n## What to Think After a Mistake\n\nNot "I''m terrible." Not "Don''t do that again." Those keep you in the past.\n\nTry: "Next play." Or just your reset cue word. Something that pulls your attention back to what''s in front of you, not what just happened.\n\n## The Long Game\n\nAfter the game — not during — is when you review. Give yourself 24 hours before analyzing a mistake seriously. In that window, your nervous system has calmed down and you can assess without the emotional charge.\n\nAsk: What happened? What would I do differently? Then close it. Mistakes are data, not verdicts.',
  'What to do in the 3 seconds after you mess up — a skill the best athletes train deliberately.',
  'Resilience',
  '6 min',
  'published',
  now()
),

(
  'Setting Weekly Mental Goals',
  'setting-weekly-mental-goals',
  E'## Why Weekly?\n\nSeason-long goals are important, but too distant to guide daily behavior. Game goals are too specific and outcome-dependent. Weekly goals hit the right time horizon — close enough to feel real, broad enough to build habits.\n\nDone right, weekly mental goals give you something to train — not just something to hope for.\n\n## What Makes a Good Mental Goal\n\nBad: "Play with more confidence."\nGood: "When I miss two in a row, I use my reset cue and call for the ball again."\n\nThe difference is specificity. A vague goal gives you nothing to practice. A specific goal tells you exactly what to do, when.\n\nGood mental goals are:\n- **Behavioral** — describe an action, not a feeling\n- **Controllable** — don''t depend on playing time, coaches, or results\n- **Trackable** — you can honestly answer "did I do this or not?"\n\n## Three Areas to Focus\n\n**Effort** — How hard you competed, regardless of outcome. Did you sprint back on defense when you were frustrated? Did you stay engaged on the bench?\n\n**Attitude** — How you responded to adversity. Did you encourage teammates after a bad stretch? Did you stay coachable when corrected?\n\n**Focus** — Where your attention was. Did you stay in the moment, or were you thinking about last play, next play, or what people were thinking?\n\n## The Weekly Review\n\nEvery Sunday (or before your week starts), ask:\n1. What mental area cost me the most last week?\n2. What''s one specific thing I can practice this week?\n3. How will I know if I did it?\n\nWrite it down. Share it with your mentor. Accountability makes this real.',
  'How to set mental goals that are specific enough to actually train — not just hope for.',
  'Goal Setting',
  '5 min',
  'published',
  now()
),

(
  'How to Stay Motivated During a Plateau',
  'how-to-stay-motivated-during-a-plateau',
  E'## What a Plateau Actually Is\n\nA plateau isn''t regression. It''s adaptation lag — your body and mind are consolidating gains before the next jump. The problem is it doesn''t feel that way. It feels like you''ve stopped improving, which your brain interprets as failure.\n\nUnderstanding this doesn''t make plateaus comfortable. But it makes them survivable.\n\n## Why Motivation Drops\n\nMotivation is largely driven by progress feedback. When you''re improving, you feel it — that sensation fuels the next session. When improvement stalls, the feedback loop breaks. You put in the same work and feel nothing. Naturally, motivation follows.\n\nThe fix isn''t to try harder. It''s to change what you measure.\n\n## Shift Your Metrics\n\nDuring a plateau, outcome metrics (points, times, rankings) won''t move. So track process metrics instead:\n- How many reps did I complete this week?\n- Did I show up when I didn''t feel like it?\n- How was my effort quality, not volume?\n\nThese are within your control every day. Progress on them is real, even when the scoreboard isn''t moving.\n\n## Use the Plateau Productively\n\nPlateaus often reveal what you''ve been avoiding. The skill you''re least comfortable with. The physical area you''ve been glossing over. The mental habit that''s been holding you back.\n\nAsk: what is the plateau pointing at?\n\n## Reset Your Why\n\nWhen motivation is low, reconnect to why you started. Not the external version (scholarships, recognition, expectations) — the internal one. The part of competing that you''d still love if no one was watching.\n\nWrite it down. Read it before your next practice. It won''t fix everything, but it reorients your compass.',
  'What''s actually happening when you stop improving — and how to push through without burning out.',
  'Motivation',
  '6 min',
  'published',
  now()
),

(
  'The Practice-to-Game Gap: Why It Happens and How to Close It',
  'the-practice-to-game-gap',
  E'## The Problem Every Athlete Knows\n\nYou''re a different player in practice. Your release is clean, your reads come fast, your confidence is high. Then the game starts — and something shifts. The same moves feel foreign. You second-guess decisions you''ve made a thousand times.\n\nThis isn''t weakness. It''s neuroscience.\n\n## What Changes When It Counts\n\nPractice and games activate different neurological states. In practice, your prefrontal cortex — the part of your brain responsible for deliberate, analytical thinking — is running the show. In competition, adrenaline shifts control toward your amygdala, which processes threat and triggers reactive, instinct-based responses.\n\nThe result: conscious thought gets louder at exactly the moment you need it to go quiet.\n\n## The Paradox of Trying Harder\n\nThe athlete who is "trying really hard" in a game is usually the one playing worst. The heightened effort turns automatic skills back into deliberate ones — and deliberate processing is slow. You start thinking about your footwork, your form, what people are watching.\n\nThe goal of mental training is the opposite: making your attention feel like practice under game conditions.\n\n## How to Close the Gap\n\n**Train under pressure in practice.** Not just at the end of drill. Create stakes — consequences for mistakes, competition within reps. Your brain needs to learn that adrenaline is not a threat to performance.\n\n**Use a pre-game routine.** Consistently activating the same mental state before competition trains your nervous system to treat games as familiar, not threatening.\n\n**Focus on the process, not the result.** A thought about outcome ("I can''t miss this") spikes anxiety and degrades automaticity. A thought about process ("stay low, eyes up") keeps attention where it belongs.\n\n**Give yourself permission to make mistakes.** The fear of error is often the mechanism that produces them. Athletes who play freely — knowing mistakes happen — access their automatic skillset more reliably.',
  'Why your brain treats games differently than practice — and what to do about it.',
  'Confidence',
  '7 min',
  'published',
  now()
),

(
  'How to Talk to Your Coach About Playing Time',
  'how-to-talk-to-your-coach-about-playing-time',
  E'## Why It''s Hard\n\nPlaying time is personal. It touches your identity, your value, your sense of belonging on the team. When you''re not getting enough of it, resentment builds — toward your coach, your teammates, yourself. And if you never have the conversation, that resentment compounds.\n\nBut most athletes never bring it up. They assume it''ll look entitled. Or they''re afraid of the answer.\n\nHere''s the thing: coaches generally respect players who advocate for themselves — when they do it the right way.\n\n## Before the Conversation\n\nGet your head straight first. Ask yourself honestly:\n- Am I approaching this as a learner, or as someone demanding what I''m owed?\n- Do I have a genuine question about how to improve, or do I just want to vent?\n\nThe first posture will get you information you can use. The second will make the coach defensive.\n\n## How to Ask\n\nRequest a one-on-one time — not immediately before or after a game. Something like:\n\n*"Coach, could I grab five minutes with you this week? I want to understand what I need to work on to earn more playing time."*\n\nNote what that sentence does: it frames the conversation around your development, not your entitlement. It puts the decision back in the coach''s court — which is where it is anyway.\n\n## In the Conversation\n\n**Listen more than you talk.** You''re there to get information, not to make a case. Resist the urge to defend yourself when you hear something you disagree with.\n\n**Ask for specifics.** "What would you need to see from me?" is more useful than "Why am I not starting?"\n\n**Repeat back what you hear.** "So you''re saying if I improve my defensive positioning and communication, that''s what''ll move me up the rotation — is that right?"\n\n## After the Conversation\n\nGo do it. Nothing signals maturity like taking feedback seriously and acting on it. Follow up in two to three weeks — not to check your playing time, but to show you took the conversation seriously.\n\nEven if nothing changes right away, you''ve built something more valuable than playing time: a direct, honest relationship with your coach.',
  'A step-by-step approach for a productive conversation — without sounding entitled.',
  'Coach Communication',
  '6 min',
  'published',
  now()
),

(
  'Pre-Competition Anxiety: What''s Normal and What Helps',
  'pre-competition-anxiety',
  E'## Anxiety Isn''t the Enemy\n\nBefore a big game, your heart pounds. Your stomach tightens. Your thoughts race. Most athletes interpret this as a problem — a sign that something is wrong, that they''re not mentally tough enough.\n\nBut physiologically, what you''re experiencing before competition is almost identical to excitement. The same heart rate elevation. The same heightened alertness. The difference is the label you put on it.\n\nAnxiety signals that something matters to you. That''s not a flaw. It''s information.\n\n## What''s Normal\n\nSome level of pre-competition anxiety is universal and functional. It increases focus, sharpens reaction time, and primes your body for physical output. The research on this is clear: moderate arousal improves performance. Too little (underactivated) and too much (overwhelmed) both degrade it.\n\nThe goal isn''t to eliminate pre-game nerves. It''s to stay in the optimal range.\n\n## When It Becomes a Problem\n\nAnxiety crosses into dysfunction when it:\n- Causes you to avoid competing or performing at all\n- Persists well into competition and won''t settle\n- Leads to physical symptoms that impair you (nausea, shaking, blanking)\n- Makes you play scared — tentative, hesitant, risk-averse\n\nIf you recognize these patterns consistently, it''s worth talking to a mentor, counselor, or sports psychologist.\n\n## What Actually Helps\n\n**Reframe, don''t suppress.** Instead of telling yourself to calm down, try: "I''m excited. My body is ready." This reappraisal technique — studied extensively in performance psychology — shifts the emotional valence without fighting the physiology.\n\n**Controlled breathing.** A slow exhale activates the parasympathetic nervous system and lowers heart rate within seconds. Breathe in for 4 counts, out for 6. Two or three cycles is enough.\n\n**Narrow your focus.** Anxiety expands when you''re thinking about outcomes, what others think, or what''s at stake. Pull attention to something immediate and controllable: your warm-up routine, one cue for your first action of the game, your breath.\n\n**Normalize it with yourself.** Say it out loud if you need to: "I''m nervous. That means I care. That''s okay." Accepting the feeling reduces its power. Fighting it amplifies it.',
  'How to reframe pressure as a signal, not a threat — and what research says actually helps.',
  'Pressure & Anxiety',
  '7 min',
  'published',
  now()
);
