import React from "react";
import Svg, {
  Circle,
  Path,
  Rect,
  G,
  Line,
  Polyline,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";

/**
 * Gameday's icon set — drawn here rather than pulled from a library.
 *
 * House rules that keep them reading as one family:
 *   · 24×24 viewbox, 1.75 stroke, round caps and joins
 *   · geometry sits on a 2pt grid, nothing lands on a half pixel
 *   · no filled shapes except where a form is genuinely solid (the ball, the
 *     record star), so the set stays light on both surfaces
 *   · nothing anatomical — no brains, no lightbulbs, no head silhouettes.
 *     Every competitor in this category uses those three.
 */

export type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
});

const stroke = (color: string, w: number) => ({
  stroke: color,
  strokeWidth: w,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

/* ── Navigation ─────────────────────────────────────────────────────────── */

/** NOW — a clock hand at the top of its arc. The app's signature mark. */
export function IconNow({ size = 24, color = "#fff", strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Circle cx={12} cy={12} r={9} {...stroke(color, strokeWidth)} />
      <Path d="M12 12V6.5" {...stroke(color, strokeWidth)} />
      <Path d="M12 12l4 2.5" {...stroke(color, strokeWidth)} opacity={0.45} />
      <Circle cx={12} cy={12} r={1.4} fill={color} />
    </Svg>
  );
}

/** GAMES — a scoreboard bracket. */
export function IconGames({ size = 24, color = "#fff", strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Rect x={3} y={5} width={18} height={14} rx={2.5} {...stroke(color, strokeWidth)} />
      <Path d="M12 5v14" {...stroke(color, strokeWidth)} opacity={0.45} />
      <Path d="M6.5 10.5h2.5M6.5 13.5h2.5" {...stroke(color, strokeWidth)} />
      <Path d="M15 10.5h2.5M15 13.5h2.5" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

/** TRAIN — stacked reps. */
export function IconTrain({ size = 24, color = "#fff", strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M4 12h16" {...stroke(color, strokeWidth)} />
      <Rect x={2.5} y={8.5} width={3.5} height={7} rx={1.5} {...stroke(color, strokeWidth)} />
      <Rect x={18} y={8.5} width={3.5} height={7} rx={1.5} {...stroke(color, strokeWidth)} />
      <Rect x={7.5} y={6} width={3} height={12} rx={1.5} {...stroke(color, strokeWidth)} opacity={0.5} />
      <Rect x={13.5} y={6} width={3} height={12} rx={1.5} {...stroke(color, strokeWidth)} opacity={0.5} />
    </Svg>
  );
}

/** ME — a season arc rising out of a baseline. */
export function IconMe({ size = 24, color = "#fff", strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M3 20h18" {...stroke(color, strokeWidth)} opacity={0.4} />
      <Polyline points="4,16 9,11.5 13,14 20,5.5" {...stroke(color, strokeWidth)} />
      <Circle cx={20} cy={5.5} r={2} fill={color} />
    </Svg>
  );
}

/* ── The arc ────────────────────────────────────────────────────────────── */

/** Pressure — a ring under load. */
export function IconPressure({ size = 24, color = "#fff", strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Circle cx={12} cy={12} r={8.5} {...stroke(color, strokeWidth)} opacity={0.28} />
      <Path
        d="M12 3.5a8.5 8.5 0 0 1 7.4 12.7"
        {...stroke(color, strokeWidth + 0.4)}
      />
      <Path d="M12 8.5v4" {...stroke(color, strokeWidth)} />
      <Circle cx={12} cy={15.6} r={1.1} fill={color} />
    </Svg>
  );
}

/** Breath — concentric expansion. */
export function IconBreath({ size = 24, color = "#fff", strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Circle cx={12} cy={12} r={3} {...stroke(color, strokeWidth)} />
      <Circle cx={12} cy={12} r={6.5} {...stroke(color, strokeWidth)} opacity={0.55} />
      <Circle cx={12} cy={12} r={10} {...stroke(color, strokeWidth)} opacity={0.22} />
    </Svg>
  );
}

/** Reset — a return arrow that closes on itself. */
export function IconReset({ size = 24, color = "#fff", strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M20 12a8 8 0 1 1-2.6-5.9"
        {...stroke(color, strokeWidth)}
      />
      <Polyline points="20,3.5 20,8 15.5,8" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

/** Visualize — a play drawn up. */
export function IconVisualize({ size = 24, color = "#fff", strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M4 18c2.5-7 6-10.5 10.5-11.5"
        {...stroke(color, strokeWidth)}
        strokeDasharray="2.6 3"
      />
      <Circle cx={4} cy={18} r={2} {...stroke(color, strokeWidth)} />
      <Path d="M18.5 6.5l-4 -0.5 .5 4" {...stroke(color, strokeWidth)} />
      <Circle cx={19} cy={6} r={1.6} fill={color} />
    </Svg>
  );
}

/** Cue word — a spoken anchor. */
export function IconCue({ size = 24, color = "#fff", strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v7.5A1.5 1.5 0 0 1 19 16h-6.2L8.5 19.5V16H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5z"
        {...stroke(color, strokeWidth)}
      />
      <Path d="M8 10.75h8" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

/** Movement — a body in motion, abstracted to a stride. */
export function IconMovement({ size = 24, color = "#fff", strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Circle cx={14.5} cy={4.75} r={2.25} {...stroke(color, strokeWidth)} />
      <Path d="M9 20.5l3-5.5-2.5-3 1.5-4.5 3.5 2 2.5 1.5" {...stroke(color, strokeWidth)} />
      <Path d="M12 15l3.5 2 1 3.5" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

/** Silence — a held pause. */
export function IconSilence({ size = 24, color = "#fff", strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Circle cx={12} cy={12} r={9} {...stroke(color, strokeWidth)} opacity={0.35} />
      <Path d="M9.75 9v6M14.25 9v6" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

/** Music — a track, not a note cluster. */
export function IconMusic({ size = 24, color = "#fff", strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M9 17.5V5.5l10-2v12" {...stroke(color, strokeWidth)} />
      <Circle cx={6.75} cy={17.5} r={2.25} {...stroke(color, strokeWidth)} />
      <Circle cx={16.75} cy={15.5} r={2.25} {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

/* ── Objects ────────────────────────────────────────────────────────────── */

/** The ball. Solid, because a ball is a solid thing. Sport-swappable later. */
export function IconBall({ size = 24, color = "#fff" }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Circle cx={12} cy={12} r={9} fill={color} />
      <G stroke="#091327" strokeWidth={1.2} strokeLinecap="round" opacity={0.85}>
        <Path d="M3 12h18" />
        <Path d="M12 3v18" />
        <Path d="M5.6 5.6c3.4 3.4 3.4 9.4 0 12.8" />
        <Path d="M18.4 5.6c-3.4 3.4-3.4 9.4 0 12.8" />
      </G>
    </Svg>
  );
}

/** Home venue. */
export function IconHome({ size = 24, color = "#fff", strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M4 10.5L12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19v-8.5z" {...stroke(color, strokeWidth)} />
      <Path d="M9.5 20.5V13h5v7.5" {...stroke(color, strokeWidth)} opacity={0.5} />
    </Svg>
  );
}

/** Away venue — a bus, the thing every away game actually involves. */
export function IconAway({ size = 24, color = "#fff", strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Rect x={3.5} y={5} width={17} height={11} rx={2.5} {...stroke(color, strokeWidth)} />
      <Path d="M3.5 11.5h17" {...stroke(color, strokeWidth)} opacity={0.45} />
      <Circle cx={7.5} cy={18.5} r={1.75} {...stroke(color, strokeWidth)} />
      <Circle cx={16.5} cy={18.5} r={1.75} {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

/** A logged game. */
export function IconLog({ size = 24, color = "#fff", strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Rect x={4} y={3.5} width={16} height={17} rx={2.5} {...stroke(color, strokeWidth)} />
      <Path d="M8 8.5h8M8 12h8M8 15.5h4.5" {...stroke(color, strokeWidth)} opacity={0.6} />
    </Svg>
  );
}

/** A record or milestone. Solid — the only star in the app. */
export function IconRecord({ size = 24, color = "#fff" }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M12 2.5l2.9 6.1 6.6.9-4.8 4.7 1.2 6.6L12 17.7 6.1 20.8l1.2-6.6L2.5 9.5l6.6-.9z"
        fill={color}
      />
    </Svg>
  );
}

/** Voice capture. */
export function IconMic({ size = 24, color = "#fff", strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Rect x={9} y={2.5} width={6} height={11} rx={3} {...stroke(color, strokeWidth)} />
      <Path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" {...stroke(color, strokeWidth)} />
      <Path d="M12 18v3.5" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

export function IconPlay({ size = 24, color = "#fff" }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M7.5 4.8v14.4a1 1 0 0 0 1.53.85l11.2-7.2a1 1 0 0 0 0-1.7L9.03 3.95A1 1 0 0 0 7.5 4.8z" fill={color} />
    </Svg>
  );
}

export function IconPause({ size = 24, color = "#fff" }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Rect x={6.5} y={4.5} width={4} height={15} rx={1.4} fill={color} />
      <Rect x={13.5} y={4.5} width={4} height={15} rx={1.4} fill={color} />
    </Svg>
  );
}

export function IconCheck({ size = 24, color = "#fff", strokeWidth = 2.25 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Polyline points="4.5,12.5 9.5,17.5 19.5,6.5" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

export function IconClose({ size = 24, color = "#fff", strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M6 6l12 12M18 6L6 18" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

export function IconArrowRight({ size = 24, color = "#fff", strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M4.5 12h14" {...stroke(color, strokeWidth)} />
      <Polyline points="13,6.5 18.5,12 13,17.5" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

export function IconArrowLeft({ size = 24, color = "#fff", strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M19.5 12h-14" {...stroke(color, strokeWidth)} />
      <Polyline points="11,6.5 5.5,12 11,17.5" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

export function IconPlus({ size = 24, color = "#fff", strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M12 5.5v13M5.5 12h13" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

/** Support / crisis path. A hand, not a heart — this isn't sentimental. */
export function IconSupport({ size = 24, color = "#fff", strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M8.5 13V5.75a1.75 1.75 0 1 1 3.5 0V11m0-1.25a1.75 1.75 0 1 1 3.5 0V12m0-1a1.75 1.75 0 1 1 3.5 0v4.5a5.5 5.5 0 0 1-5.5 5.5h-1.4a5 5 0 0 1-3.9-1.87L4 15.5a1.8 1.8 0 0 1 2.7-2.35L8.5 15"
        {...stroke(color, strokeWidth)}
      />
    </Svg>
  );
}

/** Mentor — two figures, one slightly ahead. */
export function IconMentor({ size = 24, color = "#fff", strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Circle cx={8.5} cy={8} r={3} {...stroke(color, strokeWidth)} />
      <Path d="M3 20a5.5 5.5 0 0 1 11 0" {...stroke(color, strokeWidth)} />
      <Circle cx={16.75} cy={6.5} r={2.25} {...stroke(color, strokeWidth)} opacity={0.55} />
      <Path d="M15 20a5.5 5.5 0 0 1 6-5.47" {...stroke(color, strokeWidth)} opacity={0.55} />
    </Svg>
  );
}

/* ── The wordmark ───────────────────────────────────────────────────────── */

/**
 * Gameday's mark: a clock hand sweeping to the top of its arc, set in a ring
 * that opens at the top. It reads as "the moment before" — which is the whole
 * product — and it survives at 40px.
 */
export function GamedayMark({
  size = 64,
  color = "#C4633A",
  ring = "#F6F3EC",
  progress = 0.78,
}: {
  size?: number;
  color?: string;
  ring?: string;
  progress?: number;
}) {
  const r = 27;
  const c = 2 * Math.PI * r;
  const gap = c * 0.16;
  const sweep = (c - gap) * Math.max(0, Math.min(1, progress));

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Defs>
        <LinearGradient id="gd-mark" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={1} />
          <Stop offset="1" stopColor={color} stopOpacity={0.55} />
        </LinearGradient>
      </Defs>
      {/* Open ring — the gap sits at the top, where the hand is heading. */}
      <Circle
        cx={32}
        cy={32}
        r={r}
        stroke={ring}
        strokeWidth={3}
        strokeOpacity={0.22}
        strokeLinecap="round"
        strokeDasharray={`${c - gap} ${gap}`}
        transform="rotate(-90 32 32)"
      />
      <Circle
        cx={32}
        cy={32}
        r={r}
        stroke="url(#gd-mark)"
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={`${sweep} ${c}`}
        transform="rotate(-90 32 32)"
      />
      {/* The hand, just short of vertical. */}
      <Line
        x1={32}
        y1={32}
        x2={32}
        y2={13.5}
        stroke={ring}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Circle cx={32} cy={32} r={4} fill={ring} />
      <Circle cx={32} cy={32} r={1.6} fill={color} />
    </Svg>
  );
}
