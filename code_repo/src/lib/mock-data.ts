// Mock data for the basketball mentorship admin dashboard

export type UserRole = "player" | "mentor" | "coach";
export type UserStatus = "active" | "inactive" | "pending";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  matchedWith: string | null;
  joinDate: string;
  lastLogin: string;
  avatar: string;
}

export interface Match {
  id: string;
  mentorId: string;
  playerId: string;
  mentorName: string;
  playerName: string;
  startDate: string;
  lastSessionDate: string;
  totalSessions: number;
  status: "active" | "paused" | "completed";
  atRisk: boolean;
}

export interface Session {
  id: string;
  matchId: string;
  mentorName: string;
  playerName: string;
  date: string;
  duration: number; // minutes
  rating: number; // 1-5
  moodScore: number; // 1-10
  topics: string[];
  flagged: boolean;
  flagReason?: string;
  notes: string;
}

export interface WeeklySessionData {
  week: string;
  sessions: number;
  avgMood: number;
}

export interface TopicCount {
  topic: string;
  count: number;
}

export interface ProgramSettings {
  schoolName: string;
  programName: string;
  sessionLengthDefault: number;
  academicYear: string;
  maxPlayersPerMentor: number;
}

// --- Users ---
export const users: User[] = [
  {
    id: "u1",
    name: "Marcus Johnson",
    email: "marcus.j@school.edu",
    role: "player",
    status: "active",
    matchedWith: "Coach Davis",
    joinDate: "2025-09-05",
    lastLogin: "2026-02-10",
    avatar: "MJ",
  },
  {
    id: "u2",
    name: "Coach Ray Davis",
    email: "ray.davis@school.edu",
    role: "mentor",
    status: "active",
    matchedWith: "Marcus Johnson",
    joinDate: "2025-08-20",
    lastLogin: "2026-02-10",
    avatar: "RD",
  },
  {
    id: "u3",
    name: "Aisha Williams",
    email: "aisha.w@school.edu",
    role: "player",
    status: "active",
    matchedWith: "Mike Torres",
    joinDate: "2025-09-12",
    lastLogin: "2026-02-09",
    avatar: "AW",
  },
  {
    id: "u4",
    name: "Mike Torres",
    email: "mike.t@school.edu",
    role: "mentor",
    status: "active",
    matchedWith: "Aisha Williams",
    joinDate: "2025-08-15",
    lastLogin: "2026-02-11",
    avatar: "MT",
  },
  {
    id: "u5",
    name: "DeShawn Carter",
    email: "deshawn.c@school.edu",
    role: "player",
    status: "active",
    matchedWith: "Lisa Park",
    joinDate: "2025-09-18",
    lastLogin: "2026-02-08",
    avatar: "DC",
  },
  {
    id: "u6",
    name: "Lisa Park",
    email: "lisa.p@school.edu",
    role: "mentor",
    status: "active",
    matchedWith: "DeShawn Carter",
    joinDate: "2025-08-10",
    lastLogin: "2026-02-07",
    avatar: "LP",
  },
  {
    id: "u7",
    name: "Jaylen Brooks",
    email: "jaylen.b@school.edu",
    role: "player",
    status: "active",
    matchedWith: "Sandra Chen",
    joinDate: "2025-10-01",
    lastLogin: "2026-02-11",
    avatar: "JB",
  },
  {
    id: "u8",
    name: "Sandra Chen",
    email: "sandra.c@school.edu",
    role: "mentor",
    status: "active",
    matchedWith: "Jaylen Brooks",
    joinDate: "2025-08-22",
    lastLogin: "2026-02-10",
    avatar: "SC",
  },
  {
    id: "u9",
    name: "Tyler Washington",
    email: "tyler.w@school.edu",
    role: "player",
    status: "inactive",
    matchedWith: null,
    joinDate: "2025-09-25",
    lastLogin: "2026-01-15",
    avatar: "TW",
  },
  {
    id: "u10",
    name: "Brianna Scott",
    email: "brianna.s@school.edu",
    role: "player",
    status: "active",
    matchedWith: "James Okafor",
    joinDate: "2025-10-10",
    lastLogin: "2026-02-09",
    avatar: "BS",
  },
  {
    id: "u11",
    name: "James Okafor",
    email: "james.o@school.edu",
    role: "mentor",
    status: "active",
    matchedWith: "Brianna Scott",
    joinDate: "2025-08-18",
    lastLogin: "2026-02-11",
    avatar: "JO",
  },
  {
    id: "u12",
    name: "Keisha Taylor",
    email: "keisha.t@school.edu",
    role: "player",
    status: "pending",
    matchedWith: null,
    joinDate: "2026-01-28",
    lastLogin: "2026-01-28",
    avatar: "KT",
  },
  {
    id: "u13",
    name: "Andre Mitchell",
    email: "andre.m@school.edu",
    role: "player",
    status: "active",
    matchedWith: "Coach Ray Davis",
    joinDate: "2025-11-05",
    lastLogin: "2026-02-06",
    avatar: "AM",
  },
  {
    id: "u14",
    name: "Coach Tanya Reed",
    email: "tanya.r@school.edu",
    role: "coach",
    status: "active",
    matchedWith: null,
    joinDate: "2025-08-01",
    lastLogin: "2026-02-11",
    avatar: "TR",
  },
  {
    id: "u15",
    name: "Omar Hassan",
    email: "omar.h@school.edu",
    role: "player",
    status: "active",
    matchedWith: null,
    joinDate: "2026-01-10",
    lastLogin: "2026-01-22",
    avatar: "OH",
  },
  {
    id: "u16",
    name: "Chris Morales",
    email: "chris.m@school.edu",
    role: "mentor",
    status: "inactive",
    matchedWith: null,
    joinDate: "2025-09-01",
    lastLogin: "2025-12-20",
    avatar: "CM",
  },
  {
    id: "u17",
    name: "Destiny Brown",
    email: "destiny.b@school.edu",
    role: "player",
    status: "active",
    matchedWith: "Sandra Chen",
    joinDate: "2025-10-20",
    lastLogin: "2026-02-10",
    avatar: "DB",
  },
  {
    id: "u18",
    name: "Coach Will Franklin",
    email: "will.f@school.edu",
    role: "coach",
    status: "active",
    matchedWith: null,
    joinDate: "2025-08-05",
    lastLogin: "2026-02-09",
    avatar: "WF",
  },
];

