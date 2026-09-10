import type { TourPreset } from "@/lib/types";

export const TOUR_PRESETS: TourPreset[] = [
  {
    id: "my-sg-2026",
    name: "馬來西亞及新加坡英語學習文化交流團",
    destination: "馬來西亞 · 新加坡",
    startDate: "2026-05-11",
    endDate: "2026-05-16",
    blurb: "深度學習週沉浸式英語與文化探索，走訪馬大、國大及世界文化遺產。",
  },
  {
    id: "uk-steam-2026",
    name: "英國資訊科技及 STEAM 創新交流團",
    destination: "英國倫敦",
    startDate: "2026-01-17",
    endDate: "2026-01-25",
    blurb: "參與 BETT 教育科技展，走訪牛津大學、大英博物館與倫敦地標。",
  },
  {
    id: "eu-history",
    name: "德國、捷克、波蘭歷史文化交流之旅",
    destination: "波蘭 · 捷克 · 德國",
    blurb: "走進華沙、克拉科夫、布拉格與柏林，反思歷史、自由與文明。",
  },
  {
    id: "beijing-culture",
    name: "北京中華傳統文化暨國民身份認同交流團",
    destination: "北京",
    blurb: "故宮、頤和園、長城、天壇與天安門升旗，認識中華文化與家國情懷。",
  },
  {
    id: "shanghai-tech",
    name: "上海創科交流團",
    destination: "上海",
    blurb: "參觀創科企業、大學與科技館，從看見科技走到理解與應用。",
  },
  {
    id: "shandong-2025",
    name: "山東青島、煙台交流團",
    destination: "山東",
    blurb: "高中級內地交流，結合課程主題進行深度學習。",
  },
  {
    id: "custom",
    name: "自訂交流團",
    destination: "",
    blurb: "自行填寫交流團名稱、目的地與日期。",
  },
];

export const WEATHER_OPTIONS = [
  "晴朗",
  "多雲",
  "陰天",
  "小雨",
  "大雨",
  "炎熱",
  "涼快",
  "寒冷",
  "下雪",
] as const;
