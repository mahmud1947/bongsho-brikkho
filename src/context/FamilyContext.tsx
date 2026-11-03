"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  playNotificationChime,
  vibrateDevice,
  showBrowserNotification,
} from "@/lib/notificationUtils";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { initialBranches } from "@/data/initialFamilyData";
import {
  FamilyBranch,
  FamilyChatMessage,
  FamilyMember,
  FamilyNotice,
  GalleryItem,
  GroupSettings,
  Language,
  TimelineEvent,
  UserProfile,
  UserPresence,
} from "@/types/family";
import {
  UpcomingBirthdayItem,
  calculateBirthdays,
  checkAndTriggerBirthdayNotifications,
} from "@/lib/birthdayUtils";
import { lookupAccountByIdentifier, checkIfAccountExists } from "@/lib/authService";
import { usePresenceTracker } from "@/hooks/usePresenceTracker";

export type { UpcomingBirthdayItem };

const USERNAME_KEY = "bongsho_current_username";
const ADMIN_PASSWORD = "Mahmud2026";
const ADMIN_STORAGE_KEY = "bongsho_is_admin";
const LANG_STORAGE_KEY = "bongsho_preferred_language";

const defaultGroupSettings: GroupSettings = {
  groupNameBn: "Family Chat",
  groupNameEn: "Family Chat",
  descriptionBn: "পরিবারের সবার সাথে কথা বলার ও যুক্ত থাকার স্থান।",
  descriptionEn: "Official communication space for all family members.",
  logoUrl: "",
  updatedAt: new Date().toISOString(),
  updatedBy: "system",
};

interface FamilyContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  members: FamilyMember[];
  branches: FamilyBranch[];
  timeline: TimelineEvent[];
  gallery: GalleryItem[];
  notices: FamilyNotice[];
  chatMessages: FamilyChatMessage[];
  unseenChatCount: number;
  markChatAsRead: () => void;
  currentUsername: string | null;
  currentUserProfile: UserProfile | null;
  loginUsername: (username: string) => void;
  loginByIdentifier: (
    identifier: string
  ) => Promise<{ success: boolean; error?: string; username?: string }>;
  checkAccountExists: (
    username: string,
    phone?: string
  ) => Promise<{ usernameExists: boolean; phoneExists: boolean }>;
  logoutUsername: () => void;
  saveUserProfile: (profile: UserProfile) => Promise<void>;
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
  sendChatMessage: (message: FamilyChatMessage) => Promise<void>;
  deleteChatMessage: (id: string) => Promise<void>;
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

  // Real-time online members & presence
  onlineCount: number;
  onlineUsers: UserPresence[];

  // Group settings & management
  groupSettings: GroupSettings;
  updateGroupSettings: (newSettings: Partial<GroupSettings>) => Promise<void>;

  // Real-time typing status
  typingUsers: Record<string, { displayName: string; timestamp: number }>;
  setTypingStatus: (isTyping: boolean) => Promise<void>;

  // Birthday reminder & celebration
  todayBirthdays: Array<{ member: FamilyMember; age?: number }>;
  upcomingBirthdays: UpcomingBirthdayItem[];
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

