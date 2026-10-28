"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  initialBranches,
  initialGallery,
  initialMembers,
  initialNotices,
  initialTimeline,
} from "@/data/initialFamilyData";
import {
  FamilyBranch,
  FamilyMember,
  FamilyNotice,
  GalleryItem,
  Language,
  TimelineEvent,
} from "@/types/family";

const STORAGE_KEYS = {
  MEMBERS: "bongsho_brikkho_real_members",
  TIMELINE: "bongsho_brikkho_real_timeline",
  GALLERY: "bongsho_brikkho_real_gallery",
  NOTICES: "bongsho_brikkho_real_notices",
};

interface FamilyContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  members: FamilyMember[];
  branches: FamilyBranch[];
  timeline: TimelineEvent[];
  gallery: GalleryItem[];
  notices: FamilyNotice[];
  selectedMember: FamilyMember | null;
  setSelectedMember: (m: FamilyMember | null) => void;
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  editingMember: FamilyMember | null;
  defaultParentForAdd: FamilyMember | null;
  openAddModal: (parent?: FamilyMember | null) => void;
  openEditModal: (member: FamilyMember) => void;
  saveMember: (member: FamilyMember) => void;
  deleteMember: (id: string) => void;
  addTimelineEvent: (ev: TimelineEvent) => void;
  deleteTimelineEvent: (id: string) => void;
  addGalleryItem: (item: GalleryItem) => void;
  deleteGalleryItem: (id: string) => void;
  addNotice: (notice: FamilyNotice) => void;
  deleteNotice: (id: string) => void;
  exportJson: () => void;
  importJson: (file: File) => void;
  resetData: () => void;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("bn");
  const [members, setMembers] = useState<FamilyMember[]>(initialMembers);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(initialTimeline);
  const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery);
  const [notices, setNotices] = useState<FamilyNotice[]>(initialNotices);

  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [defaultParentForAdd, setDefaultParentForAdd] = useState<FamilyMember | null>(null);

  useEffect(() => {
    try {
      const m = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      const t = localStorage.getItem(STORAGE_KEYS.TIMELINE);
      const g = localStorage.getItem(STORAGE_KEYS.GALLERY);
      const n = localStorage.getItem(STORAGE_KEYS.NOTICES);

      if (m || t || g || n) {
        if (m) setMembers(JSON.parse(m));
        if (t) setTimeline(JSON.parse(t));
        if (g) setGallery(JSON.parse(g));
        if (n) setNotices(JSON.parse(n));
      } else {
        // Fallback: load from public/family-data.json on GitHub Pages
        fetch("./family-data.json")
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (!data) return;
            if (Array.isArray(data.members) && data.members.length > 0) {
              setMembers(data.members);
            }
            if (Array.isArray(data.timeline) && data.timeline.length > 0) {
              setTimeline(data.timeline);
            }
            if (Array.isArray(data.gallery) && data.gallery.length > 0) {
              setGallery(data.gallery);
            }
            if (Array.isArray(data.notices) && data.notices.length > 0) {
              setNotices(data.notices);
            }
          })
          .catch(() => {});
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const openAddModal = (parent: FamilyMember | null = null) => {
    setEditingMember(null);
    setDefaultParentForAdd(parent);
    setIsFormOpen(true);
  };

  const openEditModal = (member: FamilyMember) => {
    setEditingMember(member);
    setDefaultParentForAdd(null);
    setIsFormOpen(true);
  };

  const saveMember = (memberData: FamilyMember) => {
    setMembers((prev) => {
      const exists = prev.some((m) => m.id === memberData.id);
      const updated = exists
        ? prev.map((m) => (m.id === memberData.id ? memberData : m))
        : [...prev, memberData];
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteMember = (id: string) => {
    setMembers((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updated));
      return updated;
    });
    setSelectedMember(null);
  };

  const addTimelineEvent = (ev: TimelineEvent) => {
    setTimeline((prev) => {
      const updated = [...prev, ev];
      localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteTimelineEvent = (id: string) => {
    setTimeline((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(updated));
      return updated;
    });
  };

  const addGalleryItem = (item: GalleryItem) => {
    setGallery((prev) => {
      const updated = [item, ...prev];
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteGalleryItem = (id: string) => {
    setGallery((prev) => {
      const updated = prev.filter((g) => g.id !== id);
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(updated));
      return updated;
    });
  };

  const addNotice = (notice: FamilyNotice) => {
    setNotices((prev) => {
      const updated = [notice, ...prev];
      localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteNotice = (id: string) => {
    setNotices((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(updated));
      return updated;
    });
  };

  const exportJson = () => {
    const blob = new Blob(
      [JSON.stringify({ members, timeline, gallery, notices }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "family-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data.members)) {
          setMembers(data.members);
          localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(data.members));
        }
        if (Array.isArray(data.timeline)) {
          setTimeline(data.timeline);
          localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(data.timeline));
        }
        if (Array.isArray(data.gallery)) {
          setGallery(data.gallery);
          localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(data.gallery));
        }
        if (Array.isArray(data.notices)) {
          setNotices(data.notices);
          localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(data.notices));
        }
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const resetData = () => {
    if (window.confirm(lang === "bn" ? "সব ডেটা মুছে ফেলবেন?" : "Clear all data?")) {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
      setMembers([]);
      setTimeline([]);
      setGallery([]);
      setNotices([]);
    }
  };

  return (
    <FamilyContext.Provider
      value={{
        lang,
        setLang,
        members,
        branches: initialBranches,
        timeline,
        gallery,
        notices,
        selectedMember,
        setSelectedMember,
        isFormOpen,
        setIsFormOpen,
        editingMember,
        defaultParentForAdd,
        openAddModal,
        openEditModal,
        saveMember,
        deleteMember,
        addTimelineEvent,
        deleteTimelineEvent,
        addGalleryItem,
        deleteGalleryItem,
        addNotice,
        deleteNotice,
        exportJson,
        importJson,
        resetData,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error("useFamily must be used inside FamilyProvider");
  return ctx;
}
