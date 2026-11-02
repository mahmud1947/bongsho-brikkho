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
  getDoc,
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

const USERNAME_KEY = "bongsho_current_username";
const ADMIN_PASSWORD = "Mahmud2026";
const ADMIN_STORAGE_KEY = "bongsho_is_admin";
const LANG_STORAGE_KEY = "bongsho_preferred_language";

export interface UpcomingBirthdayItem {
  member: FamilyMember;
  daysRemaining: number;
  birthDateFormatted: string;
  calculatedAge?: number;
}

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
  const currentUsernameRef = useRef<string | null>(null);

  // Presence states
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(1);

  // Group Settings state
  const [groupSettings, setGroupSettings] = useState<GroupSettings>(defaultGroupSettings);

  // Typing status state
  const [typingUsers, setTypingUsers] = useState<Record<string, { displayName: string; timestamp: number }>>({});

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
    const unsubChatMessages = onSnapshot(collection(db, "chat_messages"), (snap) => {
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
        setTypingUsers(activeTyping);
      }
    });

    // Subscribe to Real-Time Presence
    const unsubPresence = onSnapshot(collection(db, "user_presence"), (snap) => {
      const now = Date.now();
      const list: UserPresence[] = [];
      const seen = new Set<string>();

      snap.docs.forEach((d) => {
        const data = d.data() as UserPresence;
        if (!data.username || seen.has(data.username)) return;
        seen.add(data.username);

        const lastSeenTime = new Date(data.lastSeen).getTime();
        const isRecent = !isNaN(lastSeenTime) && now - lastSeenTime < 80000;
        if (data.isOnline && isRecent) {
          list.push(data);
        }
      });

      const me = currentUsernameRef.current;
      if (me && !seen.has(me)) {
        list.push({
          username: me,
          displayName: me,
          lastSeen: new Date().toISOString(),
          isOnline: true,
        });
      }

      setOnlineUsers(list);
      setOnlineCount(Math.max(1, list.length));
    });

    return () => {
      unsubMembers();
      unsubTimeline();
      unsubGallery();
      unsubNotices();
      unsubChatMessages();
      unsubGroup();
      unsubTyping();
      unsubPresence();
    };
  }, []);

  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);

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

  // Presence Heartbeat
  const updatePresenceHeartbeat = useCallback(
    async (isOnline: boolean = true) => {
      const user = currentUsernameRef.current;
      if (!user) return;
      try {
        const profile = currentUserProfile;
        const name = profile?.nameBn || profile?.nameEn || `@${user}`;
        const isMobile =
          typeof navigator !== "undefined" &&
          /android|iphone|ipad|mobile/i.test(navigator.userAgent);
        const presenceData: UserPresence = {
          username: user,
          displayName: name,
          photoUrl: profile?.photoUrl || "",
          lastSeen: new Date().toISOString(),
          isOnline,
          platform: isMobile ? "mobile" : "desktop",
        };
        await setDoc(doc(db, "user_presence", user), cleanData(presenceData), { merge: true });
      } catch (err) {
        // silently catch offline/presence network error
      }
    },
    [currentUserProfile]
  );

  useEffect(() => {
    if (!currentUsername) return;

    updatePresenceHeartbeat(true);

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        updatePresenceHeartbeat(true);
      }
    }, 32000);

    const handleVisibilityChange = () => {
      if (typeof document !== "undefined") {
        if (document.visibilityState === "visible") {
          updatePresenceHeartbeat(true);
        } else {
          updatePresenceHeartbeat(false);
        }
      }
    };

    const handleBeforeUnload = () => {
      updatePresenceHeartbeat(false);
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentUsername, updatePresenceHeartbeat]);

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
    const todayList: Array<{ member: FamilyMember; age?: number }> = [];
    const upcomingList: UpcomingBirthdayItem[] = [];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    const currentDay = now.getDate();

    for (const m of members) {
      if (m.isAlive === false) continue;
      if (!m.birthYear || m.birthYear === "জানা নেই" || m.birthYear === "unknown") continue;

      const parts = m.birthYear
        .split("-")
        .map((p) => parseInt(p.trim(), 10))
        .filter((n) => !isNaN(n));
      let y: number | undefined;
      let month: number | undefined;
      let day: number | undefined;

      if (parts.length >= 3) {
        if (parts[0] > 1900) {
          y = parts[0];
          month = parts[1];
          day = parts[2];
        } else {
          y = parts[2];
          month = parts[1];
          day = parts[0];
        }
      } else {
        continue;
      }

      if (!month || !day || month < 1 || month > 12 || day < 1 || day > 31) continue;

      const calculatedAge = y ? currentYear - y : undefined;

      // Check if today
      if (month - 1 === currentMonth && day === currentDay) {
        todayList.push({
          member: m,
          age: calculatedAge,
        });
        upcomingList.push({
          member: m,
          daysRemaining: 0,
          birthDateFormatted: `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}`,
          calculatedAge,
        });
      } else {
        let nextBday = new Date(currentYear, month - 1, day);
        if (nextBday < now) {
          nextBday = new Date(currentYear + 1, month - 1, day);
        }
        const diffTime = nextBday.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 1 && diffDays <= 30) {
          const nextAge = y ? nextBday.getFullYear() - y : undefined;
          upcomingList.push({
            member: m,
            daysRemaining: diffDays,
            birthDateFormatted: `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}`,
            calculatedAge: nextAge,
          });
        }
      }
    }

    upcomingList.sort((a, b) => a.daysRemaining - b.daysRemaining);

    return { todayBirthdays: todayList, upcomingBirthdays: upcomingList };
  }, [members]);

  // Birthday Notification Check once per day
  useEffect(() => {
    if (typeof window === "undefined") return;
    const todayStr = new Date().toISOString().slice(0, 10);
    const notifKey = `bongsho_bday_notif_${todayStr}`;
    if (localStorage.getItem(notifKey)) return;

    if (todayBirthdays.length > 0) {
      const p = todayBirthdays[0];
      const name = lang === "bn" ? p.member.nameBn : p.member.nameEn;
      showBrowserNotification(`🎂 শুভ জন্মদিন: ${name}!`, {
        body:
          lang === "bn"
            ? `আজ ${name}-এর শুভ জন্মদিন! পারিবারিক চ্যাটে শুভেচ্ছা জানান।`
            : `Today is ${name}'s birthday! Wish them in the Family Chat.`,
        tag: `bongsho-bday-${todayStr}`,
      });
      localStorage.setItem(notifKey, "true");
    } else {
      const tomorrowBday = upcomingBirthdays.find((b) => b.daysRemaining === 1);
      if (tomorrowBday) {
        const name =
          lang === "bn" ? tomorrowBday.member.nameBn : tomorrowBday.member.nameEn;
        showBrowserNotification(`🎉 আগামীকাল জন্মদিন: ${name}!`, {
          body:
            lang === "bn"
              ? `আগামীকাল ${name}-এর শুভ জন্মদিন! প্রস্তুতি নিন।`
              : `Tomorrow is ${name}'s birthday! Get ready to wish them.`,
          tag: `bongsho-bday-advance-${todayStr}`,
        });
        localStorage.setItem(notifKey, "true");
      }
    }
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
    const raw = identifier.trim();
    if (!raw) {
      return { success: false, error: "empty_identifier" };
    }

    const cleanUser = raw.toLowerCase().replace(/^@/, "");
    const inputDigits = raw.replace(/\D/g, "");

    if (inputDigits.length >= 6) {
      try {
        const snap = await getDocs(collection(db, "user_profiles"));
        const matchedDoc = snap.docs.find((d) => {
          const u = d.data() as UserProfile;
          if (!u.phone) return false;
          const uDigits = u.phone.replace(/\D/g, "");
          if (!uDigits) return false;
          return (
            uDigits === inputDigits ||
            uDigits.endsWith(inputDigits) ||
            inputDigits.endsWith(uDigits)
          );
        });

        if (matchedDoc) {
          const user = matchedDoc.data() as UserProfile;
          loginUsername(user.username);
          return { success: true, username: user.username };
        }
      } catch (e) {
        console.warn("Error querying user_profiles by phone:", e);
      }
    }

    try {
      const docRef = doc(db, "user_profiles", cleanUser);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        loginUsername(cleanUser);
        return { success: true, username: cleanUser };
      }
    } catch (e) {
      console.warn("Error querying user_profiles by username:", e);
    }

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("bongsho_profile_")) {
          const rawJson = localStorage.getItem(key);
          if (rawJson) {
            const profile = JSON.parse(rawJson) as UserProfile;
            if (profile.username && profile.username.toLowerCase() === cleanUser) {
              loginUsername(profile.username);
              return { success: true, username: profile.username };
            }
            if (inputDigits.length >= 6 && profile.phone) {
              const pDigits = profile.phone.replace(/\D/g, "");
              if (
                pDigits === inputDigits ||
                pDigits.endsWith(inputDigits) ||
                inputDigits.endsWith(pDigits)
              ) {
                loginUsername(profile.username);
                return { success: true, username: profile.username };
              }
            }
          }
        }
      }
    } catch (e) {}

    return { success: false, error: "not_found" };
  };

  const checkAccountExists = async (
    username: string,
    phone?: string
  ): Promise<{ usernameExists: boolean; phoneExists: boolean }> => {
    const cleanUser = username.trim().toLowerCase().replace(/^@/, "");
    const inputDigits = phone ? phone.replace(/\D/g, "") : "";

    let usernameExists = false;
    let phoneExists = false;

    try {
      const userDoc = await getDoc(doc(db, "user_profiles", cleanUser));
      if (userDoc.exists()) {
        usernameExists = true;
      }

      if (inputDigits && inputDigits.length >= 6) {
        const snap = await getDocs(collection(db, "user_profiles"));
        for (const d of snap.docs) {
          const u = d.data() as UserProfile;
          if (u.phone) {
            const uDigits = u.phone.replace(/\D/g, "");
            if (
              uDigits === inputDigits ||
              uDigits.endsWith(inputDigits) ||
              inputDigits.endsWith(uDigits)
            ) {
              phoneExists = true;
              break;
            }
          }
        }
      }
    } catch (e) {
      console.warn("Error checking account exists:", e);
    }

    return { usernameExists, phoneExists };
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
