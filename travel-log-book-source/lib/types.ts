export type Student = {
  id: string;
  classCode: string;
  classNo: number;
  chineseName: string;
  englishName: string;
  demo?: boolean;
};

export type Roster = {
  year: string;
  source: "demo" | "imported";
  note?: string;
  generatedAt?: string;
  importedAt?: string;
  fileName?: string;
  classes: string[];
  students: Student[];
};

export type DayPhoto = string | null;

export type DayEntry = {
  dayNumber: number;
  date: string;
  title: string;
  weather: string;
  itinerary: string;
  feeling: string;
  photos: [DayPhoto, DayPhoto, DayPhoto];
};

export type Journal = {
  id: string;
  classCode: string;
  studentId: string;
  chineseName: string;
  englishName: string;
  tourId: string;
  tourName: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: number;
  expectation: string;
  dayEntries: DayEntry[];
  overallFeeling: string;
  knowledgeLearned: string;
  skillsLearned: string;
  mostMemorable: string;
  gratitude: string;
  honorPledge: boolean;
  submittedAt?: string;
  updatedAt: string;
};

export type JournalSubmissionFile = {
  kind: "mkpc-journal-submission";
  version: 1;
  submittedAt: string;
  honorPledge: true;
  journal: Journal;
};

export type JournalSummary = {
  id: string;
  classCode: string;
  chineseName: string;
  englishName: string;
  tourName: string;
  startDate: string;
  endDate: string;
  days: number;
  updatedAt: string;
  completeness: number;
};

export type TourPreset = {
  id: string;
  name: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  blurb: string;
};
