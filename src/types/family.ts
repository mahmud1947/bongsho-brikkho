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