// --- Matches ---
export const matches: Match[] = [
  {
    id: "m1",
    mentorId: "u2",
    playerId: "u1",
    mentorName: "Coach Ray Davis",
    playerName: "Marcus Johnson",
    startDate: "2025-09-10",
    lastSessionDate: "2026-02-08",
    totalSessions: 18,
    status: "active",
    atRisk: false,
  },
  {
    id: "m2",
    mentorId: "u4",
    playerId: "u3",
    mentorName: "Mike Torres",
    playerName: "Aisha Williams",
    startDate: "2025-09-15",
    lastSessionDate: "2026-02-05",
    totalSessions: 16,
    status: "active",
    atRisk: false,
  },
  {
    id: "m3",
    mentorId: "u6",
    playerId: "u5",
    mentorName: "Lisa Park",
    playerName: "DeShawn Carter",
    startDate: "2025-09-20",
    lastSessionDate: "2026-01-20",
    totalSessions: 12,
    status: "active",
    atRisk: true,
  },
  {
    id: "m4",
    mentorId: "u8",
    playerId: "u7",
    mentorName: "Sandra Chen",
    playerName: "Jaylen Brooks",
    startDate: "2025-10-05",
    lastSessionDate: "2026-02-10",
    totalSessions: 14,
    status: "active",
    atRisk: false,
  },
  {
    id: "m5",
    mentorId: "u11",
    playerId: "u10",
    mentorName: "James Okafor",
    playerName: "Brianna Scott",
    startDate: "2025-10-15",
    lastSessionDate: "2026-02-03",
    totalSessions: 13,
    status: "active",
    atRisk: false,
  },
  {
    id: "m6",
    mentorId: "u2",
    playerId: "u13",
    mentorName: "Coach Ray Davis",
    playerName: "Andre Mitchell",
    startDate: "2025-11-10",
    lastSessionDate: "2026-01-18",
    totalSessions: 8,
    status: "active",
    atRisk: true,
  },
  {
    id: "m7",
    mentorId: "u8",
    playerId: "u17",
    mentorName: "Sandra Chen",
    playerName: "Destiny Brown",
    startDate: "2025-10-25",
    lastSessionDate: "2026-02-09",
    totalSessions: 11,
    status: "active",
    atRisk: false,
  },
  {
    id: "m8",
    mentorId: "u16",
    playerId: "u9",
    mentorName: "Chris Morales",
    playerName: "Tyler Washington",
    startDate: "2025-09-28",
    lastSessionDate: "2025-12-15",
    totalSessions: 9,
    status: "paused",
    atRisk: true,
  },
];

// --- Sessions ---
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const allTopics = [
  "Confidence",
  "Team dynamics",
  "Pre-game anxiety",
  "Goal setting",
  "Leadership",
  "Handling pressure",
  "Academic balance",
  "Communication",
  "Resilience",
  "Self-talk",
  "Focus & concentration",
  "Dealing with losses",
  "Time management",
  "Motivation",
  "Injury recovery mindset",
];

