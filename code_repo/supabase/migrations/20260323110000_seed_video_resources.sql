-- Confirmed YouTube video embeds (IDs verified via third-party page metadata)
-- Uses [youtube:VIDEO_ID] syntax rendered by the article detail page

insert into public.resources (title, slug, content, excerpt, category, sport, media_type, read_time, status, submitted_by_name, published_at) values

(
  'Athletes and Mental Health: The Hidden Opponent',
  'hidden-opponent-victoria-garrick',
  E'## About This Talk\n\nVictoria Garrick was a Division I volleyball player at USC when she realized she was struggling with depression, anxiety, and disordered eating — and had no idea how to talk about it in an athletic environment where toughness was everything.\n\nIn this TEDx talk she shares her story openly, calls out the culture of silence in competitive sports, and argues that mental illness deserves the same treatment as a physical injury.\n\nThis talk has been watched over 600,000 times and has been screened at athletic programs across the country.\n\n[youtube:Sdk7pLpbIls]\n\n## Why This Matters\n\nVictoria''s experience — loving the sport, performing on the outside, falling apart on the inside — is one of the most common stories in college athletics. The fact that she named it publicly changed the conversation for a lot of athletes who thought they were alone in it.\n\nShe went on to found The Hidden Opponent, a nonprofit dedicated to student-athlete mental health advocacy.',
  'USC volleyball player Victoria Garrick shares her experience with depression and anxiety as a college athlete — and why the sports world needs to change how it handles mental health.',
  'Identity',
  'Volleyball',
  'Video',
  '42 min',
  'published',
  'TEDx Talks',
  now()
),

(
  'The Weight of Gold: Inside Olympic Athlete Mental Health',
  'weight-of-gold-hbo-trailer',
  E'## About This Documentary\n\nNarrated and executive-produced by Michael Phelps, The Weight of Gold examines what happens to elite Olympic athletes after the competition ends — post-Olympic depression, anxiety, identity loss, and the mental health crises that the sports world rarely talks about.\n\nPhelps, who has been open about his own battles with depression and suicidal ideation, interviews multiple Olympic medalists across swimming, gymnastics, speed skating, and other sports about their mental health experiences.\n\n[youtube:LzGdIh3ciSk]\n\n## What It Covers\n\nThe documentary focuses on a reality that most fans never see: athletes who spent their entire lives working toward a single goal, achieve it, and then feel completely empty. The structures that gave their lives meaning — training, competition, team — disappear, and there is nothing to replace them.\n\nFor swimmers specifically, the individual nature of the sport and the identity compression that comes with years of elite training make the post-competition transition particularly hard.\n\n## Full Film\n\nThe full documentary is available on HBO Max. The trailer above gives a strong overview of the themes and the athletes featured.',
  'Michael Phelps narrates this HBO documentary examining post-Olympic depression, anxiety, and mental health crises among elite swimmers and Olympic athletes.',
  'Identity',
  'Swimming',
  'Video',
  '3 min',
  'published',
  'HBO',
  now()
),

(
  'Win the Game of Life with Sport Psychology',
  'win-game-life-sport-psychology-fader',
  E'## About This Talk\n\nDr. Jonathan Fader is the Director of Mental Conditioning for the New York Giants and has worked with professional athletes across basketball, baseball, and football. In this TEDx talk he makes the case that the mental skills elite athletes use — self-talk, visualization, pre-performance routines — are not exclusive to sport.\n\nBut for athletes, this talk is most useful as a clear explanation of what sport psychology actually is and how it improves performance.\n\n[youtube:4Lxj5FEpEG4]\n\n## Key Ideas\n\n**Self-talk is a trainable skill.** What you say to yourself before and during competition directly affects how you perform. The athletes who manage self-talk deliberately have a consistent edge over those who don''t.\n\n**Visualization builds real neural pathways.** The brain does not reliably distinguish between a vividly imagined performance and a real one. Athletes who visualize systematically are practicing their sport without a ball in their hands.\n\n**Pre-performance routines compress mental preparation into a reliable signal.** The routine is not superstition — it is a repeatable trigger that tells your nervous system to enter a specific state.\n\n## Why Basketball Players Benefit Most\n\nBasketball''s combination of individual skill execution and team decision-making under pressure makes it one of the highest-value sports for the mental performance work Dr. Fader describes here.',
  'Dr. Jonathan Fader, mental conditioning coach for the NY Giants, explains the sport psychology tools that elite athletes use — and how they work.',
  'Confidence',
  'Basketball',
  'Video',
  '18 min',
  'published',
  'TEDx Talks',
  now()
),

(
  'The Toxicity of Sport Culture on Athlete Mental Health',
  'toxicity-sport-culture-hillary-cauthen',
  E'## About This Talk\n\nDr. Hillary Cauthen is a clinical sport psychologist who has worked with Olympic athletes, professional teams, and college programs. In this TEDx talk she makes a direct argument: it is not individual athletes who are failing mentally — it is the culture of sport that is failing athletes.\n\nShe identifies three specific cultural mechanisms that damage athlete mental wellness and offers concrete strategies for coaches, programs, and athletes to create healthier environments.\n\n[youtube:UzTP3f_6coA]\n\n## The Three Cultural Problems She Names\n\n**1. The normalization of pain and sacrifice.** When suffering is treated as proof of commitment, athletes lose the ability to distinguish between productive challenge and harmful damage.\n\n**2. The suppression of vulnerability.** In a culture where showing struggle is weakness, athletes become experts at hiding — from coaches, teammates, and themselves.\n\n**3. The identity collapse.** When sport is everything, any threat to athletic performance becomes a threat to the whole self. This is the foundation of most mental health crises in competitive athletics.\n\n## Why This Matters for Soccer\n\nSoccer''s global culture of toughness — the expectation that players run through pain, perform through pressure, and never show weakness — makes it one of the sports where Dr. Cauthen''s framework is most directly relevant. The pressure starts early, often before age 10, and compounds through club, high school, and college competition.',
  'Sport psychologist Dr. Hillary Cauthen identifies the three cultural mechanisms that damage athlete mental health — and what programs can actually do about it.',
  'Other',
  'Soccer',
  'Video',
  '16 min',
  'published',
  'TEDx Talks',
  now()
);
