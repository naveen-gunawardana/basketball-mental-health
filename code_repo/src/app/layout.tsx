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
  title: "Mentality Sports | Athlete Mentorship & Mental Performance",
  description:
    "Mentality Sports connects athletes with mentors who've lived it — real relationships built on mental resilience, honest sport guidance, and the support no coach is trained to give.",
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
                  <span className="font-semibold tracking-tight">Mentality Sports</span>
                </div>
                <p className="text-sm text-white/40 leading-relaxed">
                  Mentorship, resources, and community for the mental side of sport. Open to athletes and coaches across all sports.
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Explore</h4>
                <ul className="space-y-2.5 text-sm">
                  <li><a href="/advice" className="text-white/50 hover:text-white transition-colors">Advice Library</a></li>
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
            <div className="mt-10 pt-8 border-t border-white/8 text-xs text-white/25 text-center space-y-2">
              <div className="flex justify-center gap-4">
                <a href="/terms" className="hover:text-white/50 transition-colors">Terms of Service</a>
                <a href="/privacy" className="hover:text-white/50 transition-colors">Privacy Policy</a>
                <a href="mailto:hello@mentalitysports.com" className="hover:text-white/50 transition-colors">Contact</a>
              </div>
              <div>&copy; {new Date().getFullYear()} Mentality Sports. All rights reserved.</div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
