"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserPlus, Menu, X } from "lucide-react";
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

    // If already on dashboard, mark as read immediately
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
        if (payload.new.sender_id !== userId) {
          setUnreadCount((n) => n + 1);
        }
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

  // Mark as read whenever user is on the dashboard
  useEffect(() => {
    if (pathname.startsWith("/dashboard")) {
      markRead();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const displayName = user?.user_metadata?.name ?? user?.email ?? "";

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-offWhite-300 shadow-sm transform-gpu">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <Logo href="/" variant="dark" size="xs" />
          <span className="hidden sm:inline-block text-[9px] font-bold uppercase tracking-widest text-navy/30 border border-navy/15 rounded-sm px-1.5 py-0.5 leading-tight">
            501(c)(3)
          </span>
        </div>

        {/* Desktop — links + actions on right */}
        <div className="hidden md:flex items-center gap-0.5">
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
                  "group relative px-3.5 py-2 text-sm font-medium transition-colors duration-150",
                  isActive ? "text-navy" : "text-navy/40 hover:text-navy"
                )}
              >
                {item.label}
                {/* Active underline */}
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-3 right-3 h-[1.5px] bg-orange-400 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {/* Hover underline (non-active) */}
                {!isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[1.5px] bg-navy/20 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                )}
                {showBadge && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="ml-3 flex items-center gap-3 pl-3 border-l border-current/10">
            {user ? (
              <Link
                href="/profile"
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold overflow-hidden transition-all ring-2",
                    "ring-navy/20 hover:ring-navy/40 text-navy"
                )}
                title="Your profile"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center bg-navy/10">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-orange-400 transition-colors"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Sign Up
              </Link>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md transition-colors text-navy/60 hover:text-navy"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="md:hidden border-t border-offWhite-300 bg-white px-4 py-3 space-y-0.5"
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const showBadge = item.href === "/dashboard" && unreadCount > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => { setMobileOpen(false); if (item.href === "/dashboard") setUnreadCount(0); }}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "text-navy bg-navy/8" : "text-navy/50 hover:text-navy hover:bg-navy/5"
                )}
              >
                {item.label}
                {showBadge && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-2 mt-2 border-t border-offWhite-300">
            {user ? (
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-navy/20 px-4 py-2.5 text-sm font-medium text-navy/70 hover:text-navy hover:border-navy/40 transition-colors"
              >
                My Profile
              </Link>
            ) : (
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-400 transition-colors"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Sign Up
              </Link>
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </nav>
  );
}
