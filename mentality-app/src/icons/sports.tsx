import React from "react";
import Svg, { Circle, Path, Ellipse, Line } from "react-native-svg";
import type { SportId } from "@/data/catalog";

/**
 * Sport glyphs.
 *
 * Drawn as line marks rather than filled balls so they sit inside the same
 * icon family as the rest of the set and read on both surfaces. Each one is
 * the *object*, not a figure playing the sport — a silhouette of a person
 * mid-jumpshot would date instantly and would only ever depict one body.
 */

type Props = { size?: number; color?: string; strokeWidth?: number };

const box = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 32 32",
  fill: "none",
});

const s = (color: string, w: number) => ({
  stroke: color,
  strokeWidth: w,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

function Basketball({ size = 32, color = "#fff", strokeWidth = 1.6 }: Props) {
  return (
    <Svg {...box(size)}>
      <Circle cx={16} cy={16} r={12} {...s(color, strokeWidth)} />
      <Path d="M4 16h24M16 4v24" {...s(color, strokeWidth)} />
      <Path d="M7.5 7.5c4.7 4.7 4.7 12.3 0 17M24.5 7.5c-4.7 4.7-4.7 12.3 0 17" {...s(color, strokeWidth)} />
    </Svg>
  );
}

function Soccer({ size = 32, color = "#fff", strokeWidth = 1.6 }: Props) {
  return (
    <Svg {...box(size)}>
      <Circle cx={16} cy={16} r={12} {...s(color, strokeWidth)} />
      <Path d="M16 10.5l4.6 3.4-1.8 5.5h-5.6l-1.8-5.5z" {...s(color, strokeWidth)} />
      <Path d="M16 4v6.5M20.6 13.9l6.2-2M18.8 19.4l3.7 5.2M13.2 19.4l-3.7 5.2M11.4 13.9l-6.2-2" {...s(color, strokeWidth)} />
    </Svg>
  );
}

function Football({ size = 32, color = "#fff", strokeWidth = 1.6 }: Props) {
  return (
    <Svg {...box(size)}>
      <Path d="M6 26c-1.5-8 2-16 8-19s12 .5 12 .5.5 6-2.5 12S14 27.5 6 26z" {...s(color, strokeWidth)} />
      <Path d="M11.5 20.5l9-9" {...s(color, strokeWidth)} />
      <Path d="M13.5 16.5l2 2M16.5 13.5l2 2" {...s(color, strokeWidth)} />
    </Svg>
  );
}

function Volleyball({ size = 32, color = "#fff", strokeWidth = 1.6 }: Props) {
  return (
    <Svg {...box(size)}>
      <Circle cx={16} cy={16} r={12} {...s(color, strokeWidth)} />
      <Path d="M16 4c-4 5.5-4.5 13-1.5 19.5" {...s(color, strokeWidth)} />
      <Path d="M27.5 13c-6.5-1.5-13 1-17 6.5" {...s(color, strokeWidth)} />
      <Path d="M9 26.5c1.5-6.5 6.5-11.5 13-13" {...s(color, strokeWidth)} />
    </Svg>
  );
}

function Baseball({ size = 32, color = "#fff", strokeWidth = 1.6 }: Props) {
  return (
    <Svg {...box(size)}>
      <Circle cx={16} cy={16} r={12} {...s(color, strokeWidth)} />
      <Path d="M8 7.5c3 4 3 13 0 17M24 7.5c-3 4-3 13 0 17" {...s(color, strokeWidth)} />
      <Path d="M10.5 11h1.5M10.5 15h1.5M10.5 19h1.5M20 11h1.5M20 15h1.5M20 19h1.5" {...s(color, strokeWidth)} />
    </Svg>
  );
}

function Track({ size = 32, color = "#fff", strokeWidth = 1.6 }: Props) {
  return (
    <Svg {...box(size)}>
      <Ellipse cx={16} cy={16} rx={13} ry={8} {...s(color, strokeWidth)} />
      <Ellipse cx={16} cy={16} rx={8.5} ry={4.5} {...s(color, strokeWidth)} strokeOpacity={0.55} />
      <Line x1={16} y1={8} x2={16} y2={11.5} {...s(color, strokeWidth)} />
    </Svg>
  );
}

function Swimming({ size = 32, color = "#fff", strokeWidth = 1.6 }: Props) {
  return (
    <Svg {...box(size)}>
      <Path d="M3 21c2.5-2.5 5-2.5 7.5 0s5 2.5 7.5 0 5-2.5 7.5 0 4 1.5 4 1.5" {...s(color, strokeWidth)} />
      <Path d="M3 27c2.5-2.5 5-2.5 7.5 0s5 2.5 7.5 0 5-2.5 7.5 0" {...s(color, strokeWidth)} strokeOpacity={0.5} />
      <Circle cx={22} cy={8} r={3} {...s(color, strokeWidth)} />
      <Path d="M6 15l7-3 6 3 4-2" {...s(color, strokeWidth)} />
    </Svg>
  );
}

function Tennis({ size = 32, color = "#fff", strokeWidth = 1.6 }: Props) {
  return (
    <Svg {...box(size)}>
      <Ellipse cx={13} cy={12} rx={8} ry={9.5} {...s(color, strokeWidth)} transform="rotate(-30 13 12)" />
      <Path d="M17.5 19.5L26 28" {...s(color, strokeWidth)} />
      <Path d="M8.5 8l8 7M9 15l7-8" {...s(color, strokeWidth)} strokeOpacity={0.45} />
    </Svg>
  );
}

function Lacrosse({ size = 32, color = "#fff", strokeWidth = 1.6 }: Props) {
  return (
    <Svg {...box(size)}>
      <Path d="M9 6c4.5 0 8 3.5 8 8 0 3-2.5 5-5 5s-5-2-5-5" {...s(color, strokeWidth)} />
      <Path d="M14.5 17L26 28" {...s(color, strokeWidth)} />
      <Circle cx={11} cy={12} r={2.5} {...s(color, strokeWidth)} strokeOpacity={0.55} />
    </Svg>
  );
}

function Wrestling({ size = 32, color = "#fff", strokeWidth = 1.6 }: Props) {
  return (
    <Svg {...box(size)}>
      <Circle cx={16} cy={16} r={12.5} {...s(color, strokeWidth)} />
      <Circle cx={16} cy={16} r={7} {...s(color, strokeWidth)} strokeOpacity={0.55} />
      <Path d="M16 3.5v5M16 23.5v5M3.5 16h5M23.5 16h5" {...s(color, strokeWidth)} />
    </Svg>
  );
}

function Hockey({ size = 32, color = "#fff", strokeWidth = 1.6 }: Props) {
  return (
    <Svg {...box(size)}>
      <Path d="M8 4v16.5c0 1.5 1.2 2.5 2.7 2.5H24" {...s(color, strokeWidth)} />
      <Ellipse cx={25.5} cy={25.5} rx={4} ry={2.2} {...s(color, strokeWidth)} />
    </Svg>
  );
}

function Golf({ size = 32, color = "#fff", strokeWidth = 1.6 }: Props) {
  return (
    <Svg {...box(size)}>
      <Path d="M13 27V5l11 4.5-11 4.5" {...s(color, strokeWidth)} />
      <Ellipse cx={13} cy={27.5} rx={7} ry={2} {...s(color, strokeWidth)} strokeOpacity={0.5} />
    </Svg>
  );
}

function Other({ size = 32, color = "#fff", strokeWidth = 1.6 }: Props) {
  return (
    <Svg {...box(size)}>
      <Circle cx={16} cy={16} r={12} {...s(color, strokeWidth)} strokeDasharray="3 3.5" />
      <Path d="M16 10.5v7M16 21.5h.01" {...s(color, strokeWidth + 0.3)} />
    </Svg>
  );
}

const MAP: Record<SportId, React.ComponentType<Props>> = {
  basketball: Basketball,
  soccer: Soccer,
  football: Football,
  volleyball: Volleyball,
  baseball: Baseball,
  track: Track,
  swimming: Swimming,
  tennis: Tennis,
  lacrosse: Lacrosse,
  wrestling: Wrestling,
  hockey: Hockey,
  golf: Golf,
  other: Other,
};

export function SportGlyph({
  sport,
  size = 32,
  color = "#fff",
  strokeWidth = 1.6,
}: Props & { sport: SportId }) {
  const C = MAP[sport] ?? Other;
  return <C size={size} color={color} strokeWidth={strokeWidth} />;
}
