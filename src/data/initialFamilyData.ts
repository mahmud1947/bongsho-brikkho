import {
  FamilyBranch,
  FamilyMember,
  FamilyNotice,
  GalleryItem,
  TimelineEvent,
} from "@/types/family";

export const initialBranches: FamilyBranch[] = [
  {
    id: "root",
    nameBn: "মূল",
    nameEn: "Root",
    founderNameBn: "",
    founderNameEn: "",
    color: "#065f46",
    badgeClass: "bg-emerald-900 text-amber-200",
    descriptionBn: "",
    descriptionEn: "",
  },
  {
    id: "boro-taraf",
    nameBn: "বড়",
    nameEn: "Eldest",
    founderNameBn: "",
    founderNameEn: "",
    color: "#047857",
    badgeClass: "bg-emerald-100 text-emerald-900",
    descriptionBn: "",
    descriptionEn: "",
  },
  {
    id: "mejo-taraf",
    nameBn: "মেজো",
    nameEn: "Middle",
    founderNameBn: "",
    founderNameEn: "",
    color: "#b45309",
    badgeClass: "bg-amber-100 text-amber-900",
    descriptionBn: "",
    descriptionEn: "",
  },
  {
    id: "choto-taraf",
    nameBn: "ছোট",
    nameEn: "Youngest",
    founderNameBn: "",
    founderNameEn: "",
    color: "#1d4ed8",
    badgeClass: "bg-blue-100 text-blue-900",
    descriptionBn: "",
    descriptionEn: "",
  },
];

export const initialMembers: FamilyMember[] = [];
export const initialTimeline: TimelineEvent[] = [];
export const initialGallery: GalleryItem[] = [];
export const initialNotices: FamilyNotice[] = [];
