-- Migrate 5 hardcoded resources from /resources into the DB resources table.
-- These slugs do not exist yet. ON CONFLICT DO NOTHING is a safety net.

insert into public.resources (title, slug, content, excerpt, category, sport, media_type, read_time, status, submitted_by_name, published_at) values

(
  'What to Do When You''re Benched',
  'what-to-do-when-youre-benched',
  $$## The Bench Is Not a Punishment

Let's get this out of the way: sitting on the bench feels terrible. It can feel like rejection, like your coach doesn't believe in you, like all your hard work doesn't matter. Those feelings are valid.

But here's what separates players who eventually earn more time from players who fade away: the ones who earn time treat the bench as a temporary situation, not a permanent identity. The bench is a location, not a label.

## The Mental Spiral (And How to Stop It)

When you get benched, your brain wants to run a very specific script. It sounds like this:

"Why am I not in? I worked so hard this week. This is unfair. Coach doesn't like me. What's the point of even trying? My parents are watching..."

This spiral is natural, but it's poison. It makes you look disengaged on the bench — which coaches notice — it kills your energy when you do get put in, and it makes practice the next day feel meaningless.

The antidote is a bench protocol: a specific set of actions you commit to before you get benched, so when it happens, you already know what to do.

## Your Bench Protocol: 4 Actions

1. STAND UP AND STAY ACTIVE. Don't slump in your chair. Stand near the scorer's table, stay on your feet, cheer for teammates. Coaches are always watching the bench. A player who's locked in from the bench is a player they trust to put in.

2. STUDY THE GAME. Watch the player at your position. What are they doing well? What's the other team's defense doing? Where are the openings? When you check in, you should be the most prepared player on the court.

3. BE THE BEST TEAMMATE ON THE BENCH. High-five guys coming off the court. Point out things you're seeing. Communicate energy. If you're a culture-builder, you're valuable even before you check in.

4. PREPARE YOUR FIRST PLAY. Decide: when I get in, my first action will be ________. Sprint back on D. Set a screen. Get a deflection. Something within your control that shows energy and effort.

## What the Bench Actually Teaches You

- Patience and resilience — two skills that separate good players from great ones.
- Game IQ — watching from the outside is one of the best ways to learn the game.
- Mental toughness — anyone can stay positive when they're starting. Staying engaged when you're not is elite-level mental strength.
- Professionalism — every NBA player, even stars, has been benched at some point. How you handle it is a character test.

## The Conversation You Should Have

After the game — not during, not right after — it's okay to talk to your coach about what you need to do to earn more time. The key is framing it as "What can I improve?" not "Why aren't you playing me?" One shows maturity. The other shows entitlement.

## Your Challenge This Week

Before your next game, write down your bench protocol:

- I will stand up and stay active.
- I will study the game and watch the player at my position.
- I will be the best teammate on the bench.
- My first action when I check in will be: _______

Then do it. Every game. Regardless of how much you play. You'll be amazed at how quickly your coach notices.$$,
  'Getting benched stings. This guide helps you stay engaged, avoid the mental spiral, and use bench time to actually increase your future playing time.',
  'Coach Communication',
  'General',
  'Article',
  '7 min',
  'published',
  'Mentality Sports',
  now()
),

