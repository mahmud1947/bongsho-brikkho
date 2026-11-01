"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  Bell,
  BellOff,
  BellRing,
  Check,
  Copy,
  CornerUpLeft,
  Edit2,
  ImagePlus,
  LogIn,
  MessageCircle,
  MoreHorizontal,
  Pin,
  Search,
  Send,
  Trash2,
  User,
  Users,
  X,
  ZoomIn,
} from "lucide-react";
import Link from "next/link";
import {
  FamilyChatMessage,
  FamilyMember,
  Language,
  UserProfile,
  getCountryFlag,
} from "@/types/family";
import { compressImageFile } from "@/lib/imageUtils";
import {
  getNotificationPermission,
  requestChatNotificationPermission,
  vibrateDevice,
} from "@/lib/notificationUtils";

interface FamilyChatProps {
  messages: FamilyChatMessage[];
  members?: FamilyMember[];
  lang: Language;
  currentUsername: string | null;
  currentUserProfile: UserProfile | null;
  isAdmin: boolean;
  onMarkRead?: () => void;
  onSend: (message: FamilyChatMessage) => Promise<void>;
  onUpdate?: (message: FamilyChatMessage) => Promise<void>;
  onDeleteOwn?: (id: string) => Promise<void>;
  onDeleteAdmin?: (id: string) => void;
  onQuickLogin?: (username: string, displayName: string) => Promise<void>;
}

const REACTION_EMOJIS = ["❤️", "👍", "🤲", "😊", "🎉", "🔥"];

const AVATAR_PALETTES = [
  "bg-emerald-700 text-amber-200",
  "bg-amber-600 text-white",
  "bg-teal-700 text-teal-100",
  "bg-indigo-700 text-indigo-100",
  "bg-rose-700 text-rose-100",
  "bg-purple-700 text-purple-100",
  "bg-cyan-700 text-cyan-100",
  "bg-orange-700 text-orange-100",
];

