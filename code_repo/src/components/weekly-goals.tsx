"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Heart, Brain, Pencil, Target, ChevronDown, ChevronUp } from "lucide-react";

interface GoalRow {
  effort_description: string | null;
  effort_score: number | null;
  attitude_description: string | null;
  attitude_score: number | null;
  focus_description: string | null;
  focus_score: number | null;
}

interface HistoryRow extends GoalRow {
  week_start: string;
}

interface FormState {
  effort_description: string;
  effort_score: number | null;
  attitude_description: string;
  attitude_score: number | null;
  focus_description: string;
  focus_score: number | null;
}

type Tab = "effort" | "attitude" | "focus";

const TABS: { key: Tab; label: string; Icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { key: "effort",   label: "Effort",   Icon: Zap,   color: "text-orange-500" },
  { key: "attitude", label: "Attitude", Icon: Heart,  color: "text-rose-500" },
  { key: "focus",    label: "Focus",    Icon: Brain,  color: "text-blue-500" },
];

function getMondayOfWeek(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0];
}

function formatWeek(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ScorePicker({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1.5 mt-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={`h-8 w-8 rounded-md text-sm font-semibold transition-colors ${
            value === n ? "bg-navy text-white" : "bg-offWhite text-navy/60 hover:bg-navy/10"
          }`}>
          {n}
        </button>
      ))}
    </div>
  );
}

function ScoreBar({ score, color }: { score: number | null; color: string }) {
  if (!score) return <div className="flex gap-1"><div className="h-1.5 w-full rounded-full bg-offWhite-300" /></div>;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n} className={`h-2 flex-1 rounded-full transition-colors ${n <= score ? color : "bg-offWhite-300"}`} />
      ))}
    </div>
  );
}

