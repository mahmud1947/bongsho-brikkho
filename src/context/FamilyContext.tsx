"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { initialBranches } from "@/data/initialFamilyData";
import {
  FamilyBranch,
  FamilyMember,
  FamilyNotice,
  GalleryItem,
  Language,
  TimelineEvent,
} from "@/types/family";

const USERNAME_KEY = "bongsho_current_username";
const ADMIN_PASSWORD = "Mahmud2026";
const ADMIN_STORAGE_KEY = "bongsho_is_admin";

interface FamilyContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  members: FamilyMember[];
  branches: FamilyBranch[];
  timeline: TimelineEvent[];
  gallery: GalleryItem[];
  notices: FamilyNotice[];
  currentUsername: string | null;
  currentUserProfile: FamilyMember | null;
  loginUsername: (username: string) => void;
  logoutUsername: () => void;
  selectedMember: FamilyMember | null;
  setSelectedMember: (m: FamilyMember | null) => void;
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  editingMember: FamilyMember | null;
  defaultParentForAdd: FamilyMember | null;
  openAddModal: (parent?: FamilyMember | null) => void;
  openEditModal: (member: FamilyMember) => void;
  saveMember: (member: FamilyMember) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  addTimelineEvent: (ev: TimelineEvent) => Promise<void>;
  deleteTimelineEvent: (id: string) => Promise<void>;
  addGalleryItem: (item: GalleryItem) => Promise<void>;
  deleteGalleryItem: (id: string) => Promise<void>;
  addNotice: (notice: FamilyNotice) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
  isAdmin: boolean;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  deletePrompt: {
    isOpen: boolean;
    title?: string;
    itemName?: string;
    onConfirm: () => Promise<void>;
  } | null;
  openDeletePrompt: (options: {
    title?: string;
    itemName?: string;
    onConfirm: () => Promise<void>;
  }) => void;
  closeDeletePrompt: () => void;
  exportJson: () => void;
  importJson: (file: File) => void;
  resetData: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

function cleanData<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as T;
}

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("bn");
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [notices, setNotices] = useState<FamilyNotice[]>([]);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [defaultParentForAdd, setDefaultParentForAdd] = useState<FamilyMember | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [deletePrompt, setDeletePrompt] = useState<{
    isOpen: boolean;
    title?: string;
    itemName?: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem(USERNAME_KEY);
    if (savedUser) setCurrentUsername(savedUser);

    try {
      const savedAdmin = sessionStorage.getItem(ADMIN_STORAGE_KEY);
      if (savedAdmin === "true") setIsAdmin(true);
    } catch (e) {}
  }, []);

  const loginAdmin = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      try {
        sessionStorage.setItem(ADMIN_STORAGE_KEY, "true");
      } catch (e) {}
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    try {
      sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch (e) {}
  };

  const openDeletePrompt = (options: {
    title?: string;
    itemName?: string;
    onConfirm: () => Promise<void>;
  }) => {
    setDeletePrompt({
      isOpen: true,
      title: options.title,
      itemName: options.itemName,
      onConfirm: options.onConfirm,
    });
  };

  const closeDeletePrompt = () => {
    setDeletePrompt(null);
  };

  // Real-time Firestore subscriptions across all devices
  useEffect(() => {
    const unsubMembers = onSnapshot(collection(db, "members"), (snap) => {
      const list = snap.docs.map((d) => d.data() as FamilyMember);
      list.sort((a, b) => a.generation - b.generation || a.id.localeCompare(b.id));
      setMembers(list);
    });

    const unsubTimeline = onSnapshot(collection(db, "timeline"), (snap) => {
      const list = snap.docs.map((d) => d.data() as TimelineEvent);
      setTimeline(list);
    });

    const unsubGallery = onSnapshot(collection(db, "gallery"), (snap) => {
      const list = snap.docs.map((d) => d.data() as GalleryItem);
      setGallery(list);
    });

    const unsubNotices = onSnapshot(collection(db, "notices"), (snap) => {
      const list = snap.docs.map((d) => d.data() as FamilyNotice);
      setNotices(list);
    });

    return () => {
      unsubMembers();
      unsubTimeline();
      unsubGallery();
      unsubNotices();
    };
  }, []);

  const currentUserProfile = useMemo(() => {
    if (!currentUsername) return null;
    const norm = currentUsername.trim().toLowerCase();
    return (
      members.find((m) => m.username?.toLowerCase() === norm) || null
    );
  }, [members, currentUsername]);

  const loginUsername = (username: string) => {
    const norm = username.trim().toLowerCase().replace(/^@/, "");
    if (!norm) return;
    setCurrentUsername(norm);
    localStorage.setItem(USERNAME_KEY, norm);
  };

  const logoutUsername = () => {
    setCurrentUsername(null);
    localStorage.removeItem(USERNAME_KEY);
  };

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

  const saveMember = async (memberData: FamilyMember) => {
    const cleaned = cleanData(memberData);
    await setDoc(doc(db, "members", cleaned.id), cleaned);
  };

  const deleteMember = async (id: string) => {
    await deleteDoc(doc(db, "members", id));
    setSelectedMember(null);
  };

  const addTimelineEvent = async (ev: TimelineEvent) => {
    const cleaned = cleanData(ev);
    await setDoc(doc(db, "timeline", cleaned.id), cleaned);
  };

  const deleteTimelineEvent = async (id: string) => {
    await deleteDoc(doc(db, "timeline", id));
  };

  const addGalleryItem = async (item: GalleryItem) => {
    const cleaned = cleanData(item);
    await setDoc(doc(db, "gallery", cleaned.id), cleaned);
  };

  const deleteGalleryItem = async (id: string) => {
    await deleteDoc(doc(db, "gallery", id));
  };

  const addNotice = async (notice: FamilyNotice) => {
    const cleaned = cleanData(notice);
    await setDoc(doc(db, "notices", cleaned.id), cleaned);
  };

  const deleteNotice = async (id: string) => {
    await deleteDoc(doc(db, "notices", id));
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
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data.members)) {
          for (const m of data.members) {
            await setDoc(doc(db, "members", m.id), cleanData(m));
          }
        }
        if (Array.isArray(data.timeline)) {
          for (const t of data.timeline) {
            await setDoc(doc(db, "timeline", t.id), cleanData(t));
          }
        }
        if (Array.isArray(data.gallery)) {
          for (const g of data.gallery) {
            await setDoc(doc(db, "gallery", g.id), cleanData(g));
          }
        }
        if (Array.isArray(data.notices)) {
          for (const n of data.notices) {
            await setDoc(doc(db, "notices", n.id), cleanData(n));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const resetData = async () => {
    if (window.confirm(lang === "bn" ? "সব ডেটা মুছে ফেলবেন?" : "Clear all data?")) {
      for (const colName of ["members", "timeline", "gallery", "notices"]) {
        const snap = await getDocs(collection(db, colName));
        for (const d of snap.docs) {
          await deleteDoc(doc(db, colName, d.id));
        }
      }
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
        currentUsername,
        currentUserProfile,
        loginUsername,
        logoutUsername,
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
        isAdmin,
        loginAdmin,
        logoutAdmin,
        deletePrompt,
        openDeletePrompt,
        closeDeletePrompt,
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
