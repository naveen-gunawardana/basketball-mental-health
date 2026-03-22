"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Camera } from "lucide-react";

interface Props {
  userId: string;
  name: string;
  avatarUrl: string | null;
  size?: "sm" | "lg";
  onUpload?: (url: string) => void;
}

export function AvatarUpload({ userId, name, avatarUrl, size = "lg", onUpload }: Props) {
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const dim = size === "lg" ? "h-20 w-20" : "h-8 w-8";
  const textSize = size === "lg" ? "text-2xl" : "text-xs";
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;

    const supabase = createClient();
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      // Add cache-busting so the new image shows immediately
      const url = `${publicUrl}?t=${Date.now()}`;
      setPreview(url);
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);
      onUpload?.(url);
    }

    setUploading(false);
  }

  return (
    <div className="relative inline-block">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={`relative ${dim} rounded-full overflow-hidden group`}
      >
        {preview ? (
          <img src={preview} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-navy text-white font-bold ${textSize}`}>
            {initials}
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
          {uploading
            ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Camera className="h-4 w-4 text-white" />
          }
        </div>
      </button>
      {size === "lg" && (
        <p className="text-xs text-muted-foreground mt-2 text-center">Click to change</p>
      )}
    </div>
  );
}
