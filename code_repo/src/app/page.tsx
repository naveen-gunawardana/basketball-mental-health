"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  MessageCircle,
  CheckCircle,
  PenLine,
  Target,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const Marquee = dynamic(() => import("react-fast-marquee"), { ssr: false });
const CountUp = dynamic(() => import("react-countup"), { ssr: false });

// ── Scroll-reveal wrapper ─────────────────────────────────────────────────────
function Reveal({
  children,
  className = "",
  delay = 0,
  y = 32,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-64px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── CountUp on scroll ─────────────────────────────────────────────────────────
function CountOnView({ end, suffix = "" }: { end: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <span ref={ref}>
      {inView ? <CountUp end={end} duration={1.8} suffix={suffix} /> : "0"}
    </span>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const ticker = [
  "Athlete to Athlete",
  "1-on-1 Mentorship",
  "Built by Athletes Giving Back",
  "High School Athletes",
  "The Mental Game",
  "Your Time · Your Schedule",
  "All Sports",
];

const features = [
  {
    label: "1-on-1 Mentorship",
    Icon: CheckCircle,
    detail: "Matched with a current or former athlete who's been where you are. Ongoing. No time limits, no scripts.",
  },
  {
    label: "Private Messaging",
    Icon: MessageCircle,
    detail: "A direct line to your mentor between calls. Ask questions, share updates, work through things as they happen — not just during scheduled sessions.",
  },
  {
    label: "Reflection Journal",
    Icon: PenLine,
    detail: "Log your mental state, wins, and struggles after practices and games. Your mentor can see what you choose to share — and follow up accordingly.",
  },
  {
    label: "Session Tracking",
    Icon: Target,
    detail: "Every check-in logged with topics covered, notes, and follow-ups. Nothing gets lost.",
  },
  {
    label: "Advice Library",
    Icon: BookOpen,
    detail: "A growing library of articles on confidence, anxiety, motivation, identity, and every mental challenge athletes face — written by people who've been there.",
  },
  {
    label: "Weekly Mental Goals",
    Icon: CheckCircle,
    detail: "Set and track weekly mental goals with your mentor. Effort, focus, attitude — the stuff that doesn't show up in box scores.",
  },
];

const steps = [
  { n: "01", title: "Apply", desc: "Tell us your sport, level, and what you're working through mentally or emotionally. Takes 3 minutes." },
  { n: "02", title: "Get Matched", desc: "We review every application and match you with someone whose background fits what you're going through." },
  { n: "03", title: "Build It", desc: "Schedule calls when it works. No scripts, no agenda — just honest conversation." },
  { n: "04", title: "Go Deeper", desc: "Tap the article library, log reflections, track goals. The work doesn't stop between calls." },
];


const faqs = [
  {
    q: "Is Mentality Sports free?",
    a: "Yes. 100% free for athletes, forever. Mentors volunteer their time. The platform is funded through nonprofit grants — not athlete fees.",
  },
  {
    q: "Is this therapy or mental health treatment?",
    a: "No. Every mentor is a current or former college athlete, not a licensed therapist. This is peer mentorship — real conversations with someone who's been through the same things. If you're in crisis, we'll refer you to qualified professional support.",
  },
  {
    q: "How does matching work?",
    a: "You tell us your sport, level, and what you're working through mentally. We review every application and match you with a mentor whose background fits yours. It's not automated — we read every one.",
  },
  {
    q: "How often do I meet with my mentor?",
    a: "Weekly check-ins are the goal, but the schedule fits around you. School, practice, games — your mentor works around it. The minimum ask on their end is about 15 minutes a week.",
  },
  {
    q: "What sports do you support?",
    a: "All of them. The platform launched through basketball in San Francisco, but we work with athletes across every sport. If you compete, you're eligible.",
  },
  {
    q: "What if my mentor isn't the right fit?",
    a: "Say the word and we'll rematch you. A real relationship is the whole point — there's no reason to stick with a match that isn't working.",
  },
  {
    q: "Can my coach or parent refer me?",
    a: "Yes. Athletes, parents, and coaches can all start the process at mentalitysports.com. School and team partnerships are also available — email hello@mentalitysports.com.",
  },
  {
    q: "What makes a Mentality Sports mentor qualified?",
    a: "Their experience. Every mentor has competed at the college level and went through the same pressures you're facing — playing time anxiety, coach conflicts, identity after an injury, confidence gaps. That lived experience is the qualification.",
  },
];

const challenges = [
  "Practice-to-game confidence gap",
  "Fear of failure",
  "Pre-competition anxiety",
  "Identity tied to performance",
  "Injury recovery — the mental side",
  "Role and playing time",
  "Motivation and burnout",
  "Inner critic and self-talk",
];

interface FeaturedArticle {
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [serveHover, setServeHover] = useState<"athletes" | "mentors" | null>(null);
  const [featuredArticles, setFeaturedArticles] = useState<FeaturedArticle[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // fetch featured articles for internal linking
  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      createClient()
        .from("resources")
        .select("title, slug, excerpt, category")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(3)
        .then(({ data }) => {
          if (data && data.length > 0) setFeaturedArticles(data as FeaturedArticle[]);
        });
    });
  }, []);

  // timeline line draw
  const timelineRef = useRef(null);
  const timelineInView = useInView(timelineRef, { once: true, margin: "-100px" });

  // hero rotating photos
  const heroPhotos = [
    { src: "/header_images/football.jpg", pos: "70% center" },
    { src: "/header_images/mentor.png",   pos: "65% center" },
    { src: "/header_images/soccer.png",   pos: "65% center" },
  ];
  const [photoTick, setPhotoTick] = useState(0);
  const photoIdx = photoTick % heroPhotos.length;
  useEffect(() => {
    const id = setInterval(() => setPhotoTick(t => t + 1), 5000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // hero cursor spotlight
  const heroRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onMove = (e: MouseEvent) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      hero.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    hero.addEventListener("mousemove", onMove);
    return () => hero.removeEventListener("mousemove", onMove);
  }, []);

  // hero canvas particles — glowing embers
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.offsetWidth : window.innerWidth;
      canvas.height = parent ? parent.offsetHeight : window.innerHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    type P = { x: number; y: number; r: number; speed: number; alpha: number; drift: number; life: number; maxLife: number };
    const make = (): P => {
      const maxLife = 120 + Math.random() * 200;
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        r: Math.random() * 2.5 + 1,
        speed: Math.random() * 0.8 + 0.3,
        alpha: 0,
        drift: (Math.random() - 0.5) * 0.5,
        life: 0,
        maxLife,
      };
    };
    const particles: P[] = Array.from({ length: 70 }, () => {
      const p = make();
      p.y = Math.random() * canvas.height; // scatter initial y
      p.life = Math.random() * p.maxLife;
      return p;
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.life++;
        p.y -= p.speed;
        p.x += p.drift;
        // fade in then out
        const progress = p.life / p.maxLife;
        p.alpha = progress < 0.2
          ? progress / 0.2
          : progress > 0.7
            ? 1 - (progress - 0.7) / 0.3
            : 1;

        if (p.life >= p.maxLife || p.y < -10) {
          Object.assign(p, make());
          continue;
        }

        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(220, 120, 60, ${p.alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 130, 70, ${p.alpha * 0.85})`;
        ctx.fill();
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="overflow-x-hidden">

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative flex flex-col bg-[#0c1628] min-h-svh overflow-hidden"
        style={{ "--mx": "50%", "--my": "40%" } as React.CSSProperties}
      >
        {/* ── Right-side photo panel ── */}
        <div className="absolute inset-0 hidden lg:block overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.div
              key={photoTick}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
              style={{
                backgroundImage: `url("${heroPhotos[photoIdx].src}")`,
                backgroundSize: "cover",
                backgroundPosition: heroPhotos[photoIdx].pos,
                backgroundRepeat: "no-repeat",
              }}
            />
          </AnimatePresence>
          {/* Glass fade — full width, solid left to transparent right */}
          <div
            className="absolute inset-0 z-10"
            style={{
              background: "linear-gradient(to right, #0c1628 0%, #0c1628 25%, rgba(12,22,40,0.9) 45%, rgba(12,22,40,0.4) 70%, transparent 100%)",
            }}
          />
          <div className="absolute inset-x-0 top-0 h-32 z-10" style={{ background: "linear-gradient(to bottom, #0c1628, transparent)" }} />
          <div className="absolute inset-x-0 bottom-0 h-32 z-10" style={{ background: "linear-gradient(to top, #0c1628, transparent)" }} />
        </div>


        {/* ── Film grain ── */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.055,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "300px",
          }}
        />

        {/* ── Cursor spotlight ── */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(600px circle at var(--mx) var(--my), rgba(196,99,58,0.13), transparent 60%)",
          }}
        />

        {/* ── Ember particles canvas ── */}
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ width: "100%", height: "100%" }}
        />

        {/* ── Left edge accent bar ── */}
        <motion.div
          aria-hidden
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:block top-0 bottom-0 left-0 absolute w-[3px] origin-top pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent 0%, #C4633A 30%, #C4633A 70%, transparent 100%)" }}
        />

        {/* ── Main content ── */}
        <div className="z-10 relative flex flex-col flex-1 justify-end mx-auto px-8 sm:px-12 lg:px-16 pt-32 pb-20 w-full max-w-7xl">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-8"
          >
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="block bg-orange-400 w-10 h-px origin-left"
            />
            <span className="font-bold text-[10px] text-orange-400 uppercase tracking-[0.35em]">
              Athlete to Athlete · Free · All Sports
            </span>
          </motion.div>

          {/* ── HEADLINE ── */}
          <h1 aria-label="Your mind deserves a teammate" className="mb-8">
            {[
              { text: "YOUR MIND", orange: false },
              { text: "DESERVES A", orange: true },
              { text: "TEAMMATE.", orange: false },
            ].map(({ text, orange }, i) => (
              <div key={text} className="overflow-hidden leading-none">
                <motion.span
                  className={`block font-condensed font-black italic ${orange ? "text-orange-400" : "text-white"}`}
                  style={{
                    fontSize: "clamp(4.8rem, 13vw, 11.5rem)",
                    lineHeight: 0.87,
                    letterSpacing: "-0.02em",
                  }}
                  initial={{ y: "108%", skewY: 4 }}
                  animate={{ y: "0%", skewY: 0 }}
                  transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.08 + i * 0.11 }}
                >
                  {text}
                </motion.span>
              </div>
            ))}
          </h1>

          {/* ── Animated divider line ── */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.58, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 max-w-md h-px origin-left"
            style={{ background: "linear-gradient(to right, #C4633A, rgba(196,99,58,0.2), transparent)" }}
          />

          {/* ── Description + CTAs ── */}
          <div className="flex sm:flex-row flex-col sm:items-end gap-8 sm:gap-14">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65 }}
              className="max-w-[340px] text-[15px] leading-relaxed"
              style={{ color: "rgba(255,255,255,0.52)" }}
            >
              Paired with a current or former athlete who played through the same mental battles you&apos;re facing right now. Real people. Real experience. Free.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-wrap gap-3 shrink-0"
            >
              <Link
                href="/signup?role=player"
                className="group inline-flex items-center gap-3 bg-orange-500 hover:bg-orange-400 px-7 py-4 font-bold text-white text-sm transition-all duration-200"
                style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}
              >
                Get Matched
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/signup?role=mentor"
                className="group inline-flex items-center gap-3 bg-white/[0.06] hover:bg-white/[0.12] px-7 py-4 border border-white/20 font-bold text-white text-sm transition-all duration-200"
                style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}
              >
                Give Back as a Mentor
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </div>

          {/* ── Photo indicator dots ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="flex items-center gap-2 mt-10"
          >
            {heroPhotos.map((_, i) => (
              <button
                key={i}
                onClick={() => setPhotoTick(t => Math.floor(t / heroPhotos.length) * heroPhotos.length + i)}
                aria-label={`Photo ${i + 1}`}
                className="rounded-full focus:outline-none transition-all duration-400"
                style={{
                  width: i === photoIdx ? "24px" : "6px",
                  height: "6px",
                  background: i === photoIdx ? "#C4633A" : "rgba(255,255,255,0.25)",
                }}
              />
            ))}
            <span className="ml-2 font-bold text-[10px] text-white/20 uppercase tracking-[0.25em]">
              {photoIdx + 1} / {heroPhotos.length}
            </span>
          </motion.div>
        </div>

        {/* ── Stats strip ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="z-10 relative"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(12,22,40,0.75)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <div className="mx-auto px-8 sm:px-12 lg:px-16 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.07]">
              {[
                { val: "All Sports", lbl: "Not just one" },
                { val: "100% Free", lbl: "Always, for athletes" },
                { val: "Athlete-to-Athlete", lbl: "Peer mentorship" },
                { val: "1-on-1", lbl: "Personally matched" },
              ].map((s) => (
                <div key={s.lbl} className="px-5 py-5">
                  <p className="font-bold text-[13px] text-orange-400 tracking-wide">{s.val}</p>
                  <p className="mt-1 text-[10px] text-white/25 uppercase tracking-wider">{s.lbl}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── MARQUEE ──────────────────────────────────────────────────────── */}
      <div className="bg-orange-500 py-[10px]">
        <Marquee speed={50} gradient={false}>
          {[...ticker, ...ticker].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-8 mx-8 font-bold text-[11px] text-white uppercase tracking-[0.18em]">
              {item}
              <span className="bg-white/40 rounded-full w-1 h-1 shrink-0" />
            </span>
          ))}
        </Marquee>
      </div>

      {/* ─── MISSION ──────────────────────────────────────────────────────── */}
      {/* Fragmented editorial typography — no cards, just bold text at scale */}
      <section className="relative bg-white overflow-hidden">
        {/* Giant decorative "01" */}
        <div
          aria-hidden
          className="top-1/2 right-0 absolute font-bold text-offWhite-300 leading-none -translate-y-1/2 pointer-events-none select-none"
          style={{ fontSize: "clamp(16rem, 28vw, 28rem)", lineHeight: 1, opacity: 0.6 }}
        >
          01
        </div>

        <div className="z-10 relative mx-auto px-6 sm:px-8 lg:px-12 py-28 max-w-7xl">
          <Reveal>
            <p className="flex items-center gap-4 mb-16 font-bold text-[11px] text-orange-500 uppercase tracking-[0.22em]">
              <span className="bg-orange-400 w-8 h-px" />
              Our Mission
            </p>
          </Reveal>

          <div className="space-y-0 max-w-4xl">
            {[
              { text: "Coaches teach the game.", size: "clamp(2rem, 4vw, 3.4rem)", color: "text-navy/30", delay: 0.05 },
              { text: "Trainers build the body.", size: "clamp(2rem, 4vw, 3.4rem)", color: "text-navy/30", delay: 0.1 },
              { text: "But nobody builds a", size: "clamp(2rem, 4vw, 3.4rem)", color: "text-navy", delay: 0.15 },
              { text: "real relationship.", size: "clamp(2.6rem, 5.5vw, 4.8rem)", color: "text-orange-400", delay: 0.2 },
            ].map((line) => (
              <Reveal key={line.text} delay={line.delay} y={20}>
                <p className={`font-bold leading-[1.1] tracking-tight ${line.color}`} style={{ fontSize: line.size }}>
                  {line.text}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.35} className="flex items-center gap-8 mt-16">
            <div className="flex-1 bg-navy/15 max-w-[80px] h-px" />
            <p className="font-bold text-[11px] text-navy/35 uppercase tracking-[0.22em]">
              That&apos;s the gap we&apos;re here to close.
            </p>
          </Reveal>

          {/* Stat row */}
          <Reveal delay={0.4} className="gap-0 grid grid-cols-3 mt-16 pt-10 border-offWhite-300 border-t max-w-lg">
            {[
              { n: 20, suffix: "+", label: "Sports covered" },
              { n: 100, suffix: "%", label: "Athlete-led" },
              { n: 1, suffix: "-on-1", label: "Every match" },
            ].map((s) => (
              <div key={s.label} className="pr-8">
                <p className="font-bold tabular-nums text-navy text-3xl">
                  <CountOnView end={s.n} suffix={s.suffix} />
                </p>
                <p className="mt-1 text-[11px] text-navy/35 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ─── WHO WE SERVE ─────────────────────────────────────────────────── */}
      {/* Full-height interactive split — panels push/pull on hover */}
      <section className="flex md:flex-row flex-col min-h-[560px]">
        {/* Athletes panel */}
        <motion.div
          onHoverStart={() => setServeHover("athletes")}
          onHoverEnd={() => setServeHover(null)}
          animate={{ flex: serveHover === "mentors" ? 0.65 : serveHover === "athletes" ? 1.35 : 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col justify-between bg-navy p-10 lg:p-14 min-h-[280px] md:min-h-0 overflow-hidden cursor-default"
        >
          {/* Watermark letter */}
          <div aria-hidden className="right-4 bottom-0 absolute font-bold text-white/[0.04] leading-none pointer-events-none select-none" style={{ fontSize: "22rem", lineHeight: 1 }}>A</div>
          <div className="z-10 relative">
            <span className="inline-block bg-orange-500 mb-8 px-3 py-1 rounded-sm font-bold text-[10px] text-white uppercase tracking-widest">Athletes</span>
            <p className="max-w-xs text-[15px] text-white/65 leading-relaxed">
              Struggling with the mental side of competing — anxiety, confidence, identity, or just needing honest guidance from someone who gets it.

            </p>
          </div>
          <div className="z-10 relative mt-10">
            <Link href="/signup?role=player" className="group inline-flex items-center gap-2 font-bold text-orange-400 hover:text-orange-300 text-sm transition-colors">
              Find a Mentor <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>

        {/* Divider line */}
        <div className="hidden md:block bg-white/10 w-px shrink-0" />

        {/* Mentors panel */}
        <motion.div
          onHoverStart={() => setServeHover("mentors")}
          onHoverEnd={() => setServeHover(null)}
          animate={{ flex: serveHover === "athletes" ? 0.65 : serveHover === "mentors" ? 1.35 : 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col justify-between bg-offWhite p-10 lg:p-14 min-h-[280px] md:min-h-0 overflow-hidden cursor-default"
        >
          <div aria-hidden className="right-4 bottom-0 absolute font-bold text-navy/[0.05] leading-none pointer-events-none select-none" style={{ fontSize: "22rem", lineHeight: 1 }}>M</div>
          <div className="z-10 relative">
            <span className="inline-block bg-navy mb-8 px-3 py-1 rounded-sm font-bold text-[10px] text-white uppercase tracking-widest">Mentors</span>
            <p className="max-w-xs text-[15px] text-navy/65 leading-relaxed">
              You&apos;ve been through it — the pressure, the doubt, the setbacks. That&apos;s the kind of experience that actually helps someone.
            </p>
          </div>
          <div className="z-10 relative mt-10">
            <Link href="/signup?role=mentor" className="group inline-flex items-center gap-2 font-bold text-navy hover:text-orange-500 text-sm transition-colors">
              Apply to Mentor <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── OPPORTUNITIES CTA ────────────────────────────────────────────── */}
      <section className="bg-[#f5f0e8] border-[#0a1628]/8 border-t">
        <div className="flex sm:flex-row flex-col justify-between items-center gap-6 mx-auto px-6 sm:px-8 lg:px-12 py-14 max-w-7xl">
          <div>
            <p className="mb-2 font-bold text-[#e8703a] text-[11px] uppercase tracking-[0.22em]">Join the Team</p>
            <h2 className="font-bold text-[#0a1628] text-2xl sm:text-3xl tracking-tight">Work With Us</h2>
            <p className="mt-1.5 max-w-md text-[#0a1628]/50 text-[14px]">We&apos;re accepting applications for Summer 2026 internships. Join the team building the mental health infrastructure athletes never had.</p>
          </div>
          <Link
            href="/opportunities"
            className="group inline-flex items-center gap-2.5 bg-[#0a1628] hover:bg-[#e8703a] px-7 py-3.5 rounded-sm font-bold text-[#f5f0e8] text-sm transition-colors shrink-0"
          >
            See Openings
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
      {/* Vertical timeline with animated draw line */}
      <section className="bg-white px-6 sm:px-8 py-28 border-offWhite-300 border-t">
        <div className="mx-auto max-w-5xl">
          <Reveal className="flex flex-wrap justify-between items-end gap-6 mb-20">
            <div>
              <p className="mb-3 font-bold text-[11px] text-orange-500 uppercase tracking-[0.22em]">The process</p>
              <h2 className="font-bold text-navy tracking-tight" style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)" }}>How it works</h2>
            </div>
            <Link href="/signup?role=player" className="group inline-flex items-center gap-2 font-bold text-navy hover:text-orange-500 text-sm transition-colors shrink-0">
              Apply now <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Reveal>

          <div ref={timelineRef} className="relative">
            {/* Animated vertical line */}
            <div className="hidden sm:block top-2 bottom-2 left-[19px] absolute bg-offWhite-300 w-px" />
            <motion.div
              className="hidden sm:block top-2 left-[19px] absolute bg-orange-400 w-px origin-top"
              initial={{ scaleY: 0 }}
              animate={timelineInView ? { scaleY: 1 } : {}}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              style={{ bottom: 2 }}
            />

            <div className="space-y-0">
              {steps.map((s, i) => (
                <Reveal key={s.n} delay={i * 0.12} y={20}>
                  <div className="flex items-start gap-8 sm:gap-12 py-10 border-offWhite-300 last:border-0 border-b">
                    {/* Circle on timeline */}
                    <div className="hidden relative flex sm:flex flex-col items-center shrink-0">
                      <div className="z-10 flex justify-center items-center bg-white border-2 border-orange-400 rounded-full w-10 h-10">
                        <span className="font-bold text-[10px] text-orange-500">{s.n}</span>
                      </div>
                    </div>

                    {/* Mobile step number */}
                    <span className="sm:hidden pt-1 font-bold text-[11px] text-orange-500 shrink-0">{s.n}</span>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-baseline gap-4 mb-3">
                        <h3 className="font-bold text-navy text-xl">{s.title}</h3>
                        {/* Large ghost number */}
                        <span className="hidden lg:block font-bold text-offWhite-300 text-5xl leading-none select-none">{s.n}</span>
                      </div>
                      <p className="max-w-md text-navy/65 text-sm leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PLATFORM ─────────────────────────────────────────────────────── */}
      {/* Feature spotlight — no bento grid. Hover left rail, see detail right. */}
      <section className="bg-navy px-6 sm:px-8 py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-16">
            <p className="mb-3 font-bold text-[11px] text-orange-400 uppercase tracking-[0.22em]">The platform</p>
            <h2 className="font-bold text-white tracking-tight" style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)" }}>
              Everything in<br />one place.
            </h2>
          </Reveal>

          <div className="gap-px grid grid-cols-1 lg:grid-cols-[280px_1fr] bg-white/8 border border-white/8 rounded-sm overflow-hidden">
            {/* Left rail — feature list */}
            <div className="bg-navy">
              {features.map((f, i) => (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => setActiveFeature(i)}
                  className={`w-full text-left px-7 py-5 flex items-center gap-4 border-b border-white/8 last:border-0 transition-colors group ${activeFeature === i ? "bg-white/8" : "hover:bg-white/4"}`}
                >
                  <f.Icon className={`h-4 w-4 shrink-0 transition-colors ${activeFeature === i ? "text-orange-400" : "text-white/25 group-hover:text-white/50"}`} />
                  <span className={`text-sm font-semibold transition-colors ${activeFeature === i ? "text-white" : "text-white/35 group-hover:text-white/70"}`}>{f.label}</span>
                  {activeFeature === i && (
                    <motion.div layoutId="feature-indicator" className="bg-orange-400 ml-auto rounded-full w-1 h-1 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Right — spotlight */}
            <div className="flex flex-col justify-between bg-navy p-10 lg:p-14 min-h-[320px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {(() => { const f = features[activeFeature]; return (
                    <>
                      <div>
                        <f.Icon className="mb-6 w-8 h-8 text-orange-400" />
                        <h3 className="mb-4 font-bold text-white text-2xl">{f.label}</h3>
                        <p className="max-w-lg text-[15px] text-white/65 leading-relaxed">{f.detail}</p>
                      </div>
                      <p className="mt-8 font-bold text-[11px] text-white/15 uppercase tracking-[0.18em]">
                        {String(activeFeature + 1).padStart(2, "0")} / {String(features.length).padStart(2, "0")}
                      </p>
                    </>
                  ); })()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CHALLENGES ───────────────────────────────────────────────────── */}
      {/* Marquee of challenges + bold "what we provide" statement blocks */}
      <section className="bg-offWhite py-28 border-offWhite-300 border-t">
        {/* Challenge marquee */}
        <div className="mb-20">
          <Reveal className="mx-auto mb-8 px-6 sm:px-8 max-w-7xl">
            <p className="font-bold text-[11px] text-orange-500 uppercase tracking-[0.22em]">Sound familiar?</p>
          </Reveal>
          <Marquee speed={35} gradient={false} className="py-2">
            {[...challenges, ...challenges].map((c, i) => (
              <span key={i} className="inline-flex items-center gap-6 mx-6 font-semibold text-navy/40 text-sm">
                {c}
                <span className="bg-orange-400/60 rounded-full w-1 h-1 shrink-0" />
              </span>
            ))}
          </Marquee>
        </div>

        {/* What we provide — bold statement cards, not a grid */}
        <div className="mx-auto px-6 sm:px-8 max-w-7xl">
          <Reveal className="mb-12">
            <h2 className="font-bold text-navy tracking-tight" style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)" }}>
              Here&apos;s what<br />we give you.
            </h2>
          </Reveal>

          <div className="space-y-px bg-offWhite-300 border border-offWhite-300 rounded-sm overflow-hidden">
            {[
              { title: "A Real Mentor", desc: "Matched with a current or former athlete whose experience fits yours. Ongoing — not a one-time call.", accent: "bg-orange-500" },
              { title: "Mental Guidance", desc: "Work through what competing at your level does to your head — with someone who's been there.", accent: "bg-navy" },
              { title: "Advice Library", desc: "Articles on confidence, anxiety, identity, and the parts of the mental game nobody talks about.", accent: "bg-sage-600" },
              { title: "Built to Give Back", desc: "Mentors are here because they chose to be. No cost, no subscriptions.", accent: "bg-gold-500" },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.07}>
                <div className="group flex items-start gap-6 bg-white hover:bg-offWhite/60 px-8 py-7 transition-colors">
                  <div className={`h-2 w-2 rounded-full ${item.accent} mt-2 shrink-0`} />
                  <div className="flex sm:flex-row flex-col flex-1 sm:items-center sm:gap-12">
                    <h3 className="w-44 font-bold text-navy text-base shrink-0">{item.title}</h3>
                    <p className="mt-1 sm:mt-0 text-navy/65 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                  <ArrowRight className="hidden sm:block mt-0.5 w-4 h-4 text-navy/20 group-hover:text-orange-400 transition-all group-hover:translate-x-0.5 shrink-0" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ADVICE PREVIEW ───────────────────────────────────────────────── */}
      {/* Asymmetric: 1 large left + 2 stacked right */}
      <section className="bg-white px-6 sm:px-8 py-24 border-offWhite-300 border-t">
        <div className="mx-auto max-w-7xl">
          <Reveal className="flex flex-wrap justify-between items-end gap-4 mb-14">
            <div>
              <p className="mb-3 font-bold text-[11px] text-orange-500 uppercase tracking-[0.22em]">From the library</p>
              <h2 className="font-bold text-navy tracking-tight" style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)" }}>
                Read what athletes<br />actually deal with.
              </h2>
            </div>
            <Link href="/advice" className="group inline-flex items-center gap-2 font-bold text-navy hover:text-orange-500 text-sm transition-colors shrink-0">
              View all <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Reveal>

          {featuredArticles.length > 0 ? (
            <div className="gap-4 grid grid-cols-1 md:grid-cols-[1fr_340px]">
              {/* Large featured */}
              <Reveal>
                <Link href={`/advice/${featuredArticles[0].slug}`}>
                  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="flex flex-col gap-6 bg-navy p-10 rounded-sm h-full min-h-[320px] cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-orange-400" />
                      <span className="font-bold text-[10px] text-white/30 uppercase tracking-widest">{featuredArticles[0].category ?? "Mental Performance"}</span>
                    </div>
                    <h3 className="flex-1 font-bold text-white text-xl leading-snug">
                      {featuredArticles[0].title}
                    </h3>
                    {featuredArticles[0].excerpt && (
                      <p className="text-white/65 text-sm leading-relaxed">{featuredArticles[0].excerpt}</p>
                    )}
                    <span className="group inline-flex items-center gap-2 mt-auto font-bold text-orange-400 hover:text-orange-300 text-sm transition-colors">
                      Read <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </motion.div>
                </Link>
              </Reveal>

              {/* Two stacked */}
              <div className="flex flex-col gap-4">
                {featuredArticles.slice(1, 3).map((article, i) => (
                  <Reveal key={article.slug} delay={i * 0.08} className="flex-1">
                    <Link href={`/advice/${article.slug}`}>
                      <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="flex flex-col gap-4 bg-offWhite p-7 border border-offWhite-300 rounded-sm h-full cursor-pointer">
                        <div className="flex items-center gap-2.5">
                          <BookOpen className="w-4 h-4 text-orange-400" />
                          <span className="font-bold text-[10px] text-navy/35 uppercase tracking-widest">{article.category ?? "Mental Performance"}</span>
                        </div>
                        <h3 className="flex-1 font-bold text-navy text-sm leading-snug">{article.title}</h3>
                        {article.excerpt && (
                          <p className="text-navy/65 text-xs line-clamp-2 leading-relaxed">{article.excerpt}</p>
                        )}
                      </motion.div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          ) : (
            <div className="gap-4 grid grid-cols-1 md:grid-cols-[1fr_340px]">
              <Reveal>
                <Link href="/advice">
                  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="flex flex-col gap-6 bg-navy p-10 rounded-sm h-full min-h-[320px] cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-orange-400" />
                      <span className="font-bold text-[10px] text-white/30 uppercase tracking-widest">Confidence</span>
                    </div>
                    <h3 className="flex-1 font-bold text-white text-xl leading-snug">
                      Translating Practice Confidence to Games
                    </h3>
                    <p className="text-white/65 text-sm leading-relaxed">Why your brain treats games differently than practice — and how to close the gap.</p>
                    <span className="group inline-flex items-center gap-2 mt-auto font-bold text-orange-400 text-sm">
                      Read <ArrowRight className="w-4 h-4" />
                    </span>
                  </motion.div>
                </Link>
              </Reveal>
              <div className="flex flex-col gap-4">
                {[
                  { title: "Managing Pre-Game Anxiety", cat: "Pressure & Anxiety", slug: "managing-pre-game-anxiety" },
                  { title: "Losing Your Starting Spot: Identity After the Bench", cat: "Identity", slug: "losing-starting-spot-basketball" },
                ].map((r, i) => (
                  <Reveal key={r.slug} delay={i * 0.08} className="flex-1">
                    <Link href={`/advice/${r.slug}`}>
                      <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="flex flex-col gap-4 bg-offWhite p-7 border border-offWhite-300 rounded-sm h-full cursor-pointer">
                        <div className="flex items-center gap-2.5">
                          <BookOpen className="w-4 h-4 text-orange-400" />
                          <span className="font-bold text-[10px] text-navy/35 uppercase tracking-widest">{r.cat}</span>
                        </div>
                        <h3 className="flex-1 font-bold text-navy text-sm leading-snug">{r.title}</h3>
                      </motion.div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>


      {/* ─── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="bg-white px-6 sm:px-8 py-28 border-offWhite-300 border-t">
        <div className="mx-auto max-w-4xl">
          <Reveal className="mb-16">
            <p className="mb-3 font-bold text-[11px] text-orange-500 uppercase tracking-[0.22em]">Common questions</p>
            <h2 className="font-bold text-navy tracking-tight" style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)" }}>
              Straight answers.
            </h2>
          </Reveal>

          <div className="space-y-px bg-offWhite-300 border border-offWhite-300 rounded-sm overflow-hidden">
            {faqs.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 0.04}>
                <div className="bg-white">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="group flex justify-between items-center gap-6 hover:bg-offWhite/60 px-8 py-6 w-full text-left transition-colors"
                    aria-expanded={openFaq === i}
                  >
                    <span className="font-semibold text-[15px] text-navy leading-snug">{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-navy/30 shrink-0 transition-transform duration-300 group-hover:text-orange-400 ${openFaq === i ? "rotate-180 text-orange-400" : ""}`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-8 pb-6 max-w-2xl text-navy/65 text-sm leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2} className="mt-10 text-center">
            <p className="text-navy/40 text-sm">
              Still have questions?{" "}
              <a href="mailto:hello@mentalitysports.com" className="font-semibold text-orange-500 hover:text-orange-400 transition-colors">
                Email us
              </a>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="bg-navy px-6 sm:px-8 py-28">
        <div className="mx-auto max-w-7xl">
          <div className="items-center gap-12 grid grid-cols-1 lg:grid-cols-2">
            <Reveal>
              <p className="mb-5 font-bold text-[11px] text-orange-400 uppercase tracking-[0.22em]">Jump in</p>
              <h2 className="font-bold text-white leading-[1.02] tracking-tight" style={{ fontSize: "clamp(2.5rem, 5vw, 4.2rem)" }}>
                Pick<br />your side.
              </h2>
              <p className="mt-6 max-w-sm text-[15px] text-white/65 leading-relaxed">
                Athlete looking for a mentor, or former player ready to give back — same place, different door.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="space-y-3">
              <Link href="/signup?role=player" className="group flex justify-between items-center bg-orange-500 hover:bg-orange-400 px-7 py-4 rounded-sm font-bold text-white text-sm transition-colors">
                I&apos;m an Athlete <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/signup?role=mentor" className="group flex justify-between items-center bg-white/5 hover:bg-white/10 px-7 py-4 border border-white/15 rounded-sm font-bold text-white text-sm transition-colors">
                I want to be a Mentor <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

    </div>
  );
}
