import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

// Plays a single swoosh while a panel slides across, so each clip
// demonstrates exactly what that swoosh sounds like on a cut.
export const SwooshTest: React.FC<{ file: string; label: string }> = ({
  file,
  label,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame: frame - 6, fps, config: { damping: 22, stiffness: 200 } });
  const x = interpolate(e, [0, 1], [-1200, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070f", justifyContent: "center", alignItems: "center" }}>
      <Audio src={staticFile(`remotion/audio/${file}`)} volume={0.5} />
      <div
        style={{
          transform: `translateX(${x}px)`,
          opacity: e,
          fontFamily: FONT,
          fontSize: 90,
          fontWeight: 900,
          color: "#fff",
          padding: "40px 70px",
          borderRadius: 28,
          background: "linear-gradient(135deg, #ef4444, #b91c1c)",
        }}
      >
        {label}
      </div>
    </AbsoluteFill>
  );
};
