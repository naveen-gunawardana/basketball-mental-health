"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  MessageCircle,
  Video,
  CheckCircle,
  PenLine,
  Target,
} from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Marquee from "react-fast-marquee";
import CountUp from "react-countup";

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
    detail: "Matched with a current or former athlete who's navigated what you're facing — in sport and in life. Ongoing. Personal. Real.",
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
    detail: "Every check-in documented with topics covered, notes, and follow-ups flagged. Nothing falls through the cracks.",
  },
  {
    label: "Advice Library",
    Icon: BookOpen,
    detail: "A growing library of articles on confidence, anxiety, motivation, identity, and every mental challenge athletes face — written by people who've been there.",
  },
  {
    label: "Weekly Mental Goals",
    Icon: CheckCircle,
    detail: "Set and track weekly mental performance goals with your mentor. Effort, focus, attitude — the things that actually move the needle.",
  },
];

const steps = [
  { n: "01", title: "Apply", desc: "Tell us your sport, level, and what you're working through mentally or emotionally. Takes 3 minutes." },
  { n: "02", title: "Get Matched", desc: "We personally review every application and pair you with a mentor whose experience mirrors exactly what you're facing." },
  { n: "03", title: "Build It", desc: "Schedule calls whenever it works for you. Honest conversation — no scripts, no agenda. Just real talk." },
  { n: "04", title: "Go Deeper", desc: "Tap the resource library anytime. Log reflections. Track goals. The relationship keeps growing." },
];

