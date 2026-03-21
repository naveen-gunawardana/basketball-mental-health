import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Athlete Mental Health | Mentorship & Resources for Athletes",
  description:
    "Connecting athletes with mentors, resources, and community to support mental health, confidence, and performance across all sports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${inter.variable} antialiased`}
      >
        <Navigation />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <footer className="border-t border-navy-700 bg-navy text-white">
          <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-20 xl:px-32">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                  </div>
                  <span className="font-semibold tracking-tight">[Platform Name]</span>
                </div>
                <p className="text-sm text-white/40 leading-relaxed">
                  Mentorship, resources, and community for the mental side of sport. Open to athletes and coaches across all sports.
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Explore</h4>
                <ul className="space-y-2.5 text-sm">
                  <li><a href="/resources" className="text-white/50 hover:text-white transition-colors">Resource Library</a></li>
                  <li><a href="/mentors" className="text-white/50 hover:text-white transition-colors">Our Mentors</a></li>
                  <li><a href="/signup" className="text-white/50 hover:text-white transition-colors">Get Involved</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Join Us</h4>
                <p className="text-sm text-white/40 mb-4 leading-relaxed">
                  Currently in pilot. Open to athletes, coaches, and mentors across all sports.
                </p>
                <a href="/signup" className="inline-block rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors">
                  Get Involved
                </a>
              </div>
            </div>
            <div className="mt-10 pt-8 border-t border-white/8 text-xs text-white/25 text-center">
              &copy; {new Date().getFullYear()} [Platform Name]. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
