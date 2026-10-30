export type Language = "bn" | "en";

export type BloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "O+"
  | "O-"
  | "AB+"
  | "AB-"
  | "Unknown";

export interface FamilyMember {
  id: string;
  username?: string;
  nameBn: string;
  nameEn: string;
  nicknameBn?: string;
  nicknameEn?: string;
  gender: "male" | "female";
  generation: number; // 1 = Root ancestor, 2, 3, 4, 5...
  branchId: string; // e.g., "root", "boro-taraf", "mejo-taraf", "choto-taraf"
  parentId?: string | null; // ID of parent in the lineage
  motherNameBn?: string;
  motherNameEn?: string;
  spouseNameBn?: string;
  spouseNameEn?: string;
  spouseProfessionBn?: string;
  spouseProfessionEn?: string;
  spouseLocationBn?: string;
  spouseLocationEn?: string;
  spousePhone?: string;
  birthYear?: string;
  deathYear?: string;
  isAlive: boolean;
  bloodGroup: BloodGroup;
  professionBn: string;
  professionEn: string;
  educationBn?: string;
  educationEn?: string;
  countryBn?: string;
  countryEn?: string;
  locationBn: string;
  locationEn: string;
  phone?: string;
  whatsapp?: string;
  socialLink?: string;
  email?: string;
  bioBn: string;
  bioEn: string;
  avatarColor?: string;
  photoUrl?: string;
  achievementsBn?: string[];
  achievementsEn?: string[];
}

export interface FamilyBranch {
  id: string;
  nameBn: string;
  nameEn: string;
  founderNameBn: string;
  founderNameEn: string;
  color: string;
  badgeClass: string;
  descriptionBn: string;
  descriptionEn: string;
}

export interface UserProfile {
  username: string;
  nameBn: string;
  nameEn: string;
  gender: "male" | "female";
  phone?: string;
  whatsapp?: string;
  socialLink?: string;
  locationBn?: string;
  locationEn?: string;
  countryBn?: string;
  countryEn?: string;
  professionBn?: string;
  professionEn?: string;
  bloodGroup?: BloodGroup;
  birthYear?: string;
  bio?: string;
  updatedAt?: string;
}

export interface TimelineEvent {
  id: string;
  yearBn: string;
  yearEn: string;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  category: "origin" | "milestone" | "migration" | "reunion";
}

export interface GalleryItem {
  id: string;
  titleBn: string;
  titleEn: string;
  yearBn: string;
  yearEn: string;
  category: "ancestors" | "reunion" | "homestead" | "documents";
  descriptionBn: string;
  descriptionEn: string;
  imageUrl: string;
  locationBn: string;
  locationEn: string;
}

export interface FamilyNotice {
  id: string;
  titleBn: string;
  titleEn: string;
  dateBn: string;
  dateEn: string;
  category: "reunion" | "wedding" | "prayer" | "urgent" | "achievement";
  contentBn: string;
  contentEn: string;
  postedByBn: string;
  postedByEn: string;
  isPinned?: boolean;
}

export function formatSocialUrl(raw?: string): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  // 1. Full URL with protocol
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // 2. Starts with @ (Instagram / social handle)
  if (trimmed.startsWith("@")) {
    const handle = trimmed.replace(/^@+/, "").trim();
    return `https://instagram.com/${handle}`;
  }

  // 3. Starts with www.
  if (/^www\./i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  // 4. Starts with a known social domain (fb.com, facebook.com, instagram.com, etc.)
  if (
    /^(fb|facebook|instagram|instagr|twitter|x|tiktok|linkedin|youtube|github|wa|telegram|t)\.(com|am|me|co)\b/i.test(
      trimmed
    )
  ) {
    return `https://${trimmed}`;
  }

  // 5. Contains a known top-level domain with a path (e.g. site.com/user, profile.me/id)
  if (
    /^[a-z0-9-]+(\.[a-z0-9-]+)*\.(com|org|net|me|io|co|info|app|link|xyz|bd|uk|us)(\/|$)/i.test(
      trimmed
    )
  ) {
    return `https://${trimmed}`;
  }

  // 6. Otherwise treated as an Instagram username/ID (e.g., "mahmud2026", "shofik_uddin", "user.name")
  return `https://instagram.com/${trimmed}`;
}