function getAvatarPalette(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

function getInitials(name: string): string {
  if (!name) return "?";
  const cleaned = name.replace(/[@._-]/g, " ").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return Array.from(parts[0])[0]?.toUpperCase() || "?";
  const first = Array.from(parts[0])[0] || "";
  const last = Array.from(parts[parts.length - 1])[0] || "";
  return (first + last).toUpperCase();
}

function formatDateLabel(isoDate: string, lang: Language): string {
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

function formatMessageTime(isoDate: string, lang: Language): string {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(lang === "bn" ? "bn-BD" : [], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function FamilyChat({
  messages,
  members = [],
  lang,
  currentUsername,
  currentUserProfile,
  isAdmin,
  onMarkRead,
  onSend,
  onUpdate,
  onDeleteOwn,
  onDeleteAdmin,
  onQuickLogin,
}: FamilyChatProps) {
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Notification states
  const [notifPermission, setNotifPermission] = useState<string>("default");
  const [dismissNotifBanner, setDismissNotifBanner] = useState(false);

  useEffect(() => {
    setNotifPermission(getNotificationPermission());
  }, []);

  const handleToggleNotification = async () => {
    const res = await requestChatNotificationPermission();
    setNotifPermission(res);
  };

  // Mark chat as read when mounted or when message count changes
  useEffect(() => {
    onMarkRead?.();
  }, [messages.length, onMarkRead]);

  // Interactive states
  const [replyingTo, setReplyingTo] = useState<FamilyChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<FamilyChatMessage | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [activeMenuMessage, setActiveMenuMessage] = useState<FamilyChatMessage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Swipe to reply and Touch-and-Hold (long press) states
  const [swipingMsgId, setSwipingMsgId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const touchStartRef = useRef<{ x: number; y: number; time: number; msgId: string } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasVibratedSwipeRef = useRef<boolean>(false);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);

  const handleTouchStart = (msg: FamilyChatMessage, e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      msgId: msg.id,
    };
    hasVibratedSwipeRef.current = false;
    isHorizontalSwipeRef.current = null;

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    // Long press for 420ms opens reaction emojis & action sheet
    longPressTimerRef.current = setTimeout(() => {
      vibrateDevice([40]);
      setActiveMenuMessage(msg);
      setSwipingMsgId(null);
      setSwipeOffset(0);
      touchStartRef.current = null;
    }, 420);
  };

  const handleTouchMove = (msg: FamilyChatMessage, e: React.TouchEvent) => {
    if (!touchStartRef.current || touchStartRef.current.msgId !== msg.id) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // Movement cancels long-press
    if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }

    // Lock direction
    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
        isHorizontalSwipeRef.current = false;
      } else if (Math.abs(deltaX) > 8) {
        isHorizontalSwipeRef.current = true;
      }
    }

    if (isHorizontalSwipeRef.current === false) {
      if (swipingMsgId === msg.id) {
        setSwipingMsgId(null);
        setSwipeOffset(0);
      }
      return;
    }

    if (isHorizontalSwipeRef.current === true && deltaX > 0) {
      // Swiping right to reply
      const damped = Math.min(Math.pow(deltaX, 0.82) * 1.8, 65);
      setSwipingMsgId(msg.id);
      setSwipeOffset(damped);

      if (damped >= 40 && !hasVibratedSwipeRef.current) {
        vibrateDevice([25]);
        hasVibratedSwipeRef.current = true;
      }
    }
  };

  const handleTouchEnd = (msg: FamilyChatMessage) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (swipingMsgId === msg.id) {
      if (swipeOffset >= 38) {
        handleStartReply(msg);
      }
      setSwipingMsgId(null);
      setSwipeOffset(0);
    }
    touchStartRef.current = null;
    isHorizontalSwipeRef.current = null;
  };

  const handleTouchCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setSwipingMsgId(null);
    setSwipeOffset(0);
    touchStartRef.current = null;
    isHorizontalSwipeRef.current = null;
  };

  // Search & Filter
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  // UI toggles
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Quick inline login states
  const [quickName, setQuickName] = useState("");
  const [quickUsername, setQuickUsername] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevMessagesCountRef = useRef(messages.length);

  // Lookup map for family members by username or name
  const memberByUsername = useMemo(() => {
    const map = new Map<string, FamilyMember>();
    for (const m of members) {
      if (m.username) {
        map.set(m.username.toLowerCase(), m);
      }
    }
    return map;
  }, [members]);

  // Active participants count
  const participantCount = useMemo(() => {
    const set = new Set(messages.map((m) => m.authorUsername));
    return set.size;
  }, [messages]);

  // Pinned messages
  const pinnedMessages = useMemo(
    () => messages.filter((m) => m.isPinned),
    [messages]
  );
  const latestPinned =
    pinnedMessages.length > 0 ? pinnedMessages[pinnedMessages.length - 1] : null;

  // Filtered messages
  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      if (showPinnedOnly && !m.isPinned) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.text.toLowerCase().includes(q) ||
        m.authorName.toLowerCase().includes(q) ||
        (m.authorNameBn && m.authorNameBn.toLowerCase().includes(q)) ||
        (m.authorNameEn && m.authorNameEn.toLowerCase().includes(q)) ||
        m.authorUsername.toLowerCase().includes(q)
      );
    });
  }, [messages, searchQuery, showPinnedOnly]);

  // Scroll handling
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    endRef.current?.scrollIntoView({ behavior });
    setUnreadCount(0);
  };

  useEffect(() => {
    const isNewMessage = messages.length > prevMessagesCountRef.current;
    prevMessagesCountRef.current = messages.length;

    if (!isNewMessage) return;

    if (!showScrollBottom) {
      scrollToBottom("smooth");
    } else {
      setUnreadCount((prev) => prev + 1);
    }
  }, [messages.length, showScrollBottom]);

  // Initial scroll to bottom on mount
  useEffect(() => {
    scrollToBottom("auto");
  }, []);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isUp = distanceFromBottom > 140;
    setShowScrollBottom(isUp);
    if (!isUp) {
      setUnreadCount(0);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [text]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenuId(null);
    };
    if (activeMenuId) {
      window.addEventListener("click", handleClickOutside);
      return () => window.removeEventListener("click", handleClickOutside);
    }
  }, [activeMenuId]);

  const scrollToMessage = (msgId: string) => {
    const el = document.getElementById(`chat-msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedId(msgId);
      setTimeout(() => {
        setHighlightedId((prev) => (prev === msgId ? null : prev));
      }, 2000);
    }
  };

  const getDisplayAuthorName = (msg: FamilyChatMessage) => {
    if (lang === "bn") {
      return msg.authorNameBn || msg.authorName || msg.authorUsername;
    }
    return msg.authorNameEn || msg.authorName || msg.authorUsername;
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingImage(true);
    try {
      const compressed = await compressImageFile(file, 880, 0.76);
      setSelectedImage(compressed);
      setTimeout(() => textareaRef.current?.focus(), 50);
    } catch {
      alert(
        lang === "bn"
          ? "ছবিটি প্রসেস করা যায়নি। অন্য ছবি চেষ্টা করুন।"
          : "Could not process image. Please try another photo."
      );
    } finally {
      setIsCompressingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSendOrUpdate = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    const trimmed = text.trim();
    if ((!trimmed && !selectedImage) || !currentUsername || isSending) return;

    setIsSending(true);

    try {
      if (editingMessage) {
        const updated: FamilyChatMessage = {
          ...editingMessage,
          text: trimmed,
          editedAt: new Date().toISOString(),
        };
        await (onUpdate ? onUpdate(updated) : onSend(updated));
        setEditingMessage(null);
        setText("");
      } else {
        const authorNameBn =
          currentUserProfile?.nameBn ||
          currentUserProfile?.nameEn ||
          currentUsername;
        const authorNameEn =
          currentUserProfile?.nameEn ||
          currentUserProfile?.nameBn ||
          currentUsername;

        const newMsg: FamilyChatMessage = {
          id: `chat-${Date.now()}`,
          text: trimmed,
          imageUrl: selectedImage || undefined,
          authorUsername: currentUsername,
          authorName: lang === "bn" ? authorNameBn : authorNameEn,
          authorNameBn,
          authorNameEn,
          authorCountry:
            currentUserProfile?.countryBn || currentUserProfile?.countryEn,
          authorPhotoUrl: currentUserProfile?.photoUrl || undefined,
          createdAt: new Date().toISOString(),
          replyTo: replyingTo
            ? {
                id: replyingTo.id,
                authorName: getDisplayAuthorName(replyingTo),
                text:
                  replyingTo.text.slice(0, 140) ||
                  (lang === "bn" ? "📷 ছবি" : "📷 Photo"),
              }
            : undefined,
        };
        await onSend(newMsg);
        setReplyingTo(null);
        setText("");
        setSelectedImage(null);
        setTimeout(() => scrollToBottom("smooth"), 60);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendOrUpdate();
    } else if (e.key === "Escape") {
      setReplyingTo(null);
      setEditingMessage(null);
    }
  };

  const handleToggleReaction = async (
    msg: FamilyChatMessage,
    emoji: string
  ) => {
    if (!currentUsername) return;
    const currentReactions = { ...(msg.reactions || {}) };
    const usersForEmoji = currentReactions[emoji]
      ? [...currentReactions[emoji]]
      : [];

    const idx = usersForEmoji.indexOf(currentUsername);
    if (idx >= 0) {
      usersForEmoji.splice(idx, 1);
    } else {
      usersForEmoji.push(currentUsername);
    }

    if (usersForEmoji.length === 0) {
      delete currentReactions[emoji];
    } else {
      currentReactions[emoji] = usersForEmoji;
    }

    const updated: FamilyChatMessage = {
      ...msg,
      reactions: currentReactions,
    };
    setActiveMenuId(null);
    setActiveMenuMessage(null);
    await (onUpdate ? onUpdate(updated) : onSend(updated));
  };

  const handleTogglePin = async (msg: FamilyChatMessage) => {
    const updated: FamilyChatMessage = {
      ...msg,
      isPinned: !msg.isPinned,
    };
    setActiveMenuId(null);
    setActiveMenuMessage(null);
    await (onUpdate ? onUpdate(updated) : onSend(updated));
  };

  const handleStartEdit = (msg: FamilyChatMessage) => {
    setReplyingTo(null);
    setEditingMessage(msg);
    setText(msg.text);
    setActiveMenuId(null);
    setActiveMenuMessage(null);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleStartReply = (msg: FamilyChatMessage) => {
    setEditingMessage(null);
    setReplyingTo(msg);
    setActiveMenuId(null);
    setActiveMenuMessage(null);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleCopyText = async (msg: FamilyChatMessage) => {
    try {
      await navigator.clipboard.writeText(msg.text);
      setCopiedId(msg.id);
      setActiveMenuId(null);
      setActiveMenuMessage(null);
      setTimeout(() => {
        setCopiedId((prev) => (prev === msg.id ? null : prev));
      }, 1800);
    } catch {}
  };

  const handleDeleteMessage = async (msg: FamilyChatMessage) => {
    setActiveMenuId(null);
    setActiveMenuMessage(null);
    const isMine = msg.authorUsername === currentUsername;
    if (isMine && onDeleteOwn) {
      const confirmMsg =
        lang === "bn"
          ? "আপনি কি আপনার এই বার্তাটি মুছে ফেলতে চান?"
          : "Delete your message?";
      if (window.confirm(confirmMsg)) {
        await onDeleteOwn(msg.id);
      }
      return;
    }
    if (onDeleteAdmin) {
      onDeleteAdmin(msg.id);
    }
  };

  const handleQuickLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onQuickLogin) return;
    const rawName = quickName.trim();
    const generatedUser =
      quickUsername.trim() ||
      rawName
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "") ||
      `member_${Date.now().toString().slice(-4)}`;

    if (!rawName && !quickUsername.trim()) return;
    setIsLoggingIn(true);
    try {
      await onQuickLogin(generatedUser, rawName || generatedUser);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const currentDisplayName =
    lang === "bn"
      ? currentUserProfile?.nameBn ||
        currentUserProfile?.nameEn ||
        currentUsername
      : currentUserProfile?.nameEn ||
        currentUserProfile?.nameBn ||
        currentUsername;

  return (
    <section className="w-full h-full flex-1 flex flex-col min-h-0 bg-white border-0 rounded-none shadow-none overflow-hidden relative">
      {/* HEADER */}
      <header className="px-3.5 sm:px-6 py-2.5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white flex items-center justify-between gap-2 border-b border-emerald-800/80 z-20 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center shadow-sm">
              <MessageCircle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-emerald-950" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base truncate">
                {lang === "bn" ? "পারিবারিক চ্যাট" : "Family Chat"}
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-800/90 text-amber-300 border border-emerald-700">
                <Users className="w-2.5 h-2.5" />
                {participantCount}
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/90 truncate">
              {lang === "bn"
                ? `${messages.length}টি বার্তা • পরিবারের সবার সাথে কথা বলুন`
                : `${messages.length} messages • Talk with everyone in the family`}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {pinnedMessages.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPinnedOnly((prev) => !prev)}
              className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                showPinnedOnly
                  ? "bg-amber-400 text-emerald-950 shadow-xs"
                  : "bg-emerald-900/80 hover:bg-emerald-800 text-amber-300 border border-emerald-700/70"
              }`}
              title={
                lang === "bn" ? "পিন করা বার্তা দেখুন" : "Filter pinned messages"
              }
            >
              <Pin className="w-3.5 h-3.5" />
              <span className="text-[11px]">{pinnedMessages.length}</span>
            </button>
          )}

          {/* Notification Permission Toggle */}
          <button
            type="button"
            onClick={handleToggleNotification}
            className={`p-2 rounded-xl transition cursor-pointer ${
              notifPermission === "granted"
                ? "bg-emerald-900/80 hover:bg-emerald-800 text-amber-300 border border-emerald-700/70"
                : notifPermission === "denied"
                ? "bg-rose-900/40 text-rose-300 border border-rose-700/40"
                : "bg-amber-400 text-emerald-950 shadow-xs"
            }`}
            title={
              notifPermission === "granted"
                ? lang === "bn"
                  ? "নোটিফিকেশন চালু আছে"
                  : "Notifications active"
                : notifPermission === "denied"
                ? lang === "bn"
                  ? "নোটিফিকেশন ব্লক করা আছে"
                  : "Notifications blocked"
                : lang === "bn"
                ? "ফ্রি নোটিফিকেশন চালু করুন"
                : "Enable free notifications"
            }
          >
            {notifPermission === "granted" ? (
              <BellRing className="w-4 h-4" />
            ) : notifPermission === "denied" ? (
              <BellOff className="w-4 h-4" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSearchOpen((prev) => !prev);
              if (isSearchOpen) setSearchQuery("");
            }}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isSearchOpen
                ? "bg-amber-400 text-emerald-950"
                : "bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/70"
            }`}
            title={lang === "bn" ? "বার্তা খুঁজুন" : "Search messages"}
          >
            <Search className="w-4 h-4" />
          </button>

          {currentUsername && (
            <Link
              href="/profile"
              className="hidden sm:flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-xl bg-emerald-900/90 hover:bg-emerald-800 border border-emerald-700/70 text-xs text-emerald-100 transition"
              title={lang === "bn" ? "প্রোফাইল দেখুন" : "View Profile"}
            >
              {currentUserProfile?.photoUrl ? (
                <img
                  src={currentUserProfile.photoUrl}
                  alt={currentDisplayName || currentUsername}
                  className="w-5 h-5 rounded-full object-cover border border-amber-300"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-amber-400 text-emerald-950 font-bold text-[10px] flex items-center justify-center">
                  {getInitials(currentDisplayName || currentUsername)}
                </div>
              )}
              <span className="font-semibold max-w-[90px] truncate">
                {currentDisplayName}
              </span>
            </Link>
          )}
        </div>
      </header>

      {/* NOTIFICATION PROMPT BANNER */}
      {notifPermission === "default" && !dismissNotifBanner && (
        <div className="bg-amber-50 border-b border-amber-200 px-3.5 py-2 flex items-center justify-between gap-2 text-xs text-amber-950 z-10 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Bell className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span className="truncate">
              {lang === "bn"
                ? "নতুন বার্তা আসলে ফ্রি নোটিফিকেশন পেতে চান?"
                : "Want free alerts when new messages arrive?"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={handleToggleNotification}
              className="px-2.5 py-1 bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold rounded-lg cursor-pointer transition shadow-2xs text-[11px]"
            >
              {lang === "bn" ? "অনুমতি দিন" : "Enable"}
            </button>
            <button
              type="button"
              onClick={() => setDismissNotifBanner(true)}
              className="p-1 text-stone-500 hover:text-stone-800 rounded-lg cursor-pointer"
              title={lang === "bn" ? "বন্ধ করুন" : "Dismiss"}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* SEARCH BAR */}
      {isSearchOpen && (
        <div className="px-4 py-2.5 bg-emerald-900/95 border-b border-emerald-800 flex items-center gap-2 z-10 animate-in fade-in duration-150">
          <Search className="w-4 h-4 text-amber-300 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === "bn"
                ? "বার্তা বা সদস্যের নাম দিয়ে খুঁজুন..."
                : "Search by message or member name..."
            }
            className="flex-1 bg-transparent text-white placeholder:text-emerald-300/70 text-xs sm:text-sm focus:outline-none"
          />
          {searchQuery && (
            <span className="text-[11px] text-amber-300 font-semibold">
              {filteredMessages.length}{" "}
              {lang === "bn" ? "টি ফলাফল" : "results"}
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setIsSearchOpen(false);
            }}
            className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PINNED MESSAGE BANNER */}
      {latestPinned && !showPinnedOnly && (
        <div className="px-3.5 py-2 bg-amber-50/95 border-b border-amber-200/80 flex items-center justify-between gap-2 text-xs z-10">
          <button
            type="button"
            onClick={() => scrollToMessage(latestPinned.id)}
            className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-lg bg-amber-400/30 text-amber-800 flex items-center justify-center flex-shrink-0">
              <Pin className="w-3.5 h-3.5 rotate-45" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[11px] text-amber-900">
                  {lang === "bn" ? "পিন করা বার্তা" : "Pinned Message"}
                </span>
                <span className="text-[10px] text-amber-700 font-medium truncate">
                  • {getDisplayAuthorName(latestPinned)}
                </span>
              </div>
              <p className="text-stone-700 truncate text-xs group-hover:text-emerald-950">
                {latestPinned.text}
              </p>
            </div>
          </button>
          {(isAdmin || latestPinned.authorUsername === currentUsername) && (
            <button
              type="button"
              onClick={() => handleTogglePin(latestPinned)}
              className="p-1 rounded-lg hover:bg-amber-200/60 text-amber-800 cursor-pointer"
              title={lang === "bn" ? "আনপিন করুন" : "Unpin"}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* FILTER ACTIVE BANNER */}
      {showPinnedOnly && (
        <div className="px-4 py-2 bg-amber-100/90 border-b border-amber-200 flex items-center justify-between text-xs text-amber-950 font-semibold">
          <span className="flex items-center gap-1.5">
            <Pin className="w-3.5 h-3.5" />
            {lang === "bn"
              ? `শুধুমাত্র পিন করা বার্তা দেখানো হচ্ছে (${pinnedMessages.length})`
              : `Showing pinned messages only (${pinnedMessages.length})`}
          </span>
          <button
            type="button"
            onClick={() => setShowPinnedOnly(false)}
            className="text-emerald-900 underline font-bold cursor-pointer"
          >
            {lang === "bn" ? "সব দেখুন" : "Show all"}
          </button>
        </div>
      )}

      {/* MESSAGES LIST */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-1.5 bg-[radial-gradient(#e5e0d8_1px,transparent_1px)] [background-size:18px_18px] bg-[#f8f6f2]"
      >
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-stone-500 p-6">
            <div className="w-16 h-16 rounded-3xl bg-amber-100/80 border border-amber-200 text-amber-600 flex items-center justify-center mb-3 shadow-xs">
              <MessageCircle className="w-8 h-8" />
            </div>
            <p className="font-bold text-stone-800 text-base">
              {searchQuery
                ? lang === "bn"
                  ? "কোনো বার্তা পাওয়া যায়নি"
                  : "No matching messages found"
                : lang === "bn"
                ? "এখনও কোনো বার্তা নেই"
                : "No messages yet"}
            </p>
            <p className="text-xs text-stone-500 mt-1 max-w-xs">
              {searchQuery
                ? lang === "bn"
                  ? "অন্য কোনো শব্দ দিয়ে খুঁজে দেখুন।"
                  : "Try searching with a different keyword."
                : lang === "bn"
                ? "প্রথম বার্তাটি পাঠিয়ে কথোপকথন শুরু করুন!"
                : "Write a message to start the family conversation!"}
            </p>
          </div>
        ) : (
          filteredMessages.map((message, index) => {
            const isMine = message.authorUsername === currentUsername;
            const prevMsg = index > 0 ? filteredMessages[index - 1] : null;
            const nextMsg =
              index < filteredMessages.length - 1
                ? filteredMessages[index + 1]
                : null;

            const currentDateLabel = formatDateLabel(message.createdAt, lang);
            const prevDateLabel = prevMsg
              ? formatDateLabel(prevMsg.createdAt, lang)
              : null;
            const showDateDivider = currentDateLabel !== prevDateLabel;

            // Group consecutive messages from the same author within 5 minutes on the same day
            const isGroupedWithPrev =
              !showDateDivider &&
              prevMsg !== null &&
              prevMsg.authorUsername === message.authorUsername &&
              Math.abs(
                new Date(message.createdAt).getTime() -
                  new Date(prevMsg.createdAt).getTime()
              ) <
                5 * 60 * 1000;

            const isGroupedWithNext =
              nextMsg !== null &&
              formatDateLabel(nextMsg.createdAt, lang) === currentDateLabel &&
              nextMsg.authorUsername === message.authorUsername &&
              Math.abs(
                new Date(nextMsg.createdAt).getTime() -
                  new Date(message.createdAt).getTime()
              ) <
                5 * 60 * 1000;

            const matchedMember = memberByUsername.get(
              message.authorUsername.toLowerCase()
            );
            const authorDisplayName = getDisplayAuthorName(message);
            const countryFlag =
              message.authorCountry ||
              matchedMember?.countryBn ||
              matchedMember?.countryEn
                ? getCountryFlag(
                    message.authorCountry ||
                      matchedMember?.countryBn ||
                      matchedMember?.countryEn
                  )
                : null;

            const reactionEntries = Object.entries(
              message.reactions || {}
            ).filter(([, users]) => Array.isArray(users) && users.length > 0);

            const isHighlighted = highlightedId === message.id;

            return (
              <React.Fragment key={message.id}>
                {/* DATE SEPARATOR */}
                {showDateDivider && currentDateLabel && (
                  <div className="flex items-center justify-center my-3">
                    <span className="px-3 py-1 rounded-full bg-stone-200/85 backdrop-blur-xs text-stone-700 text-[11px] font-bold shadow-2xs border border-stone-300/60">
                      {currentDateLabel}
                    </span>
                  </div>
                )}

                {/* MESSAGE ROW */}
                <div
                  id={`chat-msg-${message.id}`}
                  className={`flex items-end gap-2 transition-all duration-300 ${
                    isMine ? "justify-end" : "justify-start"
                  } ${isGroupedWithPrev ? "mt-0.5" : "mt-3"} ${
                    isHighlighted
                      ? "bg-amber-200/50 -mx-2 px-2 py-1 rounded-2xl"
                      : ""
                  }`}
                >
                  {/* Left Avatar for Others */}
                  {!isMine && (
                    <div className="w-8 flex-shrink-0 flex flex-col items-center">
                      {!isGroupedWithNext ? (
                        message.authorPhotoUrl || matchedMember?.photoUrl ? (
                          <img
                            src={
                              message.authorPhotoUrl || matchedMember?.photoUrl
                            }
                            alt={authorDisplayName}
                            className="w-8 h-8 rounded-2xl object-cover border border-stone-300 shadow-2xs"
                          />
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-2xl flex items-center justify-center text-xs font-extrabold shadow-2xs ${getAvatarPalette(
                              message.authorUsername
                            )}`}
                            title={`@${message.authorUsername}`}
                          >
                            {getInitials(authorDisplayName)}
                          </div>
                        )
                      ) : (
                        <div className="w-8" />
                      )}
                    </div>
                  )}

                  {/* Message Content Column */}
                  <div
                    className={`group relative max-w-[82%] sm:max-w-[75%] flex flex-col ${
                      isMine ? "items-end" : "items-start"
                    }`}
                  >
                    {/* Sender Name Header (only on first message of a group) */}
                    {!isGroupedWithPrev && (
                      <div
                        className={`flex items-center gap-1.5 mb-1 px-1 text-[11px] ${
                          isMine ? "text-stone-600" : "text-stone-600"
                        }`}
                      >
                        <span className="font-bold text-stone-800">
                          {isMine
                            ? lang === "bn"
                              ? "আপনি"
                              : "You"
                            : authorDisplayName}
                        </span>
                        {!isMine && (
                          <span className="text-[10px] text-stone-400 font-mono">
                            @{message.authorUsername}
                          </span>
                        )}
                        {countryFlag && (
                          <span className="text-xs leading-none">
                            {countryFlag}
                          </span>
                        )}
                        {message.isPinned && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full">
                            <Pin className="w-2.5 h-2.5 rotate-45" />
                            {lang === "bn" ? "পিন" : "Pinned"}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bubble + Action Trigger Wrapper */}
                    <div
                      className={`relative flex items-center gap-1.5 ${
                        isMine ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {/* Swipe-to-reply indicator on the left of bubble */}
                      {swipingMsgId === message.id && (
                        <div
                          className="absolute -left-9 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none transition-all duration-150 z-10"
                          style={{
                            opacity: Math.min(swipeOffset / 28, 1),
                            transform: `scale(${Math.min(0.6 + (swipeOffset / 40) * 0.4, 1.15)}) translateY(-50%)`,
                          }}
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs transition-colors ${
                              swipeOffset >= 38
                                ? "bg-emerald-600 text-white ring-2 ring-emerald-300"
                                : "bg-stone-300 text-stone-700"
                            }`}
                          >
                            <CornerUpLeft className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      )}

                      {/* MESSAGE BUBBLE */}
                      <div
                        onTouchStart={(e) => handleTouchStart(message, e)}
                        onTouchMove={(e) => handleTouchMove(message, e)}
                        onTouchEnd={() => handleTouchEnd(message)}
                        onTouchCancel={handleTouchCancel}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setActiveMenuMessage(message);
                        }}
                        style={{
                          transform:
                            swipingMsgId === message.id
                              ? `translateX(${swipeOffset}px)`
                              : undefined,
                          transition:
                            swipingMsgId === message.id
                              ? "none"
                              : "transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)",
                        }}
                        className={`relative px-3.5 py-2.5 shadow-xs select-none touch-pan-y transition-colors ${
                          isMine
                            ? `bg-gradient-to-br from-emerald-900 to-emerald-950 text-white ${
                                isGroupedWithNext
                                  ? "rounded-2xl"
                                  : "rounded-2xl rounded-br-xs"
                              }`
                            : `bg-white border border-stone-200/90 text-stone-800 ${
                                isGroupedWithNext
                                  ? "rounded-2xl"
                                  : "rounded-2xl rounded-bl-xs"
                              }`
                        }`}
                      >
                        {/* Quoted Reply Preview inside bubble */}
                        {message.replyTo && (
                          <button
                            type="button"
                            onClick={() =>
                              scrollToMessage(message.replyTo!.id)
                            }
                            className={`w-full text-left mb-2 pl-2.5 pr-2 py-1.5 rounded-xl border-l-3 text-xs transition block cursor-pointer ${
                              isMine
                                ? "bg-emerald-950/60 border-amber-400 text-emerald-100 hover:bg-emerald-950/90"
                                : "bg-stone-100 border-emerald-700 text-stone-700 hover:bg-stone-200/70"
                            }`}
                          >
                            <span
                              className={`font-bold text-[10px] block ${
                                isMine ? "text-amber-300" : "text-emerald-800"
                              }`}
                            >
                              {message.replyTo.authorName}
                            </span>
                            <span className="line-clamp-2 opacity-90 text-[11px]">
                              {message.replyTo.text}
                            </span>
                          </button>
                        )}

                        {/* Attached Image inside bubble */}
                        {message.imageUrl && (
                          <div className="mb-2 relative group/img overflow-hidden rounded-xl border border-black/10 bg-black/5">
                            <img
                              src={message.imageUrl}
                              alt="Chat attachment"
                              onClick={() =>
                                setLightboxImage(message.imageUrl!)
                              }
                              className="max-h-64 w-auto max-w-full object-cover rounded-xl cursor-pointer hover:opacity-95 transition"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setLightboxImage(message.imageUrl!)
                              }
                              className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover/img:opacity-100 transition cursor-pointer"
                              title={lang === "bn" ? "বড় করে দেখুন" : "Zoom"}
                            >
                              <ZoomIn className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Main Message Text */}
                        {message.text && (
                          <p className="text-[13.5px] sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {message.text}
                          </p>
                        )}

                        {/* Timestamp + Edited status inside bottom-right of bubble */}
                        <div
                          className={`mt-1 flex items-center justify-end gap-1.5 text-[10px] ${
                            isMine ? "text-emerald-200/80" : "text-stone-400"
                          }`}
                        >
                          {message.editedAt && (
                            <span className="italic">
                              {lang === "bn" ? "(এডিটেড)" : "(edited)"}
                            </span>
                          )}
                          <span>
                            {formatMessageTime(message.createdAt, lang)}
                          </span>
                          {copiedId === message.id && (
                            <span className="text-amber-300 font-bold flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" />
                              {lang === "bn" ? "কপি" : "Copied"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Desktop hover options trigger (hidden on mobile) */}
                      <div className="hidden sm:inline-flex opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuMessage(message);
                          }}
                          className="p-1.5 rounded-full bg-white/90 hover:bg-white border border-stone-200 text-stone-600 hover:text-emerald-800 shadow-2xs cursor-pointer"
                          title={lang === "bn" ? "মেনু ও ইমোজি" : "Reactions & Options"}
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* REACTION PILLS BELOW BUBBLE */}
                    {reactionEntries.length > 0 && (
                      <div
                        className={`flex flex-wrap gap-1 mt-1 ${
                          isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        {reactionEntries.map(([emoji, users]) => {
                          const iReacted = currentUsername
                            ? users.includes(currentUsername)
                            : false;
                          return (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() =>
                                currentUsername &&
                                handleToggleReaction(message, emoji)
                              }
                              title={users.map((u) => `@${u}`).join(", ")}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border shadow-2xs transition cursor-pointer ${
                                iReacted
                                  ? "bg-emerald-50 border-emerald-400 text-emerald-900"
                                  : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                              }`}
                            >
                              <span>{emoji}</span>
                              <span className="text-[10px]">{users.length}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* FLOATING SCROLL TO BOTTOM BUTTON */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom("smooth")}
          className="absolute bottom-24 right-4 z-20 flex items-center gap-1.5 px-3 py-2 rounded-full bg-emerald-950 text-amber-300 shadow-lg border border-emerald-700 text-xs font-bold hover:bg-emerald-900 transition cursor-pointer animate-bounce"
        >
          <ArrowDown className="w-3.5 h-3.5" />
          <span>
            {unreadCount > 0
              ? lang === "bn"
                ? `${unreadCount}টি নতুন বার্তা`
                : `${unreadCount} new`
              : lang === "bn"
              ? "নিচে যান"
              : "Bottom"}
          </span>
        </button>
      )}

      {/* FOOTER: INPUT OR IN-PLACE QUICK LOGIN */}
      {currentUsername ? (
        <div className="border-t border-stone-200 bg-white z-20 flex-shrink-0">
          {/* REPLYING OR EDITING BANNER */}
          {(replyingTo || editingMessage) && (
            <div className="px-3.5 py-2 bg-stone-100 border-b border-stone-200 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                {editingMessage ? (
                  <Edit2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                ) : (
                  <CornerUpLeft className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <span className="font-bold text-emerald-900 block text-[11px]">
                    {editingMessage
                      ? lang === "bn"
                        ? "বার্তা এডিট করা হচ্ছে"
                        : "Editing message"
                      : lang === "bn"
                      ? `${getDisplayAuthorName(replyingTo!)}-কে রিপ্লাই দিচ্ছেন`
                      : `Replying to ${getDisplayAuthorName(replyingTo!)}`}
                  </span>
                  <p className="text-stone-600 truncate text-[11px]">
                    {(editingMessage || replyingTo)?.text}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReplyingTo(null);
                  if (editingMessage) {
                    setEditingMessage(null);
                    setText("");
                  }
                }}
                className="p-1 rounded-lg hover:bg-stone-200 text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* SELECTED IMAGE PREVIEW BANNER */}
          {selectedImage && (
            <div className="px-3.5 py-2.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-emerald-600/40 shadow-xs bg-white">
                  <img
                    src={selectedImage}
                    alt="Selected preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-emerald-950 block">
                    {lang === "bn" ? "ছবি যুক্ত করা হয়েছে" : "Photo attached"}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {lang === "bn"
                      ? "সাথে কিছু লিখতে পারেন বা সরাসরি পাঠান"
                      : "Add a caption or send directly"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer transition"
                title={lang === "bn" ? "ছবি সরান" : "Remove photo"}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* MAIN INPUT FORM */}
          <form
            onSubmit={handleSendOrUpdate}
            className="p-2.5 sm:p-3 flex items-end gap-2 bg-white"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            {!editingMessage && (
              <button
                type="button"
                disabled={isCompressingImage || isSending}
                onClick={() => fileInputRef.current?.click()}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition cursor-pointer ${
                  selectedImage
                    ? "bg-emerald-900 text-amber-300"
                    : "bg-stone-100 hover:bg-emerald-50 text-emerald-800 border border-stone-200/80"
                }`}
                title={
                  lang === "bn" ? "ছবি পাঠান (ফ্রি)" : "Attach Photo (Free)"
                }
              >
                <ImagePlus className="w-5 h-5" />
              </button>
            )}

            <div className="flex-1 min-w-0 relative">
              <textarea
                ref={textareaRef}
                rows={1}
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isCompressingImage
                    ? lang === "bn"
                      ? "ছবি প্রস্তুত করা হচ্ছে..."
                      : "Preparing photo..."
                    : "Write message..."
                }
                className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-200/90 bg-stone-50 focus:bg-white text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none max-h-32 leading-snug"
              />
            </div>

            <button
              type="submit"
              disabled={(!text.trim() && !selectedImage) || isSending}
              className="w-10 h-10 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 flex items-center justify-center flex-shrink-0 shadow-xs disabled:opacity-40 transition cursor-pointer"
              title={lang === "bn" ? "বার্তা পাঠান" : "Send Message"}
            >
              <Send className="w-4 h-4 stroke-[2.3]" />
            </button>
          </form>
        </div>
      ) : (
        /* IN-PLACE QUICK LOGIN / NAME SETUP */
        <div className="p-3.5 sm:p-4 border-t border-stone-200 bg-gradient-to-b from-stone-50 to-white z-20 flex-shrink-0">
          {onQuickLogin ? (
            <form onSubmit={handleQuickLoginSubmit} className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span>
                    {lang === "bn"
                      ? "চ্যাটে অংশ নিতে আপনার নাম লিখুন"
                      : "Enter your name to join the chat"}
                  </span>
                </div>
                <Link
                  href="/profile"
                  className="text-[11px] font-semibold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  <LogIn className="w-3 h-3" />
                  <span>
                    {lang === "bn" ? "সম্পূর্ণ প্রোফাইল" : "Full Profile"}
                  </span>
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  placeholder={
                    lang === "bn"
                      ? "আপনার নাম (যেমন: আব্দুল করিম)"
                      : "Your Name (e.g. Abdul Karim)"
                  }
                  className="flex-1 px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <input
                  type="text"
                  value={quickUsername}
                  onChange={(e) => setQuickUsername(e.target.value)}
                  placeholder={
                    lang === "bn"
                      ? "@ইউজারনেম (ঐচ্ছিক)"
                      : "@username (optional)"
                  }
                  className="sm:w-40 px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  type="submit"
                  disabled={!quickName.trim() || isLoggingIn}
                  className="px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold text-xs sm:text-sm shadow-xs disabled:opacity-50 cursor-pointer transition flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    {lang === "bn" ? "চ্যাট শুরু করুন" : "Start Chat"}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center text-sm text-stone-600">
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 font-bold text-emerald-800 hover:text-emerald-950"
              >
                <LogIn className="w-4 h-4" />
                {lang === "bn"
                  ? "চ্যাট করতে প্রোফাইলে লগইন করুন"
                  : "Log in from Profile to chat"}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* FULLSCREEN IMAGE LIGHTBOX */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Full view"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[88vh] rounded-2xl shadow-2xl object-contain"
          />
        </div>
      )}

      {/* REACTION & ACTION SHEET MODAL (Triggered by Touch & Hold or Desktop Menu) */}
      {activeMenuMessage && (
        <div
          onClick={() => setActiveMenuMessage(null)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end sm:justify-center items-center p-3 animate-in fade-in duration-150"
        >
          {/* Reaction Emojis Floating Pill */}
          {currentUsername && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white/95 backdrop-blur-md rounded-full shadow-2xl border border-stone-200/90 px-3.5 py-2 flex items-center gap-2 sm:gap-3 mb-3 animate-in zoom-in-95 duration-150"
            >
              {REACTION_EMOJIS.map((emoji) => {
                const hasReacted =
                  currentUsername &&
                  activeMenuMessage.reactions?.[emoji]?.includes(currentUsername);
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      vibrateDevice([20]);
                      handleToggleReaction(activeMenuMessage, emoji);
                      setActiveMenuMessage(null);
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl hover:scale-125 active:scale-95 transition cursor-pointer ${
                      hasReacted
                        ? "bg-amber-100 ring-2 ring-amber-400 scale-110"
                        : "hover:bg-stone-100"
                    }`}
                    title={emoji}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          )}

          {/* Action List Card */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-stone-200 overflow-hidden divide-y divide-stone-100 text-sm animate-in slide-in-from-bottom-3 sm:zoom-in-95 duration-150"
          >
            {/* Target Message preview */}
            <div className="px-4 py-2.5 bg-stone-50 text-stone-500 text-xs flex items-center justify-between">
              <span className="font-bold text-stone-700 truncate max-w-[200px]">
                {getDisplayAuthorName(activeMenuMessage)}
              </span>
              <span className="text-[11px] text-stone-400">
                {formatMessageTime(activeMenuMessage.createdAt, lang)}
              </span>
            </div>

            {/* 1. Reply */}
            {currentUsername && (
              <button
                type="button"
                onClick={() => {
                  handleStartReply(activeMenuMessage);
                  setActiveMenuMessage(null);
                }}
                className="w-full px-4 py-3 hover:bg-stone-50 flex items-center justify-between text-stone-800 font-semibold transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <CornerUpLeft className="w-4 h-4 text-emerald-700" />
                  <span>{lang === "bn" ? "রিপ্লাই দিন" : "Reply"}</span>
                </div>
                <span className="text-[11px] text-stone-400 font-normal">
                  {lang === "bn" ? "ডানে সোয়াইপ" : "Swipe right"}
                </span>
              </button>
            )}

            {/* 2. Copy Text */}
            {activeMenuMessage.text && (
              <button
                type="button"
                onClick={() => {
                  handleCopyText(activeMenuMessage);
                  setActiveMenuMessage(null);
                }}
                className="w-full px-4 py-3 hover:bg-stone-50 flex items-center gap-2.5 text-stone-800 font-semibold transition cursor-pointer"
              >
                <Copy className="w-4 h-4 text-stone-600" />
                <span>{lang === "bn" ? "টেক্সট কপি করুন" : "Copy Text"}</span>
              </button>
            )}

            {/* 3. Pin / Unpin */}
            {currentUsername && (
              <button
                type="button"
                onClick={() => {
                  handleTogglePin(activeMenuMessage);
                  setActiveMenuMessage(null);
                }}
                className="w-full px-4 py-3 hover:bg-stone-50 flex items-center gap-2.5 text-stone-800 font-semibold transition cursor-pointer"
              >
                <Pin className="w-4 h-4 text-amber-600" />
                <span>
                  {activeMenuMessage.isPinned
                    ? lang === "bn"
                      ? "আনপিন করুন"
                      : "Unpin Message"
                    : lang === "bn"
                    ? "পিন করুন"
                    : "Pin Message"}
                </span>
              </button>
            )}

            {/* 4. Edit (if own) */}
            {activeMenuMessage.authorUsername === currentUsername && (
              <button
                type="button"
                onClick={() => {
                  handleStartEdit(activeMenuMessage);
                  setActiveMenuMessage(null);
                }}
                className="w-full px-4 py-3 hover:bg-stone-50 flex items-center gap-2.5 text-blue-700 font-semibold transition cursor-pointer"
              >
                <Edit2 className="w-4 h-4 text-blue-600" />
                <span>{lang === "bn" ? "বার্তা এডিট করুন" : "Edit Message"}</span>
              </button>
            )}

            {/* 5. Delete (if own or admin) */}
            {(activeMenuMessage.authorUsername === currentUsername || isAdmin) && (
              <button
                type="button"
                onClick={() => {
                  handleDeleteMessage(activeMenuMessage);
                  setActiveMenuMessage(null);
                }}
                className="w-full px-4 py-3 hover:bg-rose-50 flex items-center gap-2.5 text-rose-700 font-semibold transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>{lang === "bn" ? "বার্তা মুছুন" : "Delete Message"}</span>
              </button>
            )}

            {/* 6. Cancel */}
            <button
              type="button"
              onClick={() => setActiveMenuMessage(null)}
              className="w-full px-4 py-2.5 bg-stone-50 hover:bg-stone-100 flex items-center justify-center text-stone-500 text-xs font-bold transition cursor-pointer"
            >
              {lang === "bn" ? "বাতিল" : "Cancel"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
