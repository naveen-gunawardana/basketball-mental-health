import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Mentality Sports — Athlete Mentorship & Mental Performance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoRes = await fetch(
    new URL("/logo.png", "https://mentalitysports.com")
  );
  const logoBuffer = await logoRes.arrayBuffer();
  const logoBase64 = `data:image/png;base64,${Buffer.from(logoBuffer).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#14213D",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Orange left accent bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 6,
            backgroundColor: "#C4633A",
          }}
        />

        {/* Subtle grid texture overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 80% 50%, rgba(196,99,58,0.08) 0%, transparent 60%)",
          }}
        />

        {/* Large ghost number watermark */}
        <div
          style={{
            position: "absolute",
            right: -20,
            bottom: -60,
            fontSize: 400,
            fontWeight: 800,
            color: "rgba(246,243,236,0.03)",
            lineHeight: 1,
            letterSpacing: "-20px",
          }}
        >
          MS
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px 80px 64px 88px",
            width: "100%",
          }}
        >
          {/* Top: logo */}
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoBase64}
              width={180}
              height={60}
              style={{ objectFit: "contain", objectPosition: "left" }}
              alt="Mentality Sports"
            />
          </div>

          {/* Center: main headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 2,
                  backgroundColor: "#C4633A",
                  opacity: 0.6,
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#C4633A",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                }}
              >
                Athlete to Athlete
              </span>
            </div>

            <div
              style={{
                fontSize: 82,
                fontWeight: 800,
                color: "#F6F3EC",
                letterSpacing: "-3px",
                lineHeight: 0.92,
              }}
            >
              The mental
              <br />
              game{" "}
              <span style={{ color: "#C4633A", fontStyle: "italic" }}>starts</span>
              <br />
              here.
            </div>
          </div>

          {/* Bottom: tagline + URL */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: 18,
                color: "rgba(246,243,236,0.45)",
                maxWidth: 520,
                lineHeight: 1.5,
              }}
            >
              1-on-1 mentorship for high school athletes — matched with a college or former athlete who&apos;s navigated exactly what you&apos;re facing.
            </span>

            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#C4633A",
                letterSpacing: "0.5px",
              }}
            >
              mentalitysports.com
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