(
  'Translating Practice Confidence to Games',
  'translating-practice-confidence-to-games',
  $$## The Practice-Game Gap Is Real

You know the feeling. In practice, you're hitting shots, making reads, playing with confidence. Then game day comes and suddenly your legs feel heavy, you're second-guessing every decision, and you play nothing like the player you know you are.

This is one of the most common problems in basketball. The practice-game gap isn't about talent. It's about your brain treating practice and games as two completely different situations. Games have pressure, stakes, crowds, refs, unfamiliar opponents, and the fear of messing up in front of people who matter to you.

The good news? You can train your brain to treat games more like practice.

## Why It Happens: The Threat Response

In practice, your brain is in "learning mode." You're comfortable, the stakes are low, and your body is free to operate on autopilot — which is where your best basketball lives.

In games, your brain shifts into "threat mode." It detects pressure, evaluation, and consequences. Your thinking brain tries to take over from your athletic brain. This is why you "think too much" in games — you're literally using the wrong part of your brain.

The solution isn't to "stop thinking." The solution is to create enough familiarity with game-like pressure that your brain stops treating it as a threat.

## Technique 1: Pressure Simulation in Practice

1. Make practice consequences real. Shoot free throws where missing means running. Play 1-on-1 with something on the line. Create stakes.
2. Practice with an audience. Invite a friend or just prop up your phone and record yourself. The awareness of being watched activates game-like pressure.
3. Add time pressure. Use a shot clock. Give yourself 3 seconds to make a decision.
4. Simulate fatigue. Do your skill work after conditioning, when you're tired. Games are played tired — practice should be too.
5. Create "game moments." Down 2 with 10 seconds left. Practice these scenarios until they feel familiar, not frightening.

## Technique 2: Visualization (Mental Reps)

Visualization isn't just sitting around imagining you're scoring 30. It's structured mental rehearsal that your brain processes as actual experience.

Find a quiet place. Close your eyes. Put yourself in the game from YOUR perspective — first person, not watching yourself. Start with the environment: the gym, the crowd noise, the squeaking of shoes. Make it vivid.

Now run a specific play or situation. Feel the ball in your hands. Feel the defender. Execute the move. See the result.

Key details: include physical sensations, include emotions, visualize both success AND recovery from mistakes. Do this for 3–5 minutes daily.

## Technique 3: The Transition Trigger

Create a physical action that bridges your practice self and your game self. Pick something simple — tugging your jersey, tapping the court, a specific breath pattern.

Every time you do something great in practice, immediately do your trigger action. Over time, your brain associates that action with confidence and flow. Then, before games, do the same action. Your brain recalls the associated state. Elite athletes have used this for decades.

## Technique 4: Redefine the Game

Part of the practice-game gap is what the game means to you. If a game means "everyone is judging me" or "I have to prove myself," your brain treats it as a threat.

Try redefining what the game is: "This is just basketball. The same basketball I play every day." "This is a chance to test what I've been working on." "My only job is to play hard and execute. Results will follow."

The irony: when you stop trying to prove something, you usually play better.$$,
  'You ball out in practice but freeze up in games? This guide uses visualization and pressure simulation to help you close the gap.',
  'Confidence',
  'Basketball',
  'Article',
  '8 min',
  'published',
  'Mentality Sports',
  now()
),

