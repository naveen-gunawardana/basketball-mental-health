"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useInView, useMotionValue, useTransform, useSpring } from "framer-motion";
import dynamic from "next/dynamic";

const Marquee = dynamic(() => import("react-fast-marquee"), { ssr: false });

// ── Scroll reveal ─────────────────────────────────────────────────────────────
function Reveal({
  children,
  className = "",
  delay = 0,
  y = 28,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── 3-D tilt card (framer-motion mouse tracking) ──────────────────────────────
function TiltCard({
  src,
  name,
  role,
  founder,
  delay,
}: {
  src: string;
  name: string;
  role: string;
  founder?: boolean;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });
  const cardRef = useRef(null);
  const inView = useInView(cardRef, { once: true, margin: "-40px" });

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay }}
      style={{ perspective: 800 }}
    >
      <motion.div
        ref={ref}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouse}
        onMouseLeave={handleLeave}
        whileHover={{ scale: 1.03 }}
        transition={{ scale: { duration: 0.25 } }}
        className="group cursor-default"
      >
        {/* Photo */}
        <div className={`relative overflow-hidden ${founder ? "ring-2 ring-orange-400 ring-offset-2" : ""}`}
          style={{ borderRadius: 2 }}>
          <div className="relative w-full" style={{ paddingBottom: "130%" }}>
            <Image
              src={src}
              alt={name}
              fill
              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
          </div>
          {founder && (
            <span className="absolute top-2.5 left-2.5 bg-orange-500 text-white text-[9px] font-bold uppercase tracking-[0.14em] px-2 py-0.5">
              Founder
            </span>
          )}
        </div>

        {/* Info */}
        <div className="mt-3 px-0.5">
          <p className="font-bold text-navy text-sm tracking-tight">{name}</p>
          <p className="text-xs text-navy/45 uppercase tracking-[0.1em] font-semibold mt-0.5">{role}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const team = [
  { src: "/team/naveen.png", name: "Naveen",  role: "CEO & Founder",     founder: true  },
  { src: "/team/juli.png",   name: "Juli",    role: "CMO & Co-Founder",  founder: true  },
  { src: "/team/logan.png",  name: "Logan",   role: "President",         founder: false },
  { src: "/team/peter.png",  name: "Peter",   role: "COO",               founder: false },
  { src: "/team/tj.png",     name: "TJ",      role: "CFO",               founder: false },
];

const values = [
  {
    n: "01",
    title: "Athlete to athlete",
    body: "Every mentor on this platform is a current or former athlete. That's not a marketing line — it's the only reason any of this works.",
  },
  {
    n: "02",
    title: "Real relationships, not programs",
    body: "We don't sell a curriculum or a coaching module. We create conditions for a real relationship between two people who share something important.",
  },
  {
    n: "03",
    title: "The mental game is the game",
    body: "Confidence, identity, anxiety, resilience — these aren't soft skills. They're the difference between an athlete who thrives and one who disappears.",
  },
  {
    n: "04",
    title: "Give back, no strings",
    body: "Our mentors volunteer their time. No pay, no perks. They're here because someone should have been there for them — and often wasn't.",
  },
];

const strip = [
  "Athlete to Athlete", "Nonprofit", "Mental Performance", "No Cost Ever",
  "All Sports", "Real Relationships", "Giving Back", "Built by Athletes",
];