const mentors = [
  { initials: "JM", name: "Jordan M.", bg: "D1 Basketball · 4 yrs", tags: ["Confidence", "Pressure"], quote: "I spent two years riding the bench before earning my starting spot. I know what that grind feels like — and how to get through it." },
  { initials: "AT", name: "Alexis T.", bg: "D3 Soccer · 4 yrs", tags: ["Anxiety", "Identity"], quote: "I dealt with performance anxiety all through college. Nobody talked about it. I want to be the mentor I needed back then." },
  { initials: "MR", name: "Marcus R.", bg: "Football · 6 yrs", tags: ["Injury recovery", "Motivation"], quote: "Tore my ACL in high school. The mental side of that recovery was harder than the physical. I've been there." },
  { initials: "SP", name: "Simone P.", bg: "Track & Field · 5 yrs", tags: ["Goal setting", "Burnout"], quote: "When sport becomes your whole identity, losing hits different. I help athletes separate who they are from what they do." },
  { initials: "DK", name: "Devon K.", bg: "College Basketball · 4 yrs", tags: ["Coach comms", "Playing time"], quote: "Transferred twice. Dealt with every version of the coach relationship problem. I can help you navigate those conversations." },
  { initials: "NW", name: "Nia W.", bg: "Volleyball · 5 yrs", tags: ["Team dynamics", "Resilience"], quote: "Sport taught me resilience the hard way. I'm here to help athletes build that strength before the hard moments come." },
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

// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [serveHover, setServeHover] = useState<"athletes" | "mentors" | null>(null);

  // timeline line draw
  const timelineRef = useRef(null);
  const timelineInView = useInView(timelineRef, { once: true, margin: "-100px" });

  return (
    <div className="overflow-x-hidden">

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[94vh] bg-navy flex flex-col overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "300px",
          }}
        />

        <div className="relative z-10 flex-1 flex flex-col justify-center mx-auto max-w-7xl w-full px-6 sm:px-8 lg:px-12 pt-20 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 xl:gap-16 items-center">

            {/* Left */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-3 mb-8"
              >
                <span className="h-px w-8 bg-orange-400/50" />
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-400/80">Athlete to Athlete</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 64 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
                className="font-bold leading-[0.9] tracking-tight text-white mb-8"
                style={{ fontSize: "clamp(3.8rem, 9vw, 7.5rem)" }}
              >
                The mental
                <br />
                game{" "}
                <span className="text-orange-400 italic">starts</span>
                <br />
                here.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.32 }}
                className="text-[15px] text-white/45 leading-relaxed max-w-[390px] mb-10"
              >
                1-on-1 mentorship for high school athletes — matched with a current or former athlete who&apos;s navigated exactly what you&apos;re facing.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.48 }}
                className="flex flex-wrap gap-3"
              >
                <Link href="/signup?role=player" className="group inline-flex items-center gap-3 rounded-sm bg-orange-500 px-7 py-3.5 text-sm font-bold text-white hover:bg-orange-400 transition-colors">
                  I&apos;m an Athlete
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link href="/signup?role=mentor" className="group inline-flex items-center gap-3 rounded-sm border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-colors">
                  I want to Mentor
                  <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </motion.div>
            </div>

            {/* Right — candid photo stack */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.28 }}
              className="relative h-[460px] hidden lg:block"
            >
              <div className="absolute top-0 right-4 w-[58%]" style={{ transform: "rotate(3deg)", background: "white", padding: "10px 10px 32px", boxShadow: "0 14px 44px rgba(0,0,0,0.38), 0 3px 10px rgba(0,0,0,0.2)" }}>
                <div className="relative w-full" style={{ paddingBottom: "72%" }}>
                  <Image src="/header_images/logan-weaver-lgnwvr-pZRX3qGeets-unsplash.jpg" alt="" fill className="object-cover" priority />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-[60%]" style={{ transform: "rotate(-2.5deg)", background: "white", padding: "10px 10px 32px", boxShadow: "0 14px 44px rgba(0,0,0,0.34), 0 3px 10px rgba(0,0,0,0.18)" }}>
                <div className="relative w-full" style={{ paddingBottom: "72%" }}>
                  <Image src="/header_images/alliance-football-club-wBJuXJU3aw4-unsplash.jpg" alt="" fill className="object-cover" />
                </div>
              </div>
              <div className="absolute top-[36%] right-1 w-[40%]" style={{ transform: "rotate(-1.8deg)", background: "white", padding: "8px 8px 26px", boxShadow: "0 10px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.15)" }}>
                <div className="relative w-full" style={{ paddingBottom: "72%" }}>
                  <Image src="/header_images/tim-mossholder-2BPbc98se38-unsplash.jpg" alt="" fill className="object-cover" />
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.72 }}
          className="relative z-10 border-t border-white/8"
        >
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4">
              {[
                { val: "All Sports", lbl: "Not just one" },
                { val: "Your time", lbl: "Meet when it works" },
                { val: "Giving back", lbl: "Athletes for athletes" },
                { val: "1-on-1", lbl: "Personally matched" },
              ].map((s, i) => (
                <div key={s.lbl} className={`px-5 py-5 ${i > 0 ? "border-l border-white/8" : ""}`}>
                  <p className="text-sm font-bold text-orange-400">{s.val}</p>
                  <p className="text-[11px] text-white/25 mt-0.5 uppercase tracking-wider">{s.lbl}</p>
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
            <span key={i} className="mx-8 inline-flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
              {item}
              <span className="h-1 w-1 rounded-full bg-white/40 shrink-0" />
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
          className="absolute right-0 top-1/2 -translate-y-1/2 font-bold text-offWhite-300 select-none pointer-events-none leading-none"
          style={{ fontSize: "clamp(16rem, 28vw, 28rem)", lineHeight: 1, opacity: 0.6 }}
        >
          01
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-28">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-500 mb-16 flex items-center gap-4">
              <span className="h-px w-8 bg-orange-400" />
              Our Mission
            </p>
          </Reveal>

          <div className="max-w-4xl space-y-0">
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

          <Reveal delay={0.35} className="mt-16 flex items-center gap-8">
            <div className="h-px flex-1 max-w-[80px] bg-navy/15" />
            <p className="text-navy/35 font-bold text-[11px] uppercase tracking-[0.22em]">
              That&apos;s the relationship we exist to create.
            </p>
          </Reveal>

          {/* Stat row */}
          <Reveal delay={0.4} className="mt-16 grid grid-cols-3 gap-0 max-w-lg border-t border-offWhite-300 pt-10">
            {[
              { n: 20, suffix: "+", label: "Sports covered" },
              { n: 100, suffix: "%", label: "Athlete-led" },
              { n: 1, suffix: "-on-1", label: "Every match" },
            ].map((s) => (
              <div key={s.label} className="pr-8">
                <p className="text-3xl font-bold text-navy tabular-nums">
                  <CountOnView end={s.n} suffix={s.suffix} />
                </p>
                <p className="text-[11px] text-navy/35 uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ─── WHO WE SERVE ─────────────────────────────────────────────────── */}
      {/* Full-height interactive split — panels push/pull on hover */}
      <section className="flex flex-col md:flex-row min-h-[560px]">
        {/* Athletes panel */}
        <motion.div
          onHoverStart={() => setServeHover("athletes")}
          onHoverEnd={() => setServeHover(null)}
          animate={{ flex: serveHover === "mentors" ? 0.65 : serveHover === "athletes" ? 1.35 : 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-navy flex flex-col justify-between p-10 lg:p-14 overflow-hidden cursor-default min-h-[280px] md:min-h-0"
        >
          {/* Watermark letter */}
          <div aria-hidden className="absolute right-4 bottom-0 font-bold text-white/[0.04] leading-none select-none pointer-events-none" style={{ fontSize: "22rem", lineHeight: 1 }}>A</div>
          <div className="relative z-10">
            <span className="inline-block rounded-sm bg-orange-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white mb-8">Athletes</span>
            <p className="text-white/50 text-[15px] leading-relaxed max-w-xs">
              Struggling with the mental side of competing — anxiety, confidence, identity, or just needing honest guidance from someone who gets it.
            </p>
          </div>
          <div className="relative z-10 mt-10">
            <Link href="/signup?role=player" className="group inline-flex items-center gap-2 text-sm font-bold text-orange-400 hover:text-orange-300 transition-colors">
              Find a Mentor <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Divider line */}
        <div className="w-px bg-white/10 hidden md:block shrink-0" />

        {/* Mentors panel */}
        <motion.div
          onHoverStart={() => setServeHover("mentors")}
          onHoverEnd={() => setServeHover(null)}
          animate={{ flex: serveHover === "athletes" ? 0.65 : serveHover === "mentors" ? 1.35 : 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-offWhite flex flex-col justify-between p-10 lg:p-14 overflow-hidden cursor-default min-h-[280px] md:min-h-0"
        >
          <div aria-hidden className="absolute right-4 bottom-0 font-bold text-navy/[0.05] leading-none select-none pointer-events-none" style={{ fontSize: "22rem", lineHeight: 1 }}>M</div>
          <div className="relative z-10">
            <span className="inline-block rounded-sm bg-navy px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white mb-8">Mentors</span>
            <p className="text-navy/50 text-[15px] leading-relaxed max-w-xs">
              You&apos;ve been through the mental grind — the pressure, the setbacks, the growth. That lived experience is exactly what a younger athlete needs.
            </p>
          </div>
          <div className="relative z-10 mt-10">
            <Link href="/signup?role=mentor" className="group inline-flex items-center gap-2 text-sm font-bold text-navy hover:text-orange-500 transition-colors">
              Apply to Mentor <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
      {/* Vertical timeline with animated draw line */}
      <section className="bg-white py-28 px-6 sm:px-8 border-t border-offWhite-300">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mb-20 flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-500 mb-3">The process</p>
              <h2 className="font-bold text-navy tracking-tight" style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)" }}>How it works</h2>
            </div>
            <Link href="/signup?role=player" className="group inline-flex items-center gap-2 text-sm font-bold text-navy hover:text-orange-500 transition-colors shrink-0">
              Apply now <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </Reveal>

          <div ref={timelineRef} className="relative">
            {/* Animated vertical line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-offWhite-300 hidden sm:block" />
            <motion.div
              className="absolute left-[19px] top-2 w-px bg-orange-400 hidden sm:block origin-top"
              initial={{ scaleY: 0 }}
              animate={timelineInView ? { scaleY: 1 } : {}}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              style={{ bottom: 2 }}
            />

            <div className="space-y-0">
              {steps.map((s, i) => (
                <Reveal key={s.n} delay={i * 0.12} y={20}>
                  <div className="flex items-start gap-8 sm:gap-12 py-10 border-b border-offWhite-300 last:border-0">
                    {/* Circle on timeline */}
                    <div className="relative shrink-0 flex flex-col items-center hidden sm:flex">
                      <div className="h-10 w-10 rounded-full border-2 border-orange-400 bg-white flex items-center justify-center z-10">
                        <span className="text-[10px] font-bold text-orange-500">{s.n}</span>
                      </div>
                    </div>

                    {/* Mobile step number */}
                    <span className="sm:hidden text-[11px] font-bold text-orange-500 pt-1 shrink-0">{s.n}</span>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-baseline gap-4 mb-3">
                        <h3 className="text-xl font-bold text-navy">{s.title}</h3>
                        {/* Large ghost number */}
                        <span className="text-5xl font-bold text-offWhite-300 leading-none select-none hidden lg:block">{s.n}</span>
                      </div>
                      <p className="text-sm text-navy/50 leading-relaxed max-w-md">{s.desc}</p>
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
      <section className="bg-navy py-28 px-6 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-16">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-400 mb-3">The platform</p>
            <h2 className="font-bold text-white tracking-tight" style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)" }}>
              Everything in<br />one place.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-px bg-white/8 rounded-sm overflow-hidden border border-white/8">
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
                    <motion.div layoutId="feature-indicator" className="ml-auto h-1 w-1 rounded-full bg-orange-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Right — spotlight */}
            <div className="bg-navy p-10 lg:p-14 min-h-[320px] flex flex-col justify-between">
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
                        <f.Icon className="h-8 w-8 text-orange-400 mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-4">{f.label}</h3>
                        <p className="text-white/45 text-[15px] leading-relaxed max-w-lg">{f.detail}</p>
                      </div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/15 mt-8">
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
      <section className="bg-offWhite py-28 border-t border-offWhite-300">
        {/* Challenge marquee */}
        <div className="mb-20">
          <Reveal className="mx-auto max-w-7xl px-6 sm:px-8 mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-500">Sound familiar?</p>
          </Reveal>
          <Marquee speed={35} gradient={false} className="py-2">
            {[...challenges, ...challenges].map((c, i) => (
              <span key={i} className="mx-6 inline-flex items-center gap-6 text-sm font-semibold text-navy/40">
                {c}
                <span className="h-1 w-1 rounded-full bg-orange-400/60 shrink-0" />
              </span>
            ))}
          </Marquee>
        </div>

        {/* What we provide — bold statement cards, not a grid */}
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal className="mb-12">
            <h2 className="font-bold text-navy tracking-tight" style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)" }}>
              Here&apos;s what<br />we give you.
            </h2>
          </Reveal>

          <div className="space-y-px bg-offWhite-300 border border-offWhite-300 rounded-sm overflow-hidden">
            {[
              { title: "A Real Mentor", desc: "Personally matched with a current or former athlete — ongoing, honest, built on shared experience in sport.", accent: "bg-orange-500" },
              { title: "Mental Guidance", desc: "Work through the mental side and navigate the demands of competing with someone who's actually been there.", accent: "bg-navy" },
              { title: "Advice Library", desc: "Articles and guides on confidence, anxiety, identity, and the mental skills that translate to performance.", accent: "bg-sage-600" },
              { title: "Built to Give Back", desc: "Every mentor chose to show up for the next generation. No cost, no catch, no subscriptions.", accent: "bg-gold-500" },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.07}>
                <div className="bg-white flex items-start gap-6 px-8 py-7 hover:bg-offWhite/60 transition-colors group">
                  <div className={`h-2 w-2 rounded-full ${item.accent} mt-2 shrink-0`} />
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:gap-12">
                    <h3 className="text-base font-bold text-navy shrink-0 w-44">{item.title}</h3>
                    <p className="text-sm text-navy/45 leading-relaxed mt-1 sm:mt-0">{item.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-navy/20 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5 hidden sm:block" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ADVICE PREVIEW ───────────────────────────────────────────────── */}
      {/* Asymmetric: 1 large left + 2 stacked right */}
      <section className="bg-white py-24 px-6 sm:px-8 border-t border-offWhite-300">
        <div className="mx-auto max-w-7xl">
          <Reveal className="flex items-end justify-between mb-14 gap-4 flex-wrap">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-500 mb-3">From the library</p>
              <h2 className="font-bold text-navy tracking-tight" style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)" }}>
                Mental skills,<br />built through advice.
              </h2>
            </div>
            <Link href="/advice" className="group inline-flex items-center gap-2 text-sm font-bold text-navy hover:text-orange-500 transition-colors shrink-0">
              View all <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-4">
            {/* Large featured */}
            <Reveal>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="bg-navy rounded-sm p-10 flex flex-col gap-6 h-full min-h-[320px]">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="h-4 w-4 text-orange-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Confidence</span>
                </div>
                <h3 className="font-bold text-white text-xl leading-snug flex-1">
                  The Practice-to-Game Gap: Why It Happens and How to Close It
                </h3>
                <p className="text-sm text-white/40 leading-relaxed">Why your brain treats games differently than practice — and what to do about it.</p>
                <Link href="/advice" className="group inline-flex items-center gap-2 text-sm font-bold text-orange-400 hover:text-orange-300 transition-colors mt-auto">
                  Read <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </motion.div>
            </Reveal>

            {/* Two stacked */}
            <div className="flex flex-col gap-4">
              {[
                { cat: "Coach Communication", Icon: MessageCircle, title: "How to Talk to Your Coach About Playing Time", desc: "A step-by-step script for a productive conversation without sounding entitled." },
                { cat: "Pressure & Anxiety", Icon: Video, title: "Pre-Competition Anxiety: What's Normal and What Helps", desc: "How to reframe pressure as a signal, not a threat." },
              ].map((r, i) => (
                <Reveal key={r.title} delay={i * 0.08} className="flex-1">
                  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="bg-offWhite rounded-sm p-7 border border-offWhite-300 flex flex-col gap-4 h-full">
                    <div className="flex items-center gap-2.5">
                      <r.Icon className="h-4 w-4 text-orange-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-navy/35">{r.cat}</span>
                    </div>
                    <h3 className="font-bold text-navy text-sm leading-snug flex-1">{r.title}</h3>
                    <p className="text-xs text-navy/45 leading-relaxed">{r.desc}</p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── MENTORS ──────────────────────────────────────────────────────── */}
      <section className="bg-offWhite py-24 border-t border-offWhite-300">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 mb-12">
          <Reveal className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-500 mb-3">The mentors</p>
              <h2 className="font-bold text-navy tracking-tight" style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)" }}>
                Real athletes.<br />Real experience.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup?role=player" className="group inline-flex items-center gap-2 rounded-sm bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-400 transition-colors">
                Apply to be matched <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/signup?role=mentor" className="group inline-flex items-center gap-2 rounded-sm border border-navy px-6 py-3 text-sm font-bold text-navy hover:bg-navy/5 transition-colors">
                Apply to be a Mentor <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 pl-6 sm:pl-8 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] pr-6 scrollbar-hide">
          {mentors.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.05} className="shrink-0 w-[285px]">
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="bg-white rounded-sm border border-offWhite-300 p-6 h-full flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-navy flex items-center justify-center text-white text-xs font-bold shrink-0">{m.initials}</div>
                  <div>
                    <p className="font-bold text-navy text-sm">{m.name}</p>
                    <p className="text-xs text-navy/35">{m.bg}</p>
                  </div>
                </div>
                <p className="text-sm text-navy/55 leading-relaxed italic flex-1">&ldquo;{m.quote}&rdquo;</p>
                <div className="flex flex-wrap gap-1.5">
                  {m.tags.map((t) => (
                    <span key={t} className="rounded-sm bg-offWhite border border-offWhite-300 px-2.5 py-1 text-xs font-medium text-navy/45">{t}</span>
                  ))}
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="bg-navy py-28 px-6 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <Reveal>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-400 mb-5">Get Started</p>
              <h2 className="font-bold text-white tracking-tight leading-[1.02]" style={{ fontSize: "clamp(2.5rem, 5vw, 4.2rem)" }}>
                Ready to get<br />involved?
              </h2>
              <p className="text-white/38 text-[15px] leading-relaxed mt-6 max-w-sm">
                Whether you&apos;re an athlete looking for a real relationship, or a former player ready to give back — this is where it starts.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="space-y-3">
              <Link href="/signup?role=player" className="group flex items-center justify-between rounded-sm bg-orange-500 px-7 py-4 font-bold text-white hover:bg-orange-400 transition-colors text-sm">
                I&apos;m an Athlete <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/signup?role=mentor" className="group flex items-center justify-between rounded-sm border border-white/15 bg-white/5 px-7 py-4 font-bold text-white hover:bg-white/10 transition-colors text-sm">
                I want to be a Mentor <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

    </div>
  );
}
