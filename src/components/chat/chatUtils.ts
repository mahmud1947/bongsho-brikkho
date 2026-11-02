import { Language } from "@/types/family";

export const REACTION_EMOJIS = ["❤️", "👍", "😂", "🤲", "😊", "🎉", "🔥"];

export const AVATAR_PALETTES = [
  "bg-emerald-700 text-amber-200",
  "bg-amber-600 text-white",
  "bg-teal-700 text-teal-100",
  "bg-indigo-700 text-indigo-100",
  "bg-rose-700 text-rose-100",
  "bg-purple-700 text-purple-100",
  "bg-cyan-700 text-cyan-100",
  "bg-orange-700 text-orange-100",
];

export function getAvatarPalette(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

export function getInitials(name: string): string {
  if (!name) return "?";
  const cleaned = name.replace(/[@._-]/g, " ").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return Array.from(parts[0])[0]?.toUpperCase() || "?";
  const first = Array.from(parts[0])[0] || "";
  const last = Array.from(parts[parts.length - 1])[0] || "";
  return (first + last).toUpperCase();
}

export function formatDateLabel(isoDate: string, lang: Language): string {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const todayStr = now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const msgDateStr = date.toDateString();

  if (msgDateStr === todayStr) {
    return lang === "bn" ? "আজ" : "Today";
  }
  if (msgDateStr === yesterdayStr) {
    return lang === "bn" ? "গতকাল" : "Yesterday";
  }

  return date.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function formatMessageTime(isoDate: string, lang: Language): string {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(lang === "bn" ? "bn-BD" : [], {
    hour: "numeric",
    minute: "2-digit",
  });
}

