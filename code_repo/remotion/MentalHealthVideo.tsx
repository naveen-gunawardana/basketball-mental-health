import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  random,
} from "remotion";

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const INK = "#05070f";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const SKY = "#38bdf8";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

// fast easing for snappy entrances
const snap = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 22, stiffness: 220, mass: 0.7 } });

// Parallax image: pans AND zooms for constant motion
const MovingImage: React.FC<{
  src: string;
  dir?: "left" | "right" | "up";
  durationInFrames: number;
}> = ({ src, dir = "left", durationInFrames }) => {
  const frame = useCurrentFrame();
  const p = frame / durationInFrames;
  const scale = interpolate(p, [0, 1], [1.25, 1.4]);
  const px =
    dir === "left"
      ? interpolate(p, [0, 1], [40, -40])
      : dir === "right"
      ? interpolate(p, [0, 1], [-40, 40])
      : 0;
  const py = dir === "up" ? interpolate(p, [0, 1], [40, -40]) : 0;
  return (
    <AbsoluteFill
      style={{ transform: `scale(${scale}) translate(${px}px, ${py}px)` }}
    >
      <Img
        src={src}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
};

// Scene wrapper with quick fade + optional motion-blur-ish slide on exit
const Scene: React.FC<{ durationInFrames: number; children: React.ReactNode }> = ({
  durationInFrames,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 8, durationInFrames - 8, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return <AbsoluteFill style={{ opacity, backgroundColor: INK }}>{children}</AbsoluteFill>;
};

// Kinetic line: words fly up with blur, fast stagger
const Kinetic: React.FC<{
  text: string;
  size: number;
  weight?: number;
  color?: string;
  delay?: number;
  stagger?: number;
  letterSpacing?: number;
}> = ({ text, size, weight = 800, color = "#fff", delay = 0, stagger = 3, letterSpacing = -1.5 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0 0.28em",
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1.02,
        color,
        letterSpacing,
      }}
    >
      {text.split(" ").map((w, i) => {
        const e = snap(frame, fps, delay + i * stagger);
        const y = interpolate(e, [0, 1], [80, 0]);
        const blur = interpolate(e, [0, 1], [12, 0]);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `translateY(${y}px)`,
              opacity: e,
              filter: `blur(${blur}px)`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

// Animated number that counts up
const Counter: React.FC<{ to: number; suffix?: string; delay?: number; color?: string }> = ({
  to,
  suffix = "",
  delay = 0,
  color = AMBER,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame: frame - delay, fps, config: { damping: 30, stiffness: 90 } });
  const val = Math.round(interpolate(e, [0, 1], [0, to]));
  const scale = interpolate(e, [0, 1], [0.6, 1]);
  return (
    <span
      style={{
        fontFamily: FONT,
        fontSize: 320,
        fontWeight: 900,
        color,
        letterSpacing: -8,
        display: "inline-block",
        transform: `scale(${scale})`,
      }}
    >
      {val}
      {suffix}
    </span>
  );
};

// Accent bar that wipes in
const Kicker: React.FC<{ text: string; color?: string; delay?: number }> = ({
  text,
  color = RED,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame - delay, [0, 14], [0, 70], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const o = interpolate(frame - delay, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, opacity: o }}>
      <div style={{ width: w, height: 6, background: color, borderRadius: 4 }} />
      <span
        style={{
          fontFamily: FONT,
          fontSize: 34,
          fontWeight: 800,
          letterSpacing: 7,
          textTransform: "uppercase",
          color,
        }}
      >
        {text}
      </span>
    </div>
  );
};

// Stat card that slides in from the side
const StatCard: React.FC<{
  stat: string;
  label: string;
  delay: number;
  color: string;
  from: "left" | "right";
}> = ({ stat, label, delay, color, from }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = snap(frame, fps, delay);
  const x = interpolate(e, [0, 1], [from === "left" ? -700 : 700, 0]);
  return (
    <div
      style={{
        transform: `translateX(${x}px)`,
        opacity: e,
        background: "rgba(255,255,255,0.06)",
        border: `2px solid ${color}`,
        borderRadius: 28,
        padding: "36px 44px",
        width: 820,
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{ fontFamily: FONT, fontSize: 110, fontWeight: 900, color, lineHeight: 1 }}>
        {stat}
      </div>
      <div style={{ fontFamily: FONT, fontSize: 38, fontWeight: 500, color: "#cbd5e1", marginTop: 10 }}>
        {label}
      </div>
    </div>
  );
};

// Floating particles for constant ambient motion
const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const { height, width } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(28).fill(0).map((_, i) => {
        const seedX = random(`x${i}`);
        const seedS = random(`s${i}`);
        const speed = 0.4 + random(`v${i}`) * 1.2;
        const size = 3 + seedS * 7;
        const y = (height + 100 - ((frame * speed + random(`o${i}`) * height) % (height + 100)));
        const x = seedX * width;
        const op = 0.15 + random(`a${i}`) * 0.35;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: i % 3 === 0 ? RED : "#fff",
              opacity: op,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// gradient overlay tuned for vertical (text sits bottom)
const Overlay: React.FC<{ strong?: boolean }> = ({ strong }) => (
  <AbsoluteFill
    style={{
      background: strong
        ? "linear-gradient(0deg, rgba(5,7,15,0.97) 18%, rgba(5,7,15,0.5) 55%, rgba(5,7,15,0.7) 100%)"
        : "linear-gradient(0deg, rgba(5,7,15,0.95) 22%, rgba(5,7,15,0.25) 60%, rgba(5,7,15,0.55) 100%)",
    }}
  />
);

const Bottom: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ padding: 90, justifyContent: "flex-end" }}>{children}</AbsoluteFill>
);

/* ------------------------------------------------------------------ */
/* Main                                                               */
/* ------------------------------------------------------------------ */

export const MentalHealthVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);

  let cursor = 0;
  const at = (sec: number) => {
    const from = cursor;
    cursor += s(sec);
    return { from, durationInFrames: s(sec) };
  };

  const A = at(1.4); // cold open
  const B = at(2.6); // hook image
  const C = at(2.8); // big counter
  const D = at(3.0); // stat cards burst
  const E = at(2.6); // strength message
  const F = at(3.6); // CTA

  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      {/* Scene A — kinetic cold open (text only, fast) */}
      <Sequence from={A.from} durationInFrames={A.durationInFrames}>
        <Scene durationInFrames={A.durationInFrames}>
          <AbsoluteFill style={{ padding: 90, justifyContent: "center" }}>
            <Kicker text="Mentality Sports" />
            <Kinetic text="Game face on." size={150} stagger={4} />
            <Kinetic text="What about everything underneath?" size={70} weight={600} color="#94a3b8" delay={10} stagger={2} />
          </AbsoluteFill>
        </Scene>
      </Sequence>

      {/* Scene B — hook over moving image */}
      <Sequence from={B.from} durationInFrames={B.durationInFrames}>
        <Scene durationInFrames={B.durationInFrames}>
          <MovingImage src={staticFile("remotion/sport1.jpg")} dir="left" durationInFrames={B.durationInFrames} />
          <Overlay />
          <Bottom>
            <Kicker text="The truth" color={SKY} />
            <Kinetic text="The toughest battles aren't on the court." size={104} stagger={3} />
          </Bottom>
        </Scene>
      </Sequence>

      {/* Scene C — animated counter */}
      <Sequence from={C.from} durationInFrames={C.durationInFrames}>
        <Scene durationInFrames={C.durationInFrames}>
          <MovingImage src={staticFile("remotion/sport2.jpg")} dir="right" durationInFrames={C.durationInFrames} />
          <Overlay strong />
          <AbsoluteFill style={{ padding: 90, justifyContent: "center", alignItems: "center" }}>
            <Kicker text="The reality" color={AMBER} delay={4} />
            <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
              <Counter to={1} delay={6} color={AMBER} />
              <span style={{ fontFamily: FONT, fontSize: 120, fontWeight: 800, color: "#fff" }}>in</span>
              <Counter to={3} delay={10} color={AMBER} />
            </div>
            <div style={{ marginTop: 10, textAlign: "center" }}>
              <Kinetic text="student-athletes battle anxiety or depression." size={56} weight={600} color="#e2e8f0" delay={22} stagger={2} letterSpacing={-1} />
            </div>
          </AbsoluteFill>
        </Scene>
      </Sequence>

      {/* Scene D — stat card burst (lots of info, fast) */}
      <Sequence from={D.from} durationInFrames={D.durationInFrames}>
        <Scene durationInFrames={D.durationInFrames}>
          <AbsoluteFill
            style={{
              background: "radial-gradient(circle at 50% 30%, #1e1b4b 0%, #05070f 70%)",
            }}
          />
          <Particles />
          <AbsoluteFill style={{ padding: 80, justifyContent: "center", gap: 40, alignItems: "center" }}>
            <StatCard stat="35%" label="of elite athletes report a mental health crisis" delay={2} color={RED} from="left" />
            <StatCard stat="Only 10%" label="ever ask for the help they need" delay={14} color={AMBER} from="right" />
            <StatCard stat="2×" label="more likely to open up with a mentor who gets it" delay={26} color={SKY} from="left" />
          </AbsoluteFill>
        </Scene>
      </Sequence>

      {/* Scene E — the shift */}
      <Sequence from={E.from} durationInFrames={E.durationInFrames}>
        <Scene durationInFrames={E.durationInFrames}>
          <MovingImage src={staticFile("remotion/sport3.jpg")} dir="up" durationInFrames={E.durationInFrames} />
          <Overlay />
          <Bottom>
            <Kicker text="The shift" color={SKY} />
            <Kinetic text="Strength isn't silence." size={120} stagger={4} />
            <Kinetic text="Asking for help is the strongest play you'll make." size={52} weight={500} color="#cbd5e1" delay={12} stagger={1.5} />
          </Bottom>
        </Scene>
      </Sequence>

      {/* Scene F — CTA */}
      <Sequence from={F.from} durationInFrames={F.durationInFrames}>
        <Scene durationInFrames={F.durationInFrames}>
          <MovingImage src={staticFile("remotion/sport4.jpg")} dir="left" durationInFrames={F.durationInFrames} />
          <Overlay strong />
          <Particles />
          <AbsoluteFill style={{ padding: 90, justifyContent: "center", alignItems: "center", textAlign: "center" }}>
            <Kinetic text="You're not alone." size={130} stagger={4} />
            <div style={{ height: 30 }} />
            <Kinetic text="Mentorship that meets athletes where they are." size={46} weight={500} color="#cbd5e1" delay={12} stagger={1.2} />
            <CTAButton delay={s(1.2)} />
          </AbsoluteFill>
        </Scene>
      </Sequence>

      {/* ---------------- AUDIO ---------------- */}
      {/* Background music — trimmed to the video, gentle fade in/out */}
      <Audio
        src={staticFile("remotion/audio/mot_driving-ambition.mp3")}
        startFrom={s(2)}
        volume={(f) =>
          interpolate(
            f,
            [0, 20, 480 - 40, 480],
            [0, 0.45, 0.45, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )
        }
      />

      {/* Deep boom on the cold open */}
      <Sequence from={0} durationInFrames={s(4.1)}>
        <Audio src={staticFile("remotion/audio/impact.mp3")} volume={0.6} />
      </Sequence>

      {/* A distinct swoosh on each scene cut */}
      {[
        { f: B.from, file: "cand_1465.mp3" }, // soft
        { f: C.from, file: "cand_2901.mp3" }, // cinematic
        { f: D.from, file: "cand_1474.mp3" }, // swell
        { f: E.from, file: "cand_3115.mp3" }, // subtle
        { f: F.from, file: "cand_1576.mp3" }, // riser
      ].map(({ f, file }, i) => (
        <Sequence key={i} from={Math.max(0, f - 12)} durationInFrames={40}>
          <Audio
            src={staticFile(`remotion/audio/${file}`)}
            volume={(lf) =>
              interpolate(lf, [0, 6, 28, 40], [0, 0.4, 0.4, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            }
          />
        </Sequence>
      ))}

      {/* Punchy impacts on the big reveals: counter + CTA */}
      <Sequence from={C.from + 6} durationInFrames={20}>
        <Audio src={staticFile("remotion/audio/impact2.mp3")} volume={0.9} />
      </Sequence>
      <Sequence from={F.from + s(1.2)} durationInFrames={20}>
        <Audio src={staticFile("remotion/audio/impact2.mp3")} volume={0.9} />
      </Sequence>

      {/* persistent vignette */}
      <AbsoluteFill style={{ boxShadow: "inset 0 0 400px 90px rgba(0,0,0,0.7)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

const CTAButton: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 200 } });
  const pulse = 1 + Math.sin((frame - delay) / 8) * 0.02;
  return (
    <div
      style={{
        marginTop: 50,
        transform: `scale(${e * pulse})`,
        opacity: e,
        padding: "28px 64px",
        borderRadius: 100,
        background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
        fontFamily: FONT,
        fontSize: 44,
        fontWeight: 800,
        color: "#fff",
        boxShadow: "0 20px 70px rgba(239,68,68,0.5)",
      }}
    >
      mentalitysports.com
    </div>
  );
};
