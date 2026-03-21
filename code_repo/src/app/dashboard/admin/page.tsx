"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  users,
  matches,
  sessions,
  weeklySessionData,
  getOverviewStats,
  getTopicCounts,
  getFlaggedItems,
  defaultSettings,
} from "@/lib/mock-data";
import {
  Users,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Star,
  Search,
  Shield,
  BarChart3,
  Activity,
  UserCheck,
} from "lucide-react";

const stats = getOverviewStats();
const topicCounts = getTopicCounts();
const flagged = getFlaggedItems();

export default function AdminDashboard() {
  const [userFilter, setUserFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !userFilter || u.name.toLowerCase().includes(userFilter.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-navy" />
          <h1 className="text-3xl font-bold text-navy">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          {defaultSettings.programName} &mdash; {defaultSettings.schoolName} &mdash;{" "}
          {defaultSettings.academicYear}
        </p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-navy">{stats.totalPlayers}</p>
            <p className="text-xs text-muted-foreground">Players</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <UserCheck className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-navy">{stats.totalMentors}</p>
            <p className="text-xs text-muted-foreground">Mentors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-5 w-5 text-orange-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-navy">{stats.activeMatches}</p>
            <p className="text-xs text-muted-foreground">Active Matches</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-5 w-5 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-navy">{sessions.length}</p>
            <p className="text-xs text-muted-foreground">Total Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-navy">{stats.avgRating}</p>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-navy">{stats.retentionRate}%</p>
            <p className="text-xs text-muted-foreground">Retention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Flagged items */}
          {(flagged.flaggedSessions.length > 0 ||
            flagged.mentorsWithCancellations.length > 0) && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  Items Needing Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {flagged.flaggedSessions.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-lg border border-red-200 bg-red-50/50 p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-navy">
                          {s.playerName} &mdash; Session on {s.date}
                        </span>
                        <Badge variant="destructive" className="text-xs">
                          Flagged
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {s.flagReason}
                      </p>
                    </div>
                  ))}
                  {flagged.mentorsWithCancellations.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-lg border border-amber-200 bg-amber-50/50 p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-navy">
                          {m.name}
                        </span>
                        <Badge variant="warning" className="text-xs">
                          {m.cancelledCount} cancellations
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {m.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Matches */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Matches</CardTitle>
              <CardDescription>
                {matches.filter((m) => m.status === "active").length} active, {" "}
                {matches.filter((m) => m.status === "paused").length} paused
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      match.atRisk ? "border-red-200 bg-red-50/30" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <Avatar className="h-8 w-8 border-2 border-white">
                          <AvatarFallback className="bg-navy-100 text-navy-700 text-xs">
                            {match.mentorName.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <Avatar className="h-8 w-8 border-2 border-white">
                          <AvatarFallback className="bg-orange-100 text-orange-700 text-xs">
                            {match.playerName.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-navy">
                          {match.mentorName} &rarr; {match.playerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {match.totalSessions} sessions &middot; Since{" "}
                          {match.startDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {match.atRisk && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <Badge
                        variant={
                          match.status === "active"
                            ? "success"
                            : match.status === "paused"
                            ? "warning"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {match.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Users</CardTitle>
              <CardDescription>{users.length} total users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-10"
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                  />
                </div>
                <div className="flex gap-1">
                  {[null, "player", "mentor", "coach"].map((role) => (
                    <button
                      key={role ?? "all"}
                      onClick={() => setRoleFilter(role)}
                      className={`rounded-md px-3 py-2 text-xs font-medium capitalize transition-colors ${
                        roleFilter === role
                          ? "bg-navy text-white"
                          : "bg-muted text-muted-foreground hover:bg-navy-50"
                      }`}
                    >
                      {role ?? "All"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 font-medium text-muted-foreground">
                        Name
                      </th>
                      <th className="pb-2 font-medium text-muted-foreground">
                        Role
                      </th>
                      <th className="pb-2 font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="pb-2 font-medium text-muted-foreground">
                        Matched With
                      </th>
                      <th className="pb-2 font-medium text-muted-foreground">
                        Last Login
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.slice(0, 10).map((user) => (
                      <tr key={user.id} className="border-b last:border-0">
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="text-xs bg-navy-100 text-navy-700">
                                {user.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-navy">
                              {user.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5">
                          <Badge
                            variant={
                              user.role === "mentor"
                                ? "secondary"
                                : user.role === "coach"
                                ? "default"
                                : "outline"
                            }
                            className="text-xs capitalize"
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-2.5">
                          <Badge
                            variant={
                              user.status === "active"
                                ? "success"
                                : user.status === "pending"
                                ? "warning"
                                : "destructive"
                            }
                            className="text-xs capitalize"
                          >
                            {user.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-muted-foreground">
                          {user.matchedWith || "—"}
                        </td>
                        <td className="py-2.5 text-muted-foreground">
                          {user.lastLogin}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredUsers.length > 10 && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Showing 10 of {filteredUsers.length} users
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Weekly sessions chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-500" />
                Weekly Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {weeklySessionData.slice(-8).map((week) => (
                  <div key={week.week} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-14 shrink-0">
                      {week.week}
                    </span>
                    <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-navy rounded-full"
                        style={{
                          width: `${(week.sessions / 10) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium w-4 text-right">
                      {week.sessions}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mood trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Avg Mood Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1.5 h-24">
                {weeklySessionData.slice(-8).map((week) => (
                  <div
                    key={week.week}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <span className="text-[9px] text-muted-foreground">
                      {week.avgMood.toFixed(1)}
                    </span>
                    <div
                      className={`w-full rounded-t ${
                        week.avgMood >= 7
                          ? "bg-emerald-500"
                          : week.avgMood >= 6
                          ? "bg-amber-400"
                          : "bg-red-400"
                      }`}
                      style={{
                        height: `${(week.avgMood / 10) * 100}%`,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-muted-foreground">
                  {weeklySessionData[weeklySessionData.length - 8]?.week}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  {weeklySessionData[weeklySessionData.length - 1]?.week}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Top topics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Discussion Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topicCounts.slice(0, 8).map((topic) => (
                  <div key={topic.topic} className="flex items-center gap-2">
                    <span className="text-sm text-navy flex-1 truncate">
                      {topic.topic}
                    </span>
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{
                          width: `${(topic.count / topicCounts[0].count) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-4 text-right">
                      {topic.count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Program settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Program Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">School</dt>
                  <dd className="font-medium text-navy">
                    {defaultSettings.schoolName}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Program</dt>
                  <dd className="font-medium text-navy">
                    {defaultSettings.programName}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Default Session</dt>
                  <dd className="font-medium text-navy">
                    {defaultSettings.sessionLengthDefault} min
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Max per Mentor</dt>
                  <dd className="font-medium text-navy">
                    {defaultSettings.maxPlayersPerMentor} players
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