export const sessions: Session[] = [
  {
    id: "s1",
    matchId: "m1",
    mentorName: "Coach Ray Davis",
    playerName: "Marcus Johnson",
    date: "2026-02-08",
    duration: 45,
    rating: 5,
    moodScore: 8,
    topics: ["Confidence", "Leadership"],
    flagged: false,
    notes: "Great session. Marcus is stepping up as team captain.",
  },
  {
    id: "s2",
    matchId: "m1",
    mentorName: "Coach Ray Davis",
    playerName: "Marcus Johnson",
    date: "2026-02-01",
    duration: 40,
    rating: 4,
    moodScore: 7,
    topics: ["Pre-game anxiety", "Self-talk"],
    flagged: false,
    notes: "Worked through visualization techniques before big game.",
  },
  {
    id: "s3",
    matchId: "m2",
    mentorName: "Mike Torres",
    playerName: "Aisha Williams",
    date: "2026-02-05",
    duration: 50,
    rating: 5,
    moodScore: 9,
    topics: ["Goal setting", "Academic balance"],
    flagged: false,
    notes: "Set academic and athletic goals for the semester.",
  },
  {
    id: "s4",
    matchId: "m3",
    mentorName: "Lisa Park",
    playerName: "DeShawn Carter",
    date: "2026-01-20",
    duration: 35,
    rating: 3,
    moodScore: 4,
    topics: ["Dealing with losses", "Resilience"],
    flagged: true,
    flagReason: "Player expressed feeling hopeless after losing streak. Recommend follow-up.",
    notes: "DeShawn is struggling. Loss streak affecting his motivation significantly.",
  },
  {
    id: "s5",
    matchId: "m4",
    mentorName: "Sandra Chen",
    playerName: "Jaylen Brooks",
    date: "2026-02-10",
    duration: 45,
    rating: 4,
    moodScore: 7,
    topics: ["Team dynamics", "Communication"],
    flagged: false,
    notes: "Jaylen learning to communicate frustrations constructively.",
  },
  {
    id: "s6",
    matchId: "m5",
    mentorName: "James Okafor",
    playerName: "Brianna Scott",
    date: "2026-02-03",
    duration: 45,
    rating: 5,
    moodScore: 8,
    topics: ["Leadership", "Confidence"],
    flagged: false,
    notes: "Brianna is ready to mentor younger players herself.",
  },
  {
    id: "s7",
    matchId: "m6",
    mentorName: "Coach Ray Davis",
    playerName: "Andre Mitchell",
    date: "2026-01-18",
    duration: 30,
    rating: 2,
    moodScore: 3,
    topics: ["Motivation", "Handling pressure"],
    flagged: true,
    flagReason: "Andre mentioned thinking about quitting the team. Family pressure at home.",
    notes: "Andre is under a lot of stress. Family situation affecting performance.",
  },
  {
    id: "s8",
    matchId: "m7",
    mentorName: "Sandra Chen",
    playerName: "Destiny Brown",
    date: "2026-02-09",
    duration: 45,
    rating: 4,
    moodScore: 7,
    topics: ["Focus & concentration", "Time management"],
    flagged: false,
    notes: "Destiny balancing basketball with AP classes well.",
  },
  {
    id: "s9",
    matchId: "m2",
    mentorName: "Mike Torres",
    playerName: "Aisha Williams",
    date: "2026-01-29",
    duration: 45,
    rating: 4,
    moodScore: 6,
    topics: ["Handling pressure", "Resilience"],
    flagged: false,
    notes: "Discussed handling pressure from scouts.",
  },
  {
    id: "s10",
    matchId: "m4",
    mentorName: "Sandra Chen",
    playerName: "Jaylen Brooks",
    date: "2026-02-03",
    duration: 40,
    rating: 3,
    moodScore: 5,
    topics: ["Self-talk", "Dealing with losses"],
    flagged: false,
    notes: "Jaylen needs to work on negative self-talk patterns.",
  },
  {
    id: "s11",
    matchId: "m1",
    mentorName: "Coach Ray Davis",
    playerName: "Marcus Johnson",
    date: "2026-01-25",
    duration: 45,
    rating: 5,
    moodScore: 8,
    topics: ["Leadership", "Team dynamics"],
    flagged: false,
    notes: "Marcus led a team huddle on his own this week.",
  },
  {
    id: "s12",
    matchId: "m5",
    mentorName: "James Okafor",
    playerName: "Brianna Scott",
    date: "2026-01-27",
    duration: 45,
    rating: 4,
    moodScore: 7,
    topics: ["Goal setting", "Motivation"],
    flagged: false,
    notes: "Set quarterly goals — Brianna wants to average 15 pts.",
  },
  {
    id: "s13",
    matchId: "m8",
    mentorName: "Chris Morales",
    playerName: "Tyler Washington",
    date: "2025-12-15",
    duration: 30,
    rating: 2,
    moodScore: 3,
    topics: ["Injury recovery mindset", "Motivation"],
    flagged: true,
    flagReason: "Tyler is disengaging from the program. Has missed 3 sessions and seems withdrawn.",
    notes: "Tyler struggling with ACL recovery. Feeling left behind by the team.",
  },
  {
    id: "s14",
    matchId: "m3",
    mentorName: "Lisa Park",
    playerName: "DeShawn Carter",
    date: "2026-01-13",
    duration: 40,
    rating: 3,
    moodScore: 5,
    topics: ["Academic balance", "Time management"],
    flagged: false,
    notes: "DeShawn's grades slipping — connected him with tutoring.",
  },
  {
    id: "s15",
    matchId: "m7",
    mentorName: "Sandra Chen",
    playerName: "Destiny Brown",
    date: "2026-02-02",
    duration: 45,
    rating: 5,
    moodScore: 9,
    topics: ["Confidence", "Goal setting"],
    flagged: false,
    notes: "Destiny had a breakout game — great confidence booster.",
  },
  {
    id: "s16",
    matchId: "m6",
    mentorName: "Coach Ray Davis",
    playerName: "Andre Mitchell",
    date: "2026-01-11",
    duration: 35,
    rating: 3,
    moodScore: 4,
    topics: ["Communication", "Resilience"],
    flagged: false,
    notes: "Working on opening up about struggles.",
  },
];

