export function calculateAge(dob: string): number {
  if (!dob) return 0;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return Math.max(0, age);
}

export function getCategory(age: number): string {
  if (age <= 0) return "";
  if (age <= 14) return "Primary";
  if (age <= 20) return "Junior";
  if (age <= 35) return "Senior";
  return "Super Senior";
}

export const CONTACT_NUMBERS = [
  "9962682787",
  "9840521347",
  "9841078318",
  "9790878557",
  "7010257515",
];

export type CompetitionInfo = {
  id: "bible_test" | "ppt" | "quiz";
  label: string;
  emoji: string;
  date: string;
  day: string;
  time: string;
  short: string;
  lastDate?: string;
  intro?: string;
  rules: string[];
  categories?: { name: string; portion: string }[];
  topic?: string;
  subtopics?: string[];
  portions?: string[];
};

export const COMPETITIONS: CompetitionInfo[] = [
  {
    id: "bible_test",
    label: "Bible Written Test",
    emoji: "📖",
    date: "09-08-2026",
    day: "Sunday",
    time: "3:00 PM",
    short: "Written examination based on assigned Bible portions.",
    lastDate: "01-08-2026 (Saturday)",
    rules: [
      "The written test will be conducted only based on the specified Bible portions assigned for each category.",
      "Participants must choose the category according to their age.",
      "Duration of the written test: 80 minutes (1 hour 20 minutes).",
    ],
    categories: [
      { name: "Primary (Under 14 years)", portion: "Luke Chapters 1-5" },
      { name: "Junior (15–20 years)", portion: "Ephesians, Philippians" },
      { name: "Senior (21–35 years)", portion: "1 & 2 Peter, 1, 2 & 3 John" },
      { name: "Super Senior (36 & Above)", portion: "Job" },
      { name: "Pastors & Church Committee", portion: "1 & 2 Timothy, Titus, Philemon" },
    ],
  },
  {
    id: "ppt",
    label: "PowerPoint Presentation Competition (Tamil)",
    emoji: "🖥",
    date: "08-08-2026",
    day: "Saturday",
    time: "4:30 PM",
    short: "Topic: பவுலின் ஊழியத்தினால் ஏற்பட்ட புரட்சி அன்றும் இன்றும்",
    topic: "பவுலின் ஊழியத்தினால் ஏற்பட்ட புரட்சி அன்றும் இன்றும்",
    intro: "The Revolution Brought About by Paul's Ministry – Then and Now",
    rules: [
      "Participants must present their topic only in Tamil. However, the PowerPoint slides may be created in either Tamil or English.",
      "Maximum Presentation Time: 7 Minutes.",
    ],
  },
  {
    id: "quiz",
    label: "Bible Quiz",
    emoji: "❓",
    date: "09-08-2026",
    day: "Sunday",
    time: "4:30 PM",
    short: "Bible Portions: Ezra, Nehemiah, Esther",
    portions: ["Ezra", "Nehemiah", "Esther"],
    rules: [
      "Age Limit: 15–35 years.",
      "Each church can send only one team.",
      "Questions will be asked only from the books of Ezra, Nehemiah, and Esther.",
    ],
  },
];

