import Link from "next/link";
import { Mic, ArrowRight, Headphones, Radio } from "lucide-react";

export const metadata = {
  title: "Podcast — Mentality Sports",
  description: "Real conversations about the mental side of the game. Athletes, mentors, and coaches share what it really takes.",
};

const episodes = [
  {
    number: 1,
    title: "The Mental Side of the Game",
    guest: "Juli Vergara",
    description:
      "We sit down with Juli Vergara to talk about the pressures young athletes face, how mental resilience separates good from great, and what it really means to compete with purpose.",
    youtubeId: "LdCQaPwV3io",
    tags: ["Mental Health", "Resilience", "Youth Sports"],
  },
];

export default function PodcastPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-navy" />
        {/* Subtle grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
            backgroundSize: "200px 200px",
          }}
        />

        <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-28">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20">
              <Radio className="h-4 w-4 text-orange-400" />
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
              Mentality Sports Podcast
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white leading-[1.05] mb-6 max-w-2xl">
            Real talk from<br />
            <span className="text-orange-400">real athletes.</span>
          </h1>

          <p className="text-white/60 text-lg max-w-xl leading-relaxed mb-10">
            Conversations about the mental game — pressure, identity, resilience,
            and what it truly takes to compete at every level.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <Headphones className="h-4 w-4" />
              <span>New episodes dropping soon</span>
            </div>
            <span className="h-4 w-px bg-white/20" />
            <Link
              href="/podcast#apply"
              className="flex items-center gap-1.5 text-sm text-orange-400 hover:text-orange-300 transition-colors font-medium"
            >
              Apply to be a guest <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Episodes */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex items-center gap-3 mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-navy/40">Episodes</p>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="space-y-12">
          {episodes.map((ep) => (
            <article key={ep.number} className="group">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8 items-start">
                {/* Video embed */}
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-navy ring-1 ring-navy/10">
                  <iframe
                    src={`https://www.youtube.com/embed/${ep.youtubeId}?rel=0&modestbranding=1`}
                    title={ep.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>

                {/* Info */}
                <div className="flex flex-col justify-center py-2">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-white text-[10px] font-bold">
                      {ep.number}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-navy/40">
                      Episode {ep.number}
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy leading-tight mb-2">
                    {ep.title}
                  </h2>
                  <p className="text-sm font-medium text-orange-600 mb-4">
                    with {ep.guest}
                  </p>

                  <p className="text-navy/70 leading-relaxed text-sm sm:text-base mb-6">
                    {ep.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {ep.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-navy/15 px-3 py-1 text-xs font-medium text-navy/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-5xl px-6">
        <div className="h-px bg-border" />
      </div>

      {/* Apply CTA */}
      <section id="apply" className="mx-auto max-w-5xl px-6 py-20">
        <div className="rounded-2xl bg-navy px-8 py-12 sm:px-14 sm:py-16 relative overflow-hidden">
          {/* bg accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <div className="max-w-lg">
              <div className="flex items-center gap-2 mb-4">
                <Mic className="h-4 w-4 text-orange-400" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
                  Share Your Story
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3 leading-snug">
                Are you an athlete, coach,<br className="hidden sm:block" /> or mental performance expert?
              </h2>
              <p className="text-white/60 text-sm leading-relaxed">
                We are always looking for authentic voices to join the conversation.
                If you have a story worth telling, we want to hear from you.
              </p>
            </div>

            <Link
              href="/admin"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-7 py-4 text-sm font-semibold text-white hover:bg-orange-600 active:scale-[0.98] transition-all shadow-lg shadow-orange-900/30"
            >
              Apply to Be a Guest
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
