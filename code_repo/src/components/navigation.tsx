"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowRight, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Logo } from "@/components/logo";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/advice", label: "Advice" },
  { href: "/dashboard", label: "Locker Room" },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const matchIdRef = useRef<string | null>(null);

  function markRead() {
    if (!matchIdRef.current) return;
    localStorage.setItem(`lastReadAt:${matchIdRef.current}`, new Date().toISOString());
    setUnreadCount(0);
  }

  async function fetchAvatar(userId: string) {
    const supabase = createClient();
    const { data } = await supabase.from("profiles").select("avatar_url").eq("id", userId).single();
    setAvatarUrl(data?.avatar_url ?? null);
  }

  async function fetchUnread(userId: string) {
    const supabase = createClient();
    const { data: match } = await supabase
      .from("matches")
      .select("id")
      .or(`mentor_id.eq.${userId},player_id.eq.${userId}`)
      .eq("status", "active")
      .maybeSingle();
    if (!match) return;

    matchIdRef.current = match.id;

    if (window.location.pathname.startsWith("/dashboard")) {
      markRead();
      return;
    }

    const lastRead = localStorage.getItem(`lastReadAt:${match.id}`) ?? new Date(0).toISOString();
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("match_id", match.id)
      .neq("sender_id", userId)
      .gt("created_at", lastRead);
    setUnreadCount(count ?? 0);

    const channel = supabase
      .channel(`nav-unread:${match.id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `match_id=eq.${match.id}`,
      }, (payload) => {
        if (payload.new.sender_id !== userId) setUnreadCount((n) => n + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }

  useEffect(() => {
    const supabase = createClient();
    let cleanupUnread: (() => void) | undefined;

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        fetchAvatar(data.user.id);
        fetchUnread(data.user.id).then((fn) => { cleanupUnread = fn; });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchAvatar(session.user.id);
        fetchUnread(session.user.id).then((fn) => { cleanupUnread = fn; });
      } else {
        setAvatarUrl(null);
        setUnreadCount(0);
      }
    });

    return () => {
      subscription.unsubscribe();
      cleanupUnread?.();
    };
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/dashboard")) markRead();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const displayName = user?.user_metadata?.name ?? user?.email ?? "";

  return (
    <nav className="sticky top-0 z-50 bg-white/96 backdrop-blur-md transform-gpu">
      {/* Orange top accent line */}
      <div className="h-[2px] w-full bg-orange-500" />

      {/* Bottom border */}
      <div className="border-b border-offWhite-300">
        <div className="mx-auto flex h-[52px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Left — logo + badge */}
          <div className="flex items-center gap-3">
            <Logo href="/" variant="dark" size="xs" />
            <span className="hidden sm:inline-block text-[8px] font-bold uppercase tracking-[0.15em] text-navy/25 leading-tight">
              Nonprofit
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const showBadge = item.href === "/dashboard" && unreadCount > 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => { if (item.href === "/dashboard") markRead(); }}
                  className={cn(
                    "relative flex flex-col items-center gap-[3px] transition-colors duration-150",
                    isActive ? "text-navy" : "text-navy/35 hover:text-navy/70"
                  )}
                >
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                    {item.label}
                  </span>
                  {/* Active dot */}
                  {isActive ? (
                    <motion.span
                      layoutId="nav-dot"
                      className="h-[3px] w-[3px] rounded-full bg-orange-500"
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    />
                  ) : (
                    <span className="h-[3px] w-[3px] rounded-full bg-transparent" />
                  )}
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-2.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-orange-500 text-[8px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right — Instagram + auth */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://www.instagram.com/mentalitysports"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-navy/30 hover:text-navy/70 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>
            {user ? (
              <Link
                href="/profile"
                title="Your profile"
                className="flex h-7 w-7 items-center justify-center rounded-full overflow-hidden ring-1 ring-navy/15 hover:ring-navy/35 transition-all text-xs font-bold text-navy"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center bg-navy/8">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy/40 hover:text-navy transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 bg-navy px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white hover:bg-navy/85 transition-colors"
                >
                  Join
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="md:hidden p-1.5 text-navy/50 hover:text-navy transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span key="x" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="h-5 w-5" />
                </motion.span>
              ) : (
                <motion.span key="menu" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu className="h-5 w-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden bg-white border-b border-offWhite-300"
          >
            <div className="px-4 pt-2 pb-4">
              {navItems.map((item, i) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                const showBadge = item.href === "/dashboard" && unreadCount > 0;
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => { setMobileOpen(false); if (item.href === "/dashboard") setUnreadCount(0); }}
                      className={cn(
                        "flex items-center justify-between py-3.5 border-b border-offWhite-300 last:border-0",
                        isActive ? "text-navy" : "text-navy/40"
                      )}
                    >
                      <span className="text-[11px] font-bold uppercase tracking-[0.14em]">{item.label}</span>
                      <div className="flex items-center gap-2">
                        {showBadge && (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                        {isActive && <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}

              {/* Mobile auth */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.2 }}
                className="mt-4"
              >
                {user ? (
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between w-full border border-navy/15 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-navy/60 hover:text-navy hover:border-navy/30 transition-colors"
                  >
                    My Profile
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      href="/signin"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 flex items-center justify-center border border-navy/15 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-navy/60 hover:text-navy transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 flex items-center justify-center gap-2 bg-navy px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white hover:bg-navy/85 transition-colors"
                    >
                      Join <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