export function WeeklyGoals({ matchId }: { matchId: string; userId: string }) {
  const [goals, setGoals] = useState<GoalRow | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("effort");
  const [showHistory, setShowHistory] = useState(false);
  const [form, setForm] = useState<FormState>({
    effort_description: "", effort_score: null,
    attitude_description: "", attitude_score: null,
    focus_description: "", focus_score: null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const weekStart = getMondayOfWeek();

      // Current week
      const { data: current } = await supabase
        .from("weekly_goals")
        .select("effort_description, effort_score, attitude_description, attitude_score, focus_description, focus_score")
        .eq("match_id", matchId)
        .eq("week_start", weekStart)
        .maybeSingle();
      setGoals(current);

      // History — last 6 weeks (excluding current)
      const { data: hist } = await supabase
        .from("weekly_goals")
        .select("week_start, effort_score, attitude_score, focus_score, effort_description, attitude_description, focus_description")
        .eq("match_id", matchId)
        .neq("week_start", weekStart)
        .order("week_start", { ascending: false })
        .limit(6);
      setHistory((hist ?? []) as HistoryRow[]);

      setLoaded(true);
    }
    load();
  }, [matchId]);

  function openEdit() {
    setForm({
      effort_description: goals?.effort_description ?? "",
      effort_score: goals?.effort_score ?? null,
      attitude_description: goals?.attitude_description ?? "",
      attitude_score: goals?.attitude_score ?? null,
      focus_description: goals?.focus_description ?? "",
      focus_score: goals?.focus_score ?? null,
    });
    setEditing(true);
    setActiveTab("effort");
  }

  async function save() {
    setSaving(true);
    const supabase = createClient();
    const weekStart = getMondayOfWeek();
    const { data } = await supabase
      .from("weekly_goals")
      .upsert(
        {
          match_id: matchId,
          week_start: weekStart,
          effort_description: form.effort_description || null,
          effort_score: form.effort_score,
          attitude_description: form.attitude_description || null,
          attitude_score: form.attitude_score,
          focus_description: form.focus_description || null,
          focus_score: form.focus_score,
        },
        { onConflict: "match_id,week_start" }
      )
      .select("effort_description, effort_score, attitude_description, attitude_score, focus_description, focus_score")
      .maybeSingle();
    if (data) setGoals(data);
    setSaving(false);
    setEditing(false);
  }

  function updateForm(key: keyof FormState, value: string | number | null) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  if (!loaded) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Weekly Mental Goals</CardTitle>
        {!editing && (
          <button type="button" onClick={openEdit}
            className="flex items-center gap-1.5 rounded-md border border-offWhite-300 px-3 py-1.5 text-xs font-medium text-navy hover:bg-offWhite transition-colors">
            {goals ? <><Pencil className="h-3.5 w-3.5" /> Edit</> : <><Target className="h-3.5 w-3.5" /> Set goals</>}
          </button>
        )}
      </CardHeader>

      <CardContent>
        {/* ── EDIT MODE ── */}
        {editing ? (
          <div className="space-y-5">
            {TABS.map(({ key, label, Icon }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-navy/50" />
                  <p className="text-sm font-semibold text-navy">{label}</p>
                </div>
                <textarea rows={2}
                  value={form[`${key}_description` as keyof FormState] as string}
                  onChange={(e) => updateForm(`${key}_description` as keyof FormState, e.target.value)}
                  placeholder={`What's your ${label.toLowerCase()} goal this week?`}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 placeholder:text-muted-foreground/60"
                />
                <div>
                  <p className="text-xs text-muted-foreground">Score (1 = needs work, 5 = crushing it)</p>
                  <ScorePicker
                    value={form[`${key}_score` as keyof FormState] as number | null}
                    onChange={(v) => updateForm(`${key}_score` as keyof FormState, v)}
                  />
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-1">
              <button type="button" onClick={save} disabled={saving}
                className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy/80 transition-colors disabled:opacity-50">
                {saving ? "Saving…" : "Save goals"}
              </button>
              <button type="button" onClick={() => setEditing(false)}
                className="rounded-md border border-offWhite-300 px-4 py-2 text-sm font-medium text-navy hover:bg-offWhite transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ) : goals ? (
          /* ── READ MODE ── */
          <div className="space-y-4">
            <div className="flex gap-2">
              {TABS.map(({ key, label, Icon }) => (
                <button key={key} type="button" onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === key ? "bg-navy text-white" : "bg-muted text-muted-foreground hover:bg-navy/10"
                  }`}>
                  <Icon className="h-3.5 w-3.5" />{label}
                </button>
              ))}
            </div>
            <div className="rounded-lg bg-offWhite p-4">
              <p className="text-sm font-medium text-navy leading-relaxed">
                {(goals[`${activeTab}_description` as keyof GoalRow] as string) || (
                  <span className="text-muted-foreground italic">No description set</span>
                )}
              </p>
              {(() => {
                const score = goals[`${activeTab}_score` as keyof GoalRow] as number | null;
                return score ? (
                  <div className="mt-3">
                    <ScoreBar score={score} color={
                      activeTab === "effort" ? "bg-orange-400" :
                      activeTab === "attitude" ? "bg-rose-400" : "bg-blue-400"
                    } />
                    <p className="text-xs text-muted-foreground mt-1">{score}/5</p>
                  </div>
                ) : null;
              })()}
            </div>

            {/* History toggle */}
            {history.length > 0 && (
              <div>
                <button type="button" onClick={() => setShowHistory(h => !h)}
                  className="flex items-center gap-1.5 text-xs font-medium text-navy/50 hover:text-navy transition-colors">
                  {showHistory ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  {showHistory ? "Hide" : "Show"} history ({history.length} weeks)
                </button>

                {showHistory && (
                  <div className="mt-3 space-y-2">
                    {history.map((row) => (
                      <div key={row.week_start} className="rounded-lg border border-offWhite-300 bg-white p-3">
                        <p className="text-xs font-semibold text-navy/50 mb-2">Week of {formatWeek(row.week_start)}</p>
                        <div className="space-y-1.5">
                          {TABS.map(({ key, label, Icon }) => (
                            <div key={key} className="flex items-center gap-2">
                              <Icon className="h-3 w-3 text-navy/30 shrink-0" />
                              <span className="text-xs text-navy/50 w-14 shrink-0">{label}</span>
                              <div className="flex-1">
                                <ScoreBar
                                  score={row[`${key}_score` as keyof HistoryRow] as number | null}
                                  color={key === "effort" ? "bg-orange-400" : key === "attitude" ? "bg-rose-400" : "bg-blue-400"}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-6 text-right shrink-0">
                                {(row[`${key}_score` as keyof HistoryRow] as number | null) ?? "—"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ── EMPTY STATE ── */
          <div className="rounded-lg border-2 border-dashed border-offWhite-300 p-6 text-center">
            <Target className="h-8 w-8 text-navy/20 mx-auto mb-2" />
            <p className="text-sm font-medium text-navy mb-0.5">No goals set yet this week</p>
            <p className="text-xs text-muted-foreground mb-4">Either you or your mentor can set this week&apos;s mental goals.</p>
            <button type="button" onClick={openEdit}
              className="inline-flex items-center gap-1.5 rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy/80 transition-colors">
              <Target className="h-3.5 w-3.5" /> Set this week&apos;s goals
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