export function getCountryCode(country?: string): string {
  if (!country) return "bd";
  const c = country.trim().toLowerCase();
  if (c.includes("বাংলাদেশ") || c.includes("bangladesh") || c === "bd") return "bd";
  if (
    c.includes("যুক্তরাজ্য") ||
    c.includes("united kingdom") ||
    c.includes("uk") ||
    c.includes("ইউকে") ||
    c.includes("britain") ||
    c.includes("england") ||
    c === "gb"
  )
    return "gb";
  if (
    c.includes("যুক্তরাষ্ট্র") ||
    c.includes("united states") ||
    c.includes("usa") ||
    c.includes("ইউএসএ") ||
    c.includes("america") ||
    c === "us"
  )
    return "us";
  if (c.includes("সৌদি") || c.includes("saudi") || c.includes("ksa") || c === "sa") return "sa";
  if (
    c.includes("আরব আমিরাত") ||
    c.includes("uae") ||
    c.includes("ইউএই") ||
    c.includes("dubai") ||
    c.includes("emirates") ||
    c === "ae"
  )
    return "ae";
  if (c.includes("কাতার") || c.includes("qatar") || c === "qa") return "qa";
  if (c.includes("কুয়েত") || c.includes("kuwait") || c === "kw") return "kw";
  if (c.includes("ওমান") || c.includes("oman") || c === "om") return "om";
  if (c.includes("বাহরাইন") || c.includes("bahrain") || c === "bh") return "bh";
  if (c.includes("মালয়েশিয়া") || c.includes("malaysia") || c === "my") return "my";
  if (c.includes("সিঙ্গাপুর") || c.includes("singapore") || c === "sg") return "sg";
  if (c.includes("কানাডা") || c.includes("canada") || c === "ca") return "ca";
  if (c.includes("অস্ট্রেলিয়া") || c.includes("australia") || c === "au") return "au";
  if (c.includes("ইতালি") || c.includes("italy") || c === "it") return "it";
  if (c.includes("জার্মানি") || c.includes("germany") || c === "de") return "de";
  if (c.includes("ফ্রান্স") || c.includes("france") || c === "fr") return "fr";
  if (c.includes("ভারত") || c.includes("india") || c === "in") return "in";
  if (c.includes("পাকিস্তান") || c.includes("pakistan") || c === "pk") return "pk";
  return "bd";
}

export function getCountryFlag(country?: string): string {
  if (!country) return "🇧🇩";
  const c = country.trim().toLowerCase();
  if (c.includes("বাংলাদেশ") || c.includes("bangladesh") || c === "bd") return "🇧🇩";
  if (
    c.includes("যুক্তরাজ্য") ||
    c.includes("united kingdom") ||
    c.includes("uk") ||
    c.includes("ইউকে") ||
    c.includes("britain") ||
    c.includes("england")
  )
    return "🇬🇧";
  if (
    c.includes("যুক্তরাষ্ট্র") ||
    c.includes("united states") ||
    c.includes("usa") ||
    c.includes("ইউএসএ") ||
    c.includes("america")
  )
    return "🇺🇸";
  if (c.includes("সৌদি") || c.includes("saudi") || c.includes("ksa")) return "🇸🇦";
  if (
    c.includes("আরব আমিরাত") ||
    c.includes("uae") ||
    c.includes("ইউএই") ||
    c.includes("dubai") ||
    c.includes("emirates")
  )
    return "🇦🇪";
  if (c.includes("কাতার") || c.includes("qatar")) return "🇶🇦";
  if (c.includes("কুয়েত") || c.includes("kuwait")) return "🇰🇼";
  if (c.includes("ওমান") || c.includes("oman")) return "🇴🇲";
  if (c.includes("বাহরাইন") || c.includes("bahrain")) return "🇧🇭";
  if (c.includes("মালয়েশিয়া") || c.includes("malaysia")) return "🇲🇾";
  if (c.includes("সিঙ্গাপুর") || c.includes("singapore")) return "🇸🇬";
  if (c.includes("কানাডা") || c.includes("canada")) return "🇨🇦";
  if (c.includes("অস্ট্রেলিয়া") || c.includes("australia")) return "🇦🇺";
  if (c.includes("ইতালি") || c.includes("italy")) return "🇮🇹";
  if (c.includes("জার্মানি") || c.includes("germany")) return "🇩🇪";
  if (c.includes("ফ্রান্স") || c.includes("france")) return "🇫🇷";
  if (c.includes("ভারত") || c.includes("india")) return "🇮🇳";
  if (c.includes("পাকিস্তান") || c.includes("pakistan")) return "🇵🇰";
  return "🇧🇩";
}
