import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Mentality Sports — Athlete Mentorship & Mental Performance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#14213D",
          padding: "80px",
        }}
      >
        {/* Logo mark — simple circle with initials */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: "50%",
            backgroundColor: "#C4633A",
            marginBottom: 40,
          }}
        >
          <span style={{ color: "#F6F3EC", fontSize: 40, fontWeight: 700 }}>M</span>
        </div>

        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#F6F3EC",
            letterSpacing: "-2px",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          Mentality Sports
        </div>

        <div
          style={{
            fontSize: 28,
            color: "#F6F3EC",
            opacity: 0.6,
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Athlete mentorship for the mental side of sport
        </div>

        <div
          style={{
            marginTop: 48,
            paddingTop: 32,
            borderTop: "1px solid rgba(246,243,236,0.15)",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#C4633A", fontSize: 20, fontWeight: 600 }}>
            mentalitysports.com
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
