"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string | null;
}

interface ChatWindowProps {
  matchId: string;
  currentUserId: string;
  otherPersonName: string;
  otherPersonAvatarUrl?: string | null;
  fullHeight?: boolean;
}

export function ChatWindow({ matchId, currentUserId, otherPersonName, otherPersonAvatarUrl, fullHeight }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    // Load existing messages
    supabase
      .from("messages")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true })
      .limit(100)
      .then(({ data }) => {
        if (data) setMessages(data);
      });

    // Subscribe to new messages in real time
    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          setMessages((prev) => {
            // Avoid duplicates if our own insert already came back optimistically
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as Message];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  // Scroll chat container to bottom on new messages — never touches page scroll
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
      // Restore input if failed
      setInput(content);
    } else {
      // Notify recipient if they've been inactive (fire-and-forget)
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

  return (
    <div className={`flex flex-col ${fullHeight ? "h-full" : "h-[420px]"}`}>
      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center pt-8">
            No messages yet — say hi!
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
              {!isMe && (
                <div className="shrink-0">
                  {otherPersonAvatarUrl ? (
                    <img
                      src={otherPersonAvatarUrl}
                      alt={otherPersonName}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[10px] bg-navy/10 text-navy">
                        {initials(otherPersonName)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              )}
              <div
                className={`max-w-[72%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  isMe
                    ? "bg-navy text-white rounded-br-sm"
                    : "bg-offWhite text-navy rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-offWhite-300 pt-3 mt-1">
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
          placeholder={`Message ${otherPersonName.split(" ")[0]}...`}
          className="flex-1 rounded-full border border-offWhite-300 bg-offWhite px-4 py-2 text-sm outline-none focus:border-navy/30 focus:ring-0 placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={send}
          disabled={!input.trim() || sending}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-white transition-colors hover:bg-navy/80 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
