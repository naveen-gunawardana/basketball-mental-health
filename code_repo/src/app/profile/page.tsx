"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Save, KeyRound, Mail, User, Camera } from "lucide-react";
import { AvatarUpload } from "@/components/avatar-upload";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState("");

  const [name, setName] = useState("");
  const [nameStatus, setNameStatus] = useState("");

  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState("");

  const [resetStatus, setResetStatus] = useState("");

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [signOutLoading, setSignOutLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/signin"); return; }
      setUserId(user.id);
      setCurrentEmail(user.email ?? "");
      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles").select("name, avatar_url").eq("id", user.id).single();
      setName(profile?.name ?? "");
      setAvatarUrl(profile?.avatar_url ?? null);
      setLoading(false);
    }
    load();
  }, [router]);

  async function saveName() {
    if (!userId) return;
    setNameStatus("saving");
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ name }).eq("id", userId);
    setNameStatus(error ? "error" : "saved");
    setTimeout(() => setNameStatus(""), 3000);
  }

  async function saveEmail() {
    setEmailStatus("saving");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email });
    if (error) {
      setEmailStatus("error:" + error.message);
    } else {
      setEmailStatus("Check your new email for a confirmation link.");
    }
    setTimeout(() => setEmailStatus(""), 5000);
  }

  async function sendPasswordReset() {
    setResetStatus("sending");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: currentEmail }),
    });
    setResetStatus(res.ok ? "sent" : "error");
    setTimeout(() => setResetStatus(""), 5000);
  }

  async function handleSignOut() {
    setSignOutLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return <div className="mx-auto max-w-lg px-4 py-20 text-center text-muted-foreground">Loading your profile...</div>;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy">Account</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and account settings.</p>
      </div>

      <div className="space-y-4">
        {/* Profile Picture */}
        {userId && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="h-4 w-4 text-navy/50" />Profile Picture
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-5">
              <AvatarUpload
                userId={userId}
                name={name}
                avatarUrl={avatarUrl}
                onUpload={(url) => setAvatarUrl(url)}
              />
              <p className="text-sm text-muted-foreground">Click your avatar to upload a new photo.</p>
            </CardContent>
          </Card>
        )}

        {/* Name */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-navy/50" />Name
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <div className="flex items-center gap-3">
              <Button size="sm" onClick={saveName} disabled={nameStatus === "saving"}>
                <Save className="h-3.5 w-3.5 mr-1.5" />
                {nameStatus === "saving" ? "Saving..." : "Save Name"}
              </Button>
              {nameStatus === "saved" && <p className="text-sm text-sage-600">Saved.</p>}
              {nameStatus === "error" && <p className="text-sm text-red-500">Something went wrong.</p>}
            </div>
          </CardContent>
        </Card>

        {/* Email */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4 text-navy/50" />Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <div className="flex items-center gap-3">
              <Button size="sm" onClick={saveEmail} disabled={emailStatus === "saving" || email === currentEmail}>
                <Save className="h-3.5 w-3.5 mr-1.5" />
                {emailStatus === "saving" ? "Saving..." : "Update Email"}
              </Button>
              {emailStatus && emailStatus !== "saving" && (
                <p className={`text-sm ${emailStatus.startsWith("error") ? "text-red-500" : "text-sage-600"}`}>
                  {emailStatus.startsWith("error:") ? emailStatus.slice(6) : emailStatus}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Password reset */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-navy/50" />Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              We&apos;ll send a reset link to <span className="font-medium text-navy">{currentEmail}</span>.
            </p>
            <div className="flex items-center gap-3">
              <Button size="sm" variant="outline" onClick={sendPasswordReset} disabled={resetStatus === "sending"}>
                <KeyRound className="h-3.5 w-3.5 mr-1.5" />
                {resetStatus === "sending" ? "Sending..." : "Send Reset Link"}
              </Button>
              {resetStatus === "sent" && <p className="text-sm text-sage-600">Check your email.</p>}
              {resetStatus === "error" && <p className="text-sm text-red-500">Something went wrong.</p>}
            </div>
          </CardContent>
        </Card>

        {/* Sign out */}
        <Card className="border-red-100">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-navy">Sign out</p>
                <p className="text-xs text-muted-foreground mt-0.5">You&apos;ll need to sign back in to access your dashboard.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={handleSignOut}
                disabled={signOutLoading}
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                {signOutLoading ? "Signing out..." : "Sign Out"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