function cleanData<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as T;
}

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [notices, setNotices] = useState<FamilyNotice[]>([]);
  const [chatMessages, setChatMessages] = useState<FamilyChatMessage[]>([]);
  const [unseenChatCount, setUnseenChatCount] = useState<number>(0);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const currentUsernameRef = useRef<string | null>(null);

  // Group Settings state
  const [groupSettings, setGroupSettings] = useState<GroupSettings>(defaultGroupSettings);

  // Typing status state
  const [typingUsers, setTypingUsers] = useState<Record<string, { displayName: string; timestamp: number }>>({});

  // Presence hook
  const { onlineUsers, onlineCount } = usePresenceTracker(currentUsername, currentUserProfile);

  useEffect(() => {
    currentUsernameRef.current = currentUsername;
  }, [currentUsername]);

  const markChatAsRead = useCallback(() => {
    if (typeof window === "undefined") return;
    const now = new Date().toISOString();
    const user = currentUsernameRef.current || localStorage.getItem(USERNAME_KEY) || "guest";
    localStorage.setItem(`bongsho_chat_last_read_${user}`, now);
    setUnseenChatCount(0);
  }, []);

  const calculateUnseen = useCallback((messagesList: FamilyChatMessage[]) => {
    if (typeof window === "undefined") return;
    const user = currentUsernameRef.current || localStorage.getItem(USERNAME_KEY) || "guest";
    const lastRead = localStorage.getItem(`bongsho_chat_last_read_${user}`);

    // If currently on /chat page, clear unseen count immediately
    if (window.location.pathname.includes("/chat")) {
      const now = new Date().toISOString();
      localStorage.setItem(`bongsho_chat_last_read_${user}`, now);
      setUnseenChatCount(0);
      return;
    }

    if (!lastRead) {
      const unseen = messagesList.filter((m) => m.authorUsername !== user);
      setUnseenChatCount(unseen.length);
      return;
    }

    const unseen = messagesList.filter((m) => {
      if (m.authorUsername === user) return false;
      return m.createdAt > lastRead;
    });
    setUnseenChatCount(unseen.length);
  }, []);

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

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
    } catch (e) {}
  };

  useEffect(() => {
    const savedUser = localStorage.getItem(USERNAME_KEY);
    if (savedUser) setCurrentUsername(savedUser);

    try {
      const savedLang = localStorage.getItem(LANG_STORAGE_KEY) as Language | null;
      if (savedLang === "bn" || savedLang === "en") {
        setLangState(savedLang);
      } else {
        setLangState("en");
      }
    } catch (e) {}

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
      const rawList = snap.docs.map((d) => {
        const item = d.data() as FamilyMember;
        const isEvidentlyFemale =
          /বেগম|খাতুন|বিবি|বানু|আক্তার/i.test(item.nameBn || "") ||
          /begum|khatun|bibi|banu|akter|aktar/i.test(item.nameEn || "") ||
          item.professionBn === "গৃহিণী" ||
          item.professionEn === "Housewife";

        if (item.gender === "male" && isEvidentlyFemale) {
          item.gender = "female";
          try {
            setDoc(doc(db, "members", item.id), { gender: "female" }, { merge: true }).catch(() => {});
          } catch (e) {}
        }
        return item;
      });
      const list = rawList.filter((m) => !m.id.startsWith("user-"));
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

    let isInitialChatSnapshot = true;
    const chatQuery = query(
      collection(db, "chat_messages"),
      orderBy("createdAt", "desc"),
      limit(150)
    );
    const unsubChatMessages = onSnapshot(chatQuery, (snap) => {
      const list = snap.docs.map((d) => d.data() as FamilyChatMessage);
      list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      setChatMessages(list);

      const user = currentUsernameRef.current || localStorage.getItem(USERNAME_KEY) || "";

      // Message Delivery & Read receipts update
      if (user) {
        const isOnChatPage = typeof window !== "undefined" && window.location.pathname.includes("/chat");
        list.forEach((m) => {
          if (m.authorUsername !== user) {
            let needsUpdate = false;
            const patch: Partial<FamilyChatMessage> = {};

            // Mark delivered if not recorded yet
            if (!m.deliveredTo || !m.deliveredTo[user]) {
              patch.deliveredTo = { ...(m.deliveredTo || {}), [user]: new Date().toISOString() };
              patch.status = "delivered";
              needsUpdate = true;
            }

            // Mark read if user is currently looking at chat
            if (isOnChatPage && (!m.readBy || !m.readBy[user])) {
              patch.readBy = { ...(m.readBy || {}), [user]: new Date().toISOString() };
              patch.status = "read";
              needsUpdate = true;
            }

            if (needsUpdate) {
              setDoc(doc(db, "chat_messages", m.id), cleanData(patch), { merge: true }).catch(() => {});
            }
          }
        });
      }

      // Skip sound and notification on initial load
      if (isInitialChatSnapshot) {
        isInitialChatSnapshot = false;
        return;
      }

      // Check for incoming new messages
      const addedChanges = snap.docChanges().filter((change) => change.type === "added");
      if (addedChanges.length > 0) {
        const newOthersMessages = addedChanges
          .map((c) => c.doc.data() as FamilyChatMessage)
          .filter((m) => m.authorUsername !== user)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

        if (newOthersMessages.length > 0) {
          const newest = newOthersMessages[0];
          playNotificationChime();
          vibrateDevice([140, 70, 140]);

          const senderName =
            newest.authorNameBn ||
            newest.authorNameEn ||
            `@${newest.authorUsername}`;
          const bodyText =
            newest.text ||
            (newest.audioUrl ? "🎤 ভয়েস মেসেজ" : newest.imageUrl ? "📷 ছবি পাঠিয়েছেন" : "নতুন বার্তা");

          const isMentioned = Boolean(user && newest.mentions && newest.mentions.includes(user));

          if (isMentioned) {
            showBrowserNotification(`🔔 ${senderName} আপনাকে মেনশন করেছেন!`, {
              body: bodyText,
              tag: `bongsho-mention-${newest.id}`,
            });
          } else {
            showBrowserNotification(`Family Chat: ${senderName}`, {
              body: bodyText,
              tag: `bongsho-chat-${newest.id}`,
            });
          }
        }
      }
    });

    // Subscribe to Group Settings
    const unsubGroup = onSnapshot(doc(db, "group_settings", "general"), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as GroupSettings;
        const nameBn = data.groupNameBn && !/bongsho|বংশবৃক্ষ/i.test(data.groupNameBn) ? data.groupNameBn : "Family Chat";
        const nameEn = data.groupNameEn && !/bongsho|বংশবৃক্ষ/i.test(data.groupNameEn) ? data.groupNameEn : "Family Chat";
        setGroupSettings({
          ...defaultGroupSettings,
          ...data,
          groupNameBn: nameBn,
          groupNameEn: nameEn,
        });
      }
    });

    // Subscribe to Typing Status
    const unsubTyping = onSnapshot(doc(db, "chat_typing", "active"), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as { users?: Record<string, { displayName: string; timestamp: number }> };
        const rawUsers = data.users || {};
        const now = Date.now();
        const activeTyping: Record<string, { displayName: string; timestamp: number }> = {};
        const me = currentUsernameRef.current;

        Object.entries(rawUsers).forEach(([uname, val]) => {
          if (uname !== me && val && now - val.timestamp < 4500) {
            activeTyping[uname] = val;
          }
        });
        setTypingUsers((prev) => {
          const prevKeys = Object.keys(prev);
          const newKeys = Object.keys(activeTyping);
          if (prevKeys.length === 0 && newKeys.length === 0) return prev;
          if (
            prevKeys.length === newKeys.length &&
            newKeys.every((k) => prev[k] && prev[k].displayName === activeTyping[k].displayName)
          ) {
            return prev;
          }
          return activeTyping;
        });
      }
    });

    return () => {
      unsubMembers();
      unsubTimeline();
      unsubGallery();
      unsubNotices();
      unsubChatMessages();
      unsubGroup();
      unsubTyping();
    };
  }, []);

  // Sync personal profile when username changes (completely separate from tree members)
  useEffect(() => {
    if (!currentUsername) {
      setCurrentUserProfile(null);
      return;
    }

    try {
      const cached = localStorage.getItem(`bongsho_profile_${currentUsername}`);
      if (cached) {
        setCurrentUserProfile(JSON.parse(cached));
      }
    } catch (e) {}

    const unsub = onSnapshot(doc(db, "user_profiles", currentUsername), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setCurrentUserProfile(data);
        try {
          localStorage.setItem(`bongsho_profile_${currentUsername}`, JSON.stringify(data));
        } catch (e) {}
      }
    });

    return () => unsub();
  }, [currentUsername]);

  // Group settings update handler
  const updateGroupSettings = async (newSettings: Partial<GroupSettings>) => {
    const updated: GroupSettings = {
      ...groupSettings,
      ...newSettings,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUsername || "admin",
    };
    setGroupSettings(updated);
    await setDoc(doc(db, "group_settings", "general"), cleanData(updated), { merge: true });
  };

  // Typing status updater
  const setTypingStatus = useCallback(
    async (isTyping: boolean) => {
      const user = currentUsernameRef.current;
      if (!user) return;
      try {
        const name =
          currentUserProfile?.nameBn || currentUserProfile?.nameEn || `@${user}`;
        await setDoc(
          doc(db, "chat_typing", "active"),
          {
            users: {
              [user]: {
                displayName: name,
                timestamp: isTyping ? Date.now() : 0,
              },
            },
          },
          { merge: true }
        );
      } catch (e) {
        // ignore
      }
    },
    [currentUserProfile]
  );

  // Recalculate unseen messages when chat messages or current user changes
  useEffect(() => {
    calculateUnseen(chatMessages);
  }, [chatMessages, currentUsername, calculateUnseen]);

  // If window regains focus while on /chat, auto-mark as read
  useEffect(() => {
    const handleFocus = () => {
      if (typeof window !== "undefined" && window.location.pathname.includes("/chat")) {
        markChatAsRead();
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [markChatAsRead]);

  // Birthday Calculation Hook
  const { todayBirthdays, upcomingBirthdays } = useMemo(() => {
    return calculateBirthdays(members);
  }, [members]);

  // Birthday Notification Check once per day
  useEffect(() => {
    checkAndTriggerBirthdayNotifications(todayBirthdays, upcomingBirthdays, lang);
  }, [todayBirthdays, upcomingBirthdays, lang]);

  const saveUserProfile = async (profile: UserProfile) => {
    setCurrentUserProfile(profile);
    try {
      localStorage.setItem(`bongsho_profile_${profile.username}`, JSON.stringify(profile));
    } catch (e) {}

    try {
      await setDoc(doc(db, "user_profiles", profile.username), profile, { merge: true });
    } catch (err) {
      console.warn("Could not save profile to firestore:", err);
    }
  };

  const loginUsername = (username: string) => {
    const norm = username.trim().toLowerCase().replace(/^@/, "");
    if (!norm) return;
    setCurrentUsername(norm);
    localStorage.setItem(USERNAME_KEY, norm);
  };

  const loginByIdentifier = async (
    identifier: string
  ): Promise<{ success: boolean; error?: string; username?: string }> => {
    const res = await lookupAccountByIdentifier(identifier);
    if (res.success && res.username) {
      loginUsername(res.username);
    }
    return res;
  };

  const checkAccountExists = async (
    username: string,
    phone?: string
  ): Promise<{ usernameExists: boolean; phoneExists: boolean }> => {
    return checkIfAccountExists(username, phone);
  };

  const logoutUsername = () => {
    if (currentUsername) {
      setDoc(doc(db, "user_presence", currentUsername), { isOnline: false, lastSeen: new Date().toISOString() }, { merge: true }).catch(() => {});
    }
    setCurrentUsername(null);
    setCurrentUserProfile(null);
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

  const sendChatMessage = async (message: FamilyChatMessage) => {
    const toSend = { ...message };

    // Auto-detect @mentions if not explicitly provided
    if (!toSend.mentions && toSend.text) {
      const matched = toSend.text.match(/@([a-zA-Z0-9_]+)/g);
      if (matched) {
        toSend.mentions = Array.from(new Set(matched.map((m) => m.slice(1).toLowerCase())));
      }
    }

    if (!toSend.status) {
      toSend.status = "sent";
    }

    if (!toSend.deliveredTo && currentUsername) {
      toSend.deliveredTo = { [currentUsername]: new Date().toISOString() };
    }

    await setDoc(doc(db, "chat_messages", toSend.id), cleanData(toSend));
  };

  const deleteChatMessage = async (id: string) => {
    await deleteDoc(doc(db, "chat_messages", id));
  };

  const exportJson = () => {
    const blob = new Blob(
      [JSON.stringify({ members, timeline, gallery, notices, chatMessages }, null, 2)],
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
        if (Array.isArray(data.chatMessages)) {
          for (const message of data.chatMessages) {
            await setDoc(doc(db, "chat_messages", message.id), cleanData(message));
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
      for (const colName of ["members", "timeline", "gallery", "notices", "chat_messages"]) {
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
        chatMessages,
        unseenChatCount,
        markChatAsRead,
        currentUsername,
        currentUserProfile,
        loginUsername,
        loginByIdentifier,
        checkAccountExists,
        logoutUsername,
        saveUserProfile,
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
        sendChatMessage,
        deleteChatMessage,
        isAdmin,
        loginAdmin,
        logoutAdmin,
        deletePrompt,
        openDeletePrompt,
        closeDeletePrompt,
        exportJson,
        importJson,
        resetData,
        onlineCount,
        onlineUsers,
        groupSettings,
        updateGroupSettings,
        typingUsers,
        setTypingStatus,
        todayBirthdays,
        upcomingBirthdays,
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
