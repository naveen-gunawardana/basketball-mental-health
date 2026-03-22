"use client";
import { notFound } from "next/navigation";


// ─── Color tokens ──────────────────────────────────────────────────────────
const PRIMARY = { hex: "#14213D", name: "Navy", role: "Primary" };

const SECONDARY = [
  { hex: "#C4633A", name: "Terracotta", role: "Energy / CTA" },
  { hex: "#6B957F", name: "Sage",       role: "Wellness / Success" },
  { hex: "#F6F3EC", name: "Parchment",  role: "Background / Canvas", dark: true },
  { hex: "#C9973A", name: "Gold",       role: "Achievement / Badge" },
];

const TERTIARY = [
  { hex: "#97B4DC", name: "Sky Navy",   role: "Soft backgrounds, borders" },
  { hex: "#EDC2AD", name: "Peach",      role: "Hover states, dividers" },
  { hex: "#C7D7CF", name: "Mint Sage",  role: "Tags, chips, subtle fills" },
  { hex: "#2C3140", name: "Charcoal",   role: "Alt body text, dark surfaces" },
  { hex: "#8E8E82", name: "Warm Gray",  role: "Muted text, placeholders" },
  { hex: "#F0EAE2", name: "Blush",      role: "Card backgrounds, soft panels" },
];

// ─── Text / bg combination pairs ───────────────────────────────────────────
const COMBOS = [
  { bg: "#14213D", text: "#F6F3EC", label: "Navy + Parchment",     tag: "Primary surfaces" },
  { bg: "#F6F3EC", text: "#14213D", label: "Parchment + Navy",     tag: "Default page" },
  { bg: "#C4633A", text: "#FFFFFF", label: "Terracotta + White",   tag: "CTA buttons" },
  { bg: "#6B957F", text: "#FFFFFF", label: "Sage + White",         tag: "Wellness tags" },
  { bg: "#C9973A", text: "#14213D", label: "Gold + Navy",          tag: "Achievement badges" },
  { bg: "#0E1C38", text: "#97B4DC", label: "Dark Navy + Sky",      tag: "Hero dark mode" },
  { bg: "#F0EAE2", text: "#2C3140", label: "Blush + Charcoal",     tag: "Soft card panels" },
  { bg: "#2C3140", text: "#C7D7CF", label: "Charcoal + Mint",      tag: "Dark cards" },
];

