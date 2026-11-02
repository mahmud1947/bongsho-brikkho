import { BloodGroup } from "@/types/family";

export const MEMBER_BLOOD_GROUPS: BloodGroup[] = [
  "A+",
  "A-",
  "B+",
  "B-",
  "O+",
  "O-",
  "AB+",
  "AB-",
  "Unknown",
];

export const MEMBER_COUNTRY_OPTIONS = [
  { bn: "বাংলাদেশ", en: "Bangladesh" },
  { bn: "যুক্তরাজ্য (ইউকে)", en: "United Kingdom" },
  { bn: "যুক্তরাষ্ট্র (ইউএসএ)", en: "United States" },
  { bn: "সৌদি আরব", en: "Saudi Arabia" },
  { bn: "সংযুক্ত আরব আমিরাত", en: "UAE" },
  { bn: "কাতার", en: "Qatar" },
  { bn: "কুয়েত", en: "Kuwait" },
  { bn: "ওমান", en: "Oman" },
  { bn: "বাহরাইন", en: "Bahrain" },
  { bn: "মালয়েশিয়া", en: "Malaysia" },
  { bn: "সিঙ্গাপুর", en: "Singapore" },
  { bn: "কানাডা", en: "Canada" },
  { bn: "অস্ট্রেলিয়া", en: "Australia" },
  { bn: "ইতালি", en: "Italy" },
  { bn: "অন্যান্য (লিখুন)", en: "Other" },
];

export const MEMBER_PROFESSION_OPTIONS = [
  { bn: "গৃহিণী", en: "Housewife" },
  { bn: "কৃষক", en: "Farmer" },
  { bn: "অবসরপ্রাপ্ত", en: "Retired" },
  { bn: "ব্যবসায়ী", en: "Businessman" },
  { bn: "শিক্ষার্থী", en: "Student" },
  { bn: "চাকরিজীবী", en: "Service" },
  { bn: "শিক্ষক", en: "Teacher" },
  { bn: "প্রবাসী", en: "Expatriate" },
  { bn: "চিকিৎসক", en: "Doctor" },
  { bn: "প্রকৌশলী", en: "Engineer" },
  { bn: "জানা নেই", en: "Unknown" },
];

export const MEMBER_YEARS = Array.from({ length: 2026 - 1850 + 1 }, (_, i) => String(2026 - i));

export const MEMBER_MONTHS = [
  { val: "01", bn: "০১ (জানুয়ারি)", en: "01 (Jan)", days: 31 },
  { val: "02", bn: "০২ (ফেব্রুয়ারি)", en: "02 (Feb)", days: 29 },
  { val: "03", bn: "০৩ (মার্চ)", en: "03 (Mar)", days: 31 },
  { val: "04", bn: "০৪ (এপ্রিল)", en: "04 (Apr)", days: 30 },
  { val: "05", bn: "০৫ (মে)", en: "05 (May)", days: 31 },
  { val: "06", bn: "০৬ (জুন)", en: "06 (Jun)", days: 30 },
  { val: "07", bn: "০৭ (জুলাই)", en: "07 (Jul)", days: 31 },
  { val: "08", bn: "০৮ (আগস্ট)", en: "08 (Aug)", days: 31 },
  { val: "09", bn: "০৯ (সেপ্টেম্বর)", en: "09 (Sep)", days: 30 },
  { val: "10", bn: "১০ (অক্টোবর)", en: "10 (Oct)", days: 31 },
  { val: "11", bn: "১১ (নভেম্বর)", en: "11 (Nov)", days: 30 },
  { val: "12", bn: "১২ (ডিসেম্বর)", en: "12 (Dec)", days: 31 },
];