(
  'Understanding Your Role on the Team',
  'understanding-your-role-on-the-team',
  $$## Why Role Clarity Changes Everything

One of the biggest sources of frustration for basketball players isn't lack of talent — it's lack of clarity. You don't know what your coach wants from you. You're not sure what your "thing" is. You see other players with defined roles and wonder where you fit.

Here's the truth: every championship team is built on players who understood and embraced their roles. Not every player is the go-to scorer. But every player can be elite at something. When you know your role, you stop trying to be everything and start dominating at what you're actually needed for.

## Part 1: The Self-Assessment

Rate yourself honestly (1–5) on each area:

- Scoring (creating your own shot)
- Spot-up shooting (catch and shoot)
- Playmaking (creating for others)
- Rebounding
- On-ball defense
- Help defense / team defense
- Communication / vocal leadership
- Energy / effort / hustle plays
- Basketball IQ / knowing the system
- Consistency / reliability

Circle your top 3. These are your strengths — the foundation of your role. Put a star next to the ONE area where you are clearly above your teammates. This is your superpower.

## Part 2: The Team Needs Assessment

Think about your team and answer honestly:

1. What does our team do well?
2. What does our team struggle with?
3. What role is nobody else filling — the dirty work nobody wants to do?
4. When our team is at its best, what am I usually doing?
5. When I check in during a game, what changes?

## Part 3: Defining Your Role

Based on the above, write your role statement in this format:

"I am the player who _______________. My team counts on me to _______________."

Examples: "I am the player who brings energy and locks down the other team's best guard. My team counts on me to set the tone on defense." Or: "I am the player who does the dirty work — rebounds, loose balls, screens. My team counts on me to do the things that don't show up in the box score."

## Part 4: The Coach Conversation

Take your role statement to your coach: "Coach, I've been thinking about my role on the team, and I want to make sure I'm focusing on the right things. I see my role as [your statement]. Does that match what you need from me, or would you adjust anything?"

This conversation does two things: it shows your coach you're thinking about the team, not just yourself — and it gives your coach a chance to clarify, which helps you play with more confidence.

## Part 5: Owning Your Role

Once you know your role, you have to own it. If you're a defensive stopper, take pride in holding your matchup to a bad game — even if nobody tweets about it. If you're the energy guy, understand that your team literally plays different when you're on the court.

Role players win championships. Klay Thompson embraced playing next to Steph. Dennis Rodman embraced rebounding. None of them tried to be something they weren't. They were elite at being exactly who they were.

Your role isn't a limitation. It's your lane. Own it.$$,
  'Unclear about your role? This exercise helps you define what your coach and teammates need from you — and find purpose in your unique contribution.',
  'Coach Communication',
  'General',
  'Article',
  '7 min',
  'published',
  'Mentality Sports',
  now()
),

(
  'Coming Back Stronger After Injury',
  'coming-back-stronger-after-injury',
  $$## The Injury Nobody Talks About

When you get hurt, everyone focuses on the physical injury — the sprained ankle, the torn ACL, the broken finger. But there's a second injury that nobody talks about: the mental one.

Watching your team play without you. Losing your identity as a player. Fearing that you'll come back different. Worrying about re-injury. Feeling forgotten. These mental injuries can be harder to recover from than the physical ones.

Your body will heal on its own timeline. But your mind needs its own recovery plan.

## Phase 1: Processing the Emotions

Right after an injury, you're going to feel a wave of emotions: anger, sadness, frustration, fear, maybe even relief. All of these are normal.

What's not helpful is pretending you're fine. "It's all good, I'll be back" might be what you say to teammates, but you need at least one person — a mentor, a parent, a friend — who you can be honest with.

Try this: write down what you're actually feeling. Not what you think you should feel. Just get it out. Naming your emotions takes away some of their power.

## Phase 2: Redefining Your Identity

Here's the trap: if your entire identity is "basketball player," an injury doesn't just hurt your body — it threatens who you ARE. You feel lost because the thing that made you feel valuable is temporarily gone.

This is an opportunity to remember that you're more than basketball. You're still on the team. You can still be a leader. Your role just looks different for a while. Show up to practices, support your teammates, and stay connected to the game mentally even when your body can't play.

## Phase 3: Mental Training During Recovery

1. VISUALIZATION: You can't practice physically, but you can practice mentally. Spend 5–10 minutes daily visualizing yourself playing. Research shows mental reps activate the same neural pathways as physical ones.
2. FILM STUDY: Watch game film of your team and opponents. You have time to become the smartest player on the court when you return. Use it.
3. STUDY THE GAME: Watch pro basketball with a notebook. Study players at your position — their decision-making, spacing, off-ball movement.
4. GOAL SETTING: Set recovery milestones with your trainer. Having specific targets gives you something to celebrate.
5. JOURNALING: Track your mental state throughout recovery. Notice what makes you feel better and what triggers frustration.

## Phase 4: The Comeback (Managing Fear)

The scariest part of injury isn't the injury itself — it's the first time you go full speed again. Your brain will try to protect you by making you hesitant. This is your nervous system doing its job.

To rebuild confidence: start with controlled environments, gradually increase intensity, celebrate each milestone, and expect bad days — healing isn't linear.

Remind yourself: "I've done the rehab. My body is ready. I can trust it." Talk to your mentor about your fears — they're normal and they're temporary.

## What to Tell Yourself When It's Hard

- "This is temporary. My career is not over."
- "I'm building mental toughness that healthy players don't have to build."
- "Every great player has come back from something. This is my something."
- "I don't have to feel ready to start. I just have to start."
- "The player I become after this will be stronger than the player I was before."$$,
  'Injured and feeling lost? This guide walks you through the mental side of recovery — from processing the emotions to rebuilding your confidence on the court.',
  'Injury Recovery',
  'General',
  'Article',
  '7 min',
  'published',
  'Mentality Sports',
  now()
),