// --- Weekly Session Data (last 12 weeks) ---
export const weeklySessionData: WeeklySessionData[] = [
  { week: "Nov 18", sessions: 5, avgMood: 6.2 },
  { week: "Nov 25", sessions: 4, avgMood: 6.5 },
  { week: "Dec 2", sessions: 7, avgMood: 6.8 },
  { week: "Dec 9", sessions: 6, avgMood: 6.1 },
  { week: "Dec 16", sessions: 3, avgMood: 5.5 },
  { week: "Dec 23", sessions: 2, avgMood: 5.8 },
  { week: "Jan 6", sessions: 6, avgMood: 6.3 },
  { week: "Jan 13", sessions: 7, avgMood: 6.7 },
  { week: "Jan 20", sessions: 5, avgMood: 5.9 },
  { week: "Jan 27", sessions: 8, avgMood: 7.0 },
  { week: "Feb 3", sessions: 9, avgMood: 7.2 },
  { week: "Feb 10", sessions: 6, avgMood: 7.4 },
];

// --- Computed Stats ---
export function getTopicCounts(): TopicCount[] {
  const counts: Record<string, number> = {};
  sessions.forEach((s) => {
    s.topics.forEach((t) => {
      counts[t] = (counts[t] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);
}

export function getOverviewStats() {
  const totalPlayers = users.filter((u) => u.role === "player").length;
  const totalMentors = users.filter(
    (u) => u.role === "mentor" || u.role === "coach"
  ).length;
  const activeMatches = matches.filter((m) => m.status === "active").length;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const sessionsThisWeek = sessions.filter(
    (s) => new Date(s.date) >= oneWeekAgo
  ).length;

  const avgRating =
    sessions.reduce((sum, s) => sum + s.rating, 0) / sessions.length;

  const activePlayers = users.filter(
    (u) => u.role === "player" && u.status === "active"
  ).length;
  const retentionRate = Math.round((activePlayers / totalPlayers) * 100);

  return {
    totalPlayers,
    totalMentors,
    activeMatches,
    sessionsThisWeek,
    avgRating: Math.round(avgRating * 10) / 10,
    retentionRate,
  };
}

export function getFlaggedItems() {
  const flaggedSessions = sessions.filter((s) => s.flagged);

  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const inactivePlayers = users.filter(
    (u) =>
      u.role === "player" &&
      u.status === "active" &&
      new Date(u.lastLogin) < twoWeeksAgo
  );

  // Mentors who cancelled 2+ sessions (mock: mentors in paused matches or with low session counts)
  const mentorsWithCancellations = [
    {
      id: "u16",
      name: "Chris Morales",
      cancelledCount: 3,
      reason: "Personal scheduling conflicts",
    },
    {
      id: "u6",
      name: "Lisa Park",
      cancelledCount: 2,
      reason: "Work travel conflicts",
    },
  ];

  return { flaggedSessions, inactivePlayers, mentorsWithCancellations };
}

export const defaultSettings: ProgramSettings = {
  schoolName: "Westbrook Academy",
  programName: "Hoops & Hope Mentorship",
  sessionLengthDefault: 45,
  academicYear: "2025-2026",
  maxPlayersPerMentor: 3,
};
