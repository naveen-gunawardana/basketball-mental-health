import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Athlete Mental Health Advice Library | Mentality Sports",
  description:
    "Free articles, guides, and videos on the mental side of sport — confidence, anxiety, injury recovery, and more. Written by athletes and coaches across basketball, soccer, football, swimming, and 10+ sports.",
  openGraph: {
    title: "Athlete Mental Health Advice Library | Mentality Sports",
    description:
      "Free resources on the mental side of sport. Articles and guides covering confidence, anxiety, adversity, and identity — for athletes across all sports.",
    url: "https://mentalitysports.com/advice",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Athlete Mental Health Advice Library | Mentality Sports",
    description:
      "Free resources on the mental side of sport. Articles and guides covering confidence, anxiety, adversity, and identity — for athletes across all sports.",
  },
  alternates: {
    canonical: "https://mentalitysports.com/advice",
  },
};

export default function AdviceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