export default function ColorsPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <div style={{ backgroundColor: "#F6F3EC", minHeight: "100vh", padding: "64px 40px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 72 }}>

        {/* ── Page header ── */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C4633A", marginBottom: 8 }}>Design System</p>
          <h1 style={{ fontSize: 48, fontWeight: 800, color: "#14213D", margin: 0, lineHeight: 1.1 }}>Color & Type</h1>
          <p style={{ marginTop: 8, color: "#14213D99", fontSize: 16 }}>1 primary · 4 secondary · 6 tertiary · text combos · type specimens</p>
        </div>

        {/* ══ PRIMARY ══ */}
        <section>
          <SectionLabel>Primary</SectionLabel>
          <div style={{ display: "flex", gap: 24, alignItems: "stretch" }}>
            <div style={{
              flex: "0 0 300px", height: 200, borderRadius: 20,
              backgroundColor: PRIMARY.hex,
              display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 24,
            }}>
              <p style={{ color: "#ffffff99", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>Primary</p>
              <p style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: "4px 0 0" }}>{PRIMARY.name}</p>
              <p style={{ color: "#ffffff66", fontSize: 13, fontFamily: "monospace", margin: "2px 0 0" }}>{PRIMARY.hex}</p>
            </div>
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              {[
                ["#E8EFF8","50"],["#C8D8EE","100"],["#97B4DC","200"],["#6690C8","300"],["#3D6BAE","400"],
                ["#1E4080","500"],["#162F5E","600"],["#122649","700"],["#14213D","def"],["#091327","900"],
              ].map(([hex, stop]) => (
                <div key={stop}>
                  <div style={{ height: 60, borderRadius: 8, backgroundColor: hex, border: parseInt(stop) < 200 ? "1px solid #14213D18" : "none" }} />
                  <p style={{ fontSize: 10, fontFamily: "monospace", color: "#14213D55", marginTop: 4 }}>{stop}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ SECONDARY ══ */}
        <section>
          <SectionLabel>Secondary (4)</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {SECONDARY.map((c) => (
              <div key={c.hex}>
                <div style={{
                  height: 140, borderRadius: 16, backgroundColor: c.hex,
                  border: c.dark ? "1px solid #14213D18" : "none",
                  display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 16,
                }}>
                  <p style={{ color: c.dark ? "#14213D99" : "#ffffff99", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>Secondary</p>
                  <p style={{ color: c.dark ? "#14213D" : "#fff", fontSize: 16, fontWeight: 700, margin: "2px 0 0" }}>{c.name}</p>
                </div>
                <p style={{ fontSize: 12, color: "#14213D", fontWeight: 600, marginTop: 8 }}>{c.role}</p>
                <p style={{ fontSize: 11, fontFamily: "monospace", color: "#14213D55" }}>{c.hex}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ TERTIARY ══ */}
        <section>
          <SectionLabel>Tertiary (6)</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
            {TERTIARY.map((c) => (
              <div key={c.hex}>
                <div style={{
                  height: 100, borderRadius: 12, backgroundColor: c.hex,
                  border: c.hex === "#F0EAE2" || c.hex === "#97B4DC" || c.hex === "#C7D7CF" ? "1px solid #14213D12" : "none",
                }} />
                <p style={{ fontSize: 12, color: "#14213D", fontWeight: 600, marginTop: 8 }}>{c.name}</p>
                <p style={{ fontSize: 10, color: "#14213D60", lineHeight: 1.3, marginTop: 2 }}>{c.role}</p>
                <p style={{ fontSize: 10, fontFamily: "monospace", color: "#14213D40", marginTop: 4 }}>{c.hex}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ TEXT + BACKGROUND COMBOS ══ */}
        <section>
          <SectionLabel>Text on Background Combinations</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {COMBOS.map((c) => (
              <div key={c.label} style={{
                backgroundColor: c.bg, borderRadius: 16, padding: "28px 28px",
                border: c.bg === "#F6F3EC" || c.bg === "#F0EAE2" ? "1px solid #14213D14" : "none",
              }}>
                <p style={{ color: c.text + "88", fontSize: 10, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", margin: 0 }}>{c.tag}</p>
                <p style={{ color: c.text, fontSize: 20, fontWeight: 700, margin: "6px 0 0", lineHeight: 1.3 }}>{c.label}</p>
                <p style={{ color: c.text + "99", fontSize: 13, margin: "8px 0 0", lineHeight: 1.6 }}>
                  Body copy reads clearly at this pairing. Use for cards, sections, and CTA panels.
                </p>
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <div style={{ width: 48, height: 6, borderRadius: 3, backgroundColor: c.text, opacity: 0.9 }} />
                  <div style={{ width: 32, height: 6, borderRadius: 3, backgroundColor: c.text, opacity: 0.4 }} />
                  <div style={{ width: 24, height: 6, borderRadius: 3, backgroundColor: c.text, opacity: 0.2 }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ TYPE SPECIMENS ══ */}
        <section>
          <SectionLabel>Type Specimens</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Outfit — Display */}
            <TypeCard bg="#14213D">
              <p style={{ color: "#C4633A", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>Outfit — Display / Headings</p>
              <p style={{ color: "#fff", fontSize: 48, fontWeight: 800, fontFamily: "'Outfit', 'system-ui', sans-serif", lineHeight: 1.05, margin: "8px 0 0" }}>
                The mental game<br />is the whole game.
              </p>
              <p style={{ color: "#ffffff60", fontSize: 13, fontFamily: "monospace", marginTop: 12 }}>font-serif · Outfit · 800 · 48px / hero</p>
              <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
                {[["800","Display","48px"],["700","Heading","32px"],["600","Subhead","22px"],["500","Label","14px"]].map(([w,role,size]) => (
                  <div key={role} style={{ backgroundColor: "#ffffff10", borderRadius: 10, padding: "12px 16px" }}>
                    <p style={{ color: "#fff", fontSize: parseInt(size), fontWeight: parseInt(w), fontFamily: "'Outfit', sans-serif", margin: 0, lineHeight: 1.2 }}>{role}</p>
                    <p style={{ color: "#ffffff50", fontSize: 10, fontFamily: "monospace", marginTop: 4 }}>{w} · {size}</p>
                  </div>
                ))}
              </div>
            </TypeCard>

            {/* Inter — Body */}
            <TypeCard bg="#F6F3EC" border>
              <p style={{ color: "#C4633A", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>Inter — Body / UI</p>
              <p style={{ color: "#14213D", fontSize: 18, fontWeight: 400, fontFamily: "'Inter', 'system-ui', sans-serif", lineHeight: 1.7, margin: "8px 0 0", maxWidth: 600 }}>
                We built this for athletes who know that what happens between the ears is just as important as what happens on the court. Mental performance is trainable — and we&apos;re here to help you train it.
              </p>
              <p style={{ color: "#14213D40", fontSize: 13, fontFamily: "monospace", marginTop: 12 }}>font-sans · Inter · 400 · 18px / body</p>
              <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
                {[["700","Bold","16px"],["600","Semibold","15px"],["400","Regular","15px"],["400","Small","13px"],["400","Micro","11px"]].map(([w,role,size]) => (
                  <div key={role} style={{ backgroundColor: "#14213D08", borderRadius: 10, padding: "12px 16px" }}>
                    <p style={{ color: "#14213D", fontSize: parseInt(size), fontWeight: parseInt(w), fontFamily: "'Inter', sans-serif", margin: 0 }}>{role}</p>
                    <p style={{ color: "#14213D40", fontSize: 10, fontFamily: "monospace", marginTop: 4 }}>{w} · {size}</p>
                  </div>
                ))}
              </div>
            </TypeCard>

            {/* Mixed — Outfit heading + Inter body */}
            <TypeCard bg="#F0EAE2" border>
              <p style={{ color: "#C4633A", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>Mixed — Outfit Display + Inter Body</p>
              <p style={{ color: "#14213D", fontSize: 32, fontWeight: 800, fontFamily: "'Outfit', sans-serif", lineHeight: 1.1, margin: "12px 0 0" }}>
                Build your mental edge.
              </p>
              <p style={{ color: "#14213D80", fontSize: 16, fontFamily: "'Inter', sans-serif", fontWeight: 400, lineHeight: 1.7, margin: "12px 0 0", maxWidth: 520 }}>
                Connect with mentors who&apos;ve been through the pressure. Real conversations, real growth — on your schedule.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button style={{ backgroundColor: "#14213D", color: "#F6F3EC", border: "none", borderRadius: 10, padding: "12px 24px", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                  Find a Mentor
                </button>
                <button style={{ backgroundColor: "#C4633A", color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                  Get Started
                </button>
                <span style={{ backgroundColor: "#6B957F", color: "#fff", borderRadius: 10, padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, display: "inline-flex", alignItems: "center" }}>
                  Wellness
                </span>
              </div>
            </TypeCard>

            {/* Mono — Stats / data */}
            <TypeCard bg="#2C3140">
              <p style={{ color: "#C7D7CF", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>Mono — Stats / Data / Code</p>
              <div style={{ display: "flex", gap: 32, marginTop: 16, flexWrap: "wrap" }}>
                {[["94","sessions logged"],["3.2k","athletes"],["4.8","avg rating"],["12wk","avg streak"]].map(([val, label]) => (
                  <div key={label}>
                    <p style={{ color: "#F6F3EC", fontSize: 40, fontWeight: 700, fontFamily: "monospace", margin: 0, lineHeight: 1 }}>{val}</p>
                    <p style={{ color: "#8E8E82", fontSize: 11, fontFamily: "monospace", marginTop: 6 }}>{label}</p>
                  </div>
                ))}
              </div>
              <p style={{ color: "#8E8E82", fontSize: 13, fontFamily: "monospace", marginTop: 20 }}>font-mono · monospace · 700 · stat displays</p>
            </TypeCard>

          </div>
        </section>

      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#14213D60", marginBottom: 20 }}>
      {children}
    </p>
  );
}

function TypeCard({ bg, border, children }: { bg: string; border?: boolean; children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: bg,
      borderRadius: 20,
      padding: "32px 36px",
      border: border ? "1px solid #14213D12" : "none",
    }}>
      {children}
    </div>
  );
}