(
  'Managing Pre-Game Anxiety',
  'managing-pre-game-anxiety',
  $$## Anxiety Is Not Your Enemy

Let's start with a fact that might surprise you: the physical sensations of anxiety and excitement are nearly identical. Racing heart, sweaty palms, butterflies — your body produces the same response whether you're nervous or pumped.

The difference is the label your brain puts on it. When you tell yourself "I'm so nervous," your brain interprets those sensations as a threat. When you tell yourself "I'm so ready," your brain interprets those same sensations as fuel.

This isn't just feel-good advice. It's backed by research. The technique is called "anxiety reappraisal" — and athletes who use it perform significantly better under pressure.

## The Night Before: Quieting the Mind

1. Set a "worry deadline." Give yourself 10 minutes — and only 10 — to think about tomorrow's game. Write down any worries. Then close the notebook.
2. Avoid watching film or reading scouting reports right before bed. Give your brain at least 30 minutes of non-basketball activity.
3. Use the 4-7-8 breathing technique: inhale for 4 counts, hold for 7, exhale for 8. This activates your body's sleep response. Do 4–6 cycles.
4. If thoughts keep racing, try the "mental dump" — write down every thought in your head, no matter how random. Getting them out of your head and onto paper makes them less powerful.

## Game Day Morning: Reframe the Energy

When you wake up with butterflies, try saying out loud: "I'm excited for today. My body is getting ready to compete."

Your body IS preparing to compete. The adrenaline, the alertness, the energy — these are performance-enhancing responses. Your job isn't to make them go away. Your job is to aim them in the right direction.

Stick to your normal routine. Don't spend the whole day thinking about the game. The more you try to control your thoughts about the game, the more space they take up.

## The 3-3-3 Grounding Technique

If anxiety spikes at any point — in the locker room, during warmups, on the bench — use the 3-3-3 technique:

Name 3 things you can SEE. Name 3 things you can HEAR. Name 3 things you can FEEL.

This takes about 15 seconds and it works because anxiety lives in the future ("What if I mess up?"). Grounding brings you back to the present — which is the only moment where you can actually play basketball.

## During the Game: When Anxiety Hits Mid-Play

In critical moments — free throws with the game on the line, checking in during a close fourth quarter — use a single focus cue. Don't try to think about technique, strategy, and calming down simultaneously.

On free throws: focus only on the front of the rim. When checking in: focus on your first defensive assignment. One thought. One focus. One play at a time.

## Building Long-Term Anxiety Resilience

- Practice deep breathing daily, not just before games. It's a skill that gets better with repetition.
- Expose yourself to pressure situations in practice. The more familiar pressure feels, the less your brain treats it as a threat.
- Talk about your anxiety with your mentor. You're not the only player who feels this way — not even close.
- Prioritize sleep, nutrition, and hydration. Anxiety is significantly worse when your body is depleted.
- Celebrate the moments where you competed through anxiety. That's not just basketball skill — that's life skill.$$,
  'Butterflies before games? Can't sleep the night before? Learn to work with your anxiety instead of fighting it — and use nervous energy as fuel.',
  'Pressure & Anxiety',
  'General',
  'Article',
  '5 min',
  'published',
  'Mentality Sports',
  now()
)

on conflict (slug) do nothing;