// ─────────────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative bg-navy overflow-hidden">
        {/* Grain */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "300px",
          }}
        />

        {/* Large background word */}
        <div
          aria-hidden
          className="absolute bottom-0 right-0 text-[22vw] font-black text-white/[0.025] leading-none select-none pointer-events-none pr-4 pb-2"
        >
          TEAM
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 pt-24 pb-20 md:pt-32 md:pb-28">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-400/80 mb-6"
          >
            Who we are
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.02] tracking-tight max-w-3xl"
          >
            Built by athletes.<br />
            <span className="text-orange-400">Run by people</span><br />
            who care.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
            className="mt-8 text-white/50 text-base leading-relaxed max-w-xl"
          >
            Mentality Sports is a nonprofit mentorship platform connecting high school athletes
            with college athletes who have lived through the same mental challenges — and made
            it out the other side.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.28 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/signup?role=player"
              className="group inline-flex items-center gap-2 bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-400 transition-colors"
            >
              Find a Mentor
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/signup?role=mentor"
              className="inline-flex items-center gap-2 border border-white/20 px-6 py-3 text-sm font-bold text-white/70 hover:text-white hover:border-white/40 transition-colors"
            >
              Apply to Mentor
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── STRIP ───────────────────────────────────────────────────────────── */}
      <div className="bg-orange-500 py-3 overflow-hidden">
        <Marquee speed={38} gradient={false} pauseOnHover>
          {strip.map((s) => (
            <span key={s} className="mx-8 text-[11px] font-black uppercase tracking-[0.18em] text-white/90">
              {s} <span className="mx-4 opacity-40">·</span>
            </span>
          ))}
        </Marquee>
      </div>

      {/* ── MISSION PULL-QUOTE ───────────────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-10 lg:gap-16 items-start">
            <Reveal>
              <div className="w-8 h-px bg-orange-400 mb-4" />
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-500">Our Story</p>
            </Reveal>
            <div>
              <Reveal delay={0.08}>
                <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-navy leading-snug">
                  The best conversations athletes have about the mental side of sport don&apos;t happen in a therapist&apos;s office or a team meeting. They happen between athletes — after a loss, in a locker room, on a long drive home.
                </p>
              </Reveal>
              <Reveal delay={0.16} className="mt-8 space-y-4">
                <p className="text-navy/60 leading-relaxed">
                  We built Mentality Sports to create those conversations at scale — without losing what makes them work. Every mentor is someone who competed at the level above, lived through the same pressures, and chose to come back and help the next generation navigate it.
                </p>
                <p className="text-navy/60 leading-relaxed">
                  No cost to athletes. No curriculum. No corporate script. Just a real relationship with someone who actually gets it.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM ────────────────────────────────────────────────────────────── */}
      <section className="section-padding bg-offWhite">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-14">
            <p className="label-tag mb-3">The people behind it</p>
            <h2 className="text-4xl md:text-5xl font-black text-navy tracking-tight">The Team</h2>
            <p className="text-navy/45 mt-3 text-sm max-w-md">
              Former athletes, operators, and people who believe the mental side of sport deserves more than it gets.
            </p>
          </Reveal>

          {/* 5-card responsive grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8">
            {team.map((member, i) => (
              <TiltCard
                key={member.name}
                src={member.src}
                name={member.name}
                role={member.role}
                founder={member.founder}
                delay={i * 0.08}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ──────────────────────────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-14">
            <p className="label-tag mb-3">What drives us</p>
            <h2 className="text-4xl md:text-5xl font-black text-navy tracking-tight">What we believe</h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-offWhite-300">
            {values.map((v, i) => (
              <Reveal key={v.n} delay={i * 0.07}>
                <div className="bg-white p-8 lg:p-10 h-full group hover:bg-navy transition-colors duration-300">
                  <p className="text-5xl font-black text-offWhite-400 group-hover:text-white/10 transition-colors leading-none mb-6 select-none">
                    {v.n}
                  </p>
                  <h3 className="text-lg font-bold text-navy group-hover:text-white transition-colors mb-3">
                    {v.title}
                  </h3>
                  <p className="text-sm text-navy/55 group-hover:text-white/60 transition-colors leading-relaxed">
                    {v.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="section-padding bg-navy">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <Reveal>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-400 mb-5">Get involved</p>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
                You belong here.
              </h2>
              <p className="text-white/50 text-sm leading-relaxed max-w-sm">
                Whether you&apos;re an athlete who needs this, or a former athlete who wants to give back — the door is open.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="space-y-3">
              <Link
                href="/signup?role=player"
                className="group flex items-center justify-between bg-orange-500 px-6 py-4 font-bold text-white hover:bg-orange-400 transition-colors text-sm"
              >
                I&apos;m an athlete — find me a mentor
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/signup?role=mentor"
                className="group flex items-center justify-between bg-white/8 border border-white/10 px-6 py-4 font-bold text-white hover:bg-white/12 transition-colors text-sm"
              >
                I want to be a mentor
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

    </div>
  );
}
