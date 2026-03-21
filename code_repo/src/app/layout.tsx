import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navigation } from "@/components/navigation";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Hoops & Hope | Basketball Mental Health Mentorship",
  description:
    "Connecting high school basketball players with college mentors for mental performance support. Build confidence, handle pressure, and translate practice to games.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <footer className="border-t bg-navy text-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-sm">
                    HH
                  </div>
                  <span className="text-lg font-bold">Hoops &amp; Hope</span>
                </div>
                <p className="text-navy-200 text-sm">
                  Big Brothers Big Sisters for basketball. Weekly mentorship
                  focused on the mental side of the game.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Quick Links</h4>
                <ul className="space-y-2 text-sm text-navy-200">
                  <li>
                    <a href="/resources" className="hover:text-white transition-colors">
                      Resource Library
                    </a>
                  </li>
                  <li>
                    <a href="/signup" className="hover:text-white transition-colors">
                      Join the Program
                    </a>
                  </li>
                  <li>
                    <a href="/dashboard/player" className="hover:text-white transition-colors">
                      Player Dashboard
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Contact</h4>
                <p className="text-sm text-navy-200">
                  Currently piloting at Menlo School, San Francisco.
                </p>
                <p className="text-sm text-navy-200 mt-2">
                  Interested in bringing Hoops &amp; Hope to your school?
                  Reach out to get started.
                </p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-navy-400 text-center text-sm text-navy-300">
              &copy; {new Date().getFullYear()} Hoops &amp; Hope Mentorship.
              All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
