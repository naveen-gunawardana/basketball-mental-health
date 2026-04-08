"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send } from "lucide-react";

interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string | null;
  read_at: string | null;
}

interface ChatWindowProps {
  matchId: string;
  currentUserId: string;
  otherPersonName: string;
  otherPersonAvatarUrl?: string | null;
  fullHeight?: boolean;
  onUnreadChange?: (count: number) => void;
}

export function ChatWindow({ matchId, currentUserId, otherPersonName, otherPersonAvatarUrl, fullHeight, onUnreadChange }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  async function markIncomingAsRead(msgs: Message[]) {
    const unread = msgs.filter(m => m.sender_id !== currentUserId && !m.read_at);
    if (unread.length === 0) return;
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() } as never)
      .in("id", unread.map(m => m.id));
    setMessages(prev => prev.map(m =>
      unread.some(u => u.id === m.id) ? { ...m, read_at: new Date().toISOString() } : m
    ));
    onUnreadChange?.(0);
  }

  useEffect(() => {
    supabase
      .from("messages")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true })
      .limit(100)
      .then(({ data }) => {
        const msgs = (data ?? []) as Message[];
        setMessages(msgs);
        markIncomingAsRead(msgs);
      });

    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            const updated = [...prev, newMsg];
            // Mark as read immediately if it's from the other person
            if (newMsg.sender_id !== currentUserId) {
              markIncomingAsRead([newMsg]);
            }
            return updated;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
        (payload) => {
          const updated = payload.new as Message;
          setMessages(prev => prev.map(m => m.id === updated.id ? { ...m, read_at: updated.read_at } : m));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function send() {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    setInput("");

    const { error } = await supabase.from("messages").insert({
      match_id: matchId,
      sender_id: currentUserId,
      content,
    });

    if (error) {
      setInput(content);
    } else {
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "new_message", matchId, senderId: currentUserId }),
      }).catch(() => {});
    }
    setSending(false);
  }

  function initials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  }

  const firstName = otherPersonName.split(" ")[0];

  // Find the last message I sent that has been read
  const myMessages = messages.filter(m => m.sender_id === currentUserId);
  const lastReadMsgId = [...myMessages].reverse().find(m => m.read_at)?.id ?? null;

  return (
    <div className={`flex flex-col ${fullHeight ? "flex-1 min-h-0" : "h-[520px]"}`}>
      {/* Compact person header */}
      <div className="flex items-center gap-3 py-3 border-b border-slate-100 shrink-0">
        {otherPersonAvatarUrl ? (
          <img
            src={otherPersonAvatarUrl}
            alt={otherPersonName}
            className="h-8 w-8 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-navy/10 flex items-center justify-center text-navy text-xs font-bold shrink-0">
            {initials(otherPersonName)}
          </div>
        )}
        <p className="text-sm font-semibold text-navy">{otherPersonName}</p>
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scrollbar-hide py-4 space-y-2.5 min-h-0">
        {messages.length === 0 && (
          <p className="text-sm text-slate-400 text-center pt-10">
            No messages yet — say hi to {firstName}!
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          const showSeen = isMe && msg.id === lastReadMsgId;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                {!isMe && (
                  <div className="shrink-0 mb-0.5">
                    {otherPersonAvatarUrl ? (
                      <img
                        src={otherPersonAvatarUrl}
                        alt={otherPersonName}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600">
                        {initials(otherPersonName)}
                      </div>
                    )}
                  </div>
                )}
                <div
                  className={`max-w-[72%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed break-words min-w-0 ${
                    isMe
                      ? "bg-navy text-white rounded-br-sm"
                      : "bg-slate-100 text-navy rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
              {showSeen && (
                <p className="text-[10px] text-muted-foreground mt-0.5 mr-1">Seen</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-slate-100 pt-4 pb-6 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={`Message ${firstName}...`}
          className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-navy/40 focus:bg-white transition-colors placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={send}
          disabled={!input.trim() || sending}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-white transition-colors hover:bg-navy/80 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
