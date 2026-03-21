export interface Mentor {
  id: string;
  name: string;
  sport: string;
  school: string;
  level: string;
  status: "current" | "former";
  year?: string; // e.g. "Junior", "Senior", "Graduated 2023"
  focusAreas: string[];
  quote: string;
  initials: string;
  avatarColor: string;
}

export const mentors: Mentor[] = [
  {
    id: "marcus-t",
    name: "Marcus T.",
    sport: "Basketball",
    school: "Oregon State",
    level: "D1",
    status: "current",
    year: "Junior",
    focusAreas: ["Confidence", "Family pressure", "Identity beyond sport"],
    quote:
      "I carried my family's expectations for years before a mentor helped me separate my worth from my stats. I want to be that person for someone else.",
    initials: "MT",
    avatarColor: "bg-navy",
  },
  {
    id: "sofia-r",
    name: "Sofia R.",
    sport: "Soccer",
    school: "University of Colorado",
    level: "D1",
    status: "former",
    year: "Graduated 2023",
    focusAreas: ["Injury recovery", "Comeback mindset", "Self-compassion"],
    quote:
      "A torn ACL sophomore year broke me mentally before it fixed me. I want to be there for athletes going through that darkness.",
    initials: "SR",
    avatarColor: "bg-orange-500",
  },
  {
    id: "james-w",
    name: "James W.",
    sport: "Football",
    school: "Bowdoin College",
    level: "D3",
    status: "current",
    year: "Senior",
    focusAreas: ["Vulnerability", "Team culture", "Pressure to be tough"],
    quote:
      "Football culture says you can't show weakness. I'm here to flip that — your mental game is your biggest competitive edge.",
    initials: "JW",
    avatarColor: "bg-sage-500",
  },
  {
    id: "priya-m",
    name: "Priya M.",
    sport: "Swimming",
    school: "Georgia Tech",
    level: "D1",
    status: "current",
    year: "Sophomore",
    focusAreas: ["Post-practice spiraling", "Perfectionism", "Consistency"],
    quote:
      "I used to spiral after bad practices for days. My mentor helped me see that one bad session isn't your whole career.",
    initials: "PM",
    avatarColor: "bg-navy-400",
  },
  {
    id: "deandre-h",
    name: "DeAndre H.",
    sport: "Track & Field",
    school: "Florida State",
    level: "D1",
    status: "former",
    year: "Graduated 2024",
    focusAreas: ["Individual sport pressure", "Isolation", "Goal setting"],
    quote:
      "Running is 90% mental. Nobody prepared me for the loneliness of individual sport pressure — I had to figure it out alone. You don't have to.",
    initials: "DH",
    avatarColor: "bg-orange-600",
  },
  {
    id: "caitlin-b",
    name: "Caitlin B.",
    sport: "Volleyball",
    school: "Williams College",
    level: "D3",
    status: "current",
    year: "Senior",
    focusAreas: ["Bench time", "Motivation", "Team dynamics"],
    quote:
      "I thought D3 meant the mental pressure would be less. It wasn't. The game is the game at every level.",
    initials: "CB",
    avatarColor: "bg-sage-600",
  },
  {
    id: "tyler-n",
    name: "Tyler N.",
    sport: "Basketball",
    school: "Lewis-Clark State",
    level: "NAIA",
    status: "current",
    year: "Junior",
    focusAreas: ["Rejection", "Resilience", "Finding your path"],
    quote:
      "Getting cut from a D1 program and dropping down was the hardest thing I've faced athletically. It also made me who I am.",
    initials: "TN",
    avatarColor: "bg-navy-600",
  },
  {
    id: "amara-j",
    name: "Amara J.",
    sport: "Tennis",
    school: "USC",
    level: "D1",
    status: "former",
    year: "Graduated 2022",
    focusAreas: ["In-match mental reset", "Pressure handling", "Solo performance"],
    quote:
      "In tennis you're alone out there mid-match. No timeout, no teammates. Learning to manage that changed my whole career.",
    initials: "AJ",
    avatarColor: "bg-orange-400",
  },
];

export const allSports = [...new Set(mentors.map((m) => m.sport))];
export const allLevels = [...new Set(mentors.map((m) => m.level))];
