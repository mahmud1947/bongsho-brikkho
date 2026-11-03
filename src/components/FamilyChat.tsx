"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowDown, Check, MessageCircle } from "lucide-react";
import {
  FamilyChatMessage,
  FamilyMember,
  GroupSettings,
  Language,
  UserProfile,
  UserPresence,
} from "@/types/family";
import { compressImageFile } from "@/lib/imageUtils";
import {
  getNotificationPermission,
  requestChatNotificationPermission,
  vibrateDevice,
} from "@/lib/notificationUtils";
import ChatHeader from "./chat/ChatHeader";
import ChatPinnedBanner from "./chat/ChatPinnedBanner";
import ChatMessageItem from "./chat/ChatMessageItem";
import ChatInputBar from "./chat/ChatInputBar";
import ChatQuickLoginForm from "./chat/ChatQuickLoginForm";
import { formatDateLabel } from "./chat/chatUtils";

// Dynamically import modals & overlays to reduce initial load bundle
const GroupInfoModal = dynamic(() => import("@/components/GroupInfoModal"), { ssr: false });
const OnlineMembersModal = dynamic(() => import("@/components/OnlineMembersModal"), { ssr: false });
const FamilyGroupCallModal = dynamic(() => import("@/components/FamilyGroupCallModal"), { ssr: false });
const ChatActionSheet = dynamic(() => import("./chat/ChatActionSheet"), { ssr: false });
const ChatLightbox = dynamic(() => import("./chat/ChatLightbox"), { ssr: false });

interface FamilyChatProps {
  messages: FamilyChatMessage[];
  members?: FamilyMember[];
  lang: Language;
  currentUsername: string | null;
  currentUserProfile: UserProfile | null;
  isAdmin: boolean;
  onlineCount?: number;
  onlineUsers?: UserPresence[];
  groupSettings?: GroupSettings;
  onUpdateGroupSettings?: (settings: Partial<GroupSettings>) => Promise<void>;
  typingUsers?: Record<string, { displayName: string; timestamp: number }>;
  onTypingChange?: (isTyping: boolean) => void;
  onSelectMemberProfile?: (member: FamilyMember) => void;
  onMarkRead?: () => void;
  onSend: (message: FamilyChatMessage) => Promise<void>;
  onUpdate?: (message: FamilyChatMessage) => Promise<void>;
  onDeleteOwn?: (id: string) => Promise<void>;
  onDeleteAdmin?: (id: string) => void;
  onQuickLogin?: (username: string, displayName: string) => Promise<void>;
}

export default function FamilyChat({
  messages,
  members = [],
  lang,
  currentUsername,
  currentUserProfile,
  isAdmin,
  onlineCount = 1,
  onlineUsers = [],
  groupSettings,
  onUpdateGroupSettings,
  typingUsers = {},
  onTypingChange,
  onSelectMemberProfile,
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

  // Download states
  const [downloadingImageId, setDownloadingImageId] = useState<string | null>(null);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  // Modal states
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
  const [isGroupCallModalOpen, setIsGroupCallModalOpen] = useState(false);

  // Mention system states
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");

  // Notification states
  const [notifPermission, setNotifPermission] = useState<string>("default");

  useEffect(() => {
    setNotifPermission(getNotificationPermission());
  }, []);

  const handleToggleNotification = async () => {
    const res = await requestChatNotificationPermission();
    setNotifPermission(res);
  };

  // Mark chat as read
  useEffect(() => {
    onMarkRead?.();
  }, [messages.length, onMarkRead]);

  // Check for prefilled wish text
  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefill = sessionStorage.getItem("bongsho_prefill_chat_text");
      if (prefill) {
        setText(prefill);
        sessionStorage.removeItem("bongsho_prefill_chat_text");
      }
    }
  }, []);

  // Interactive states
  const [replyingTo, setReplyingTo] = useState<FamilyChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<FamilyChatMessage | null>(null);
  const [activeMenuMessage, setActiveMenuMessage] = useState<FamilyChatMessage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Swipe-to-reply states
  const [swipingMsgId, setSwipingMsgId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const touchStartRef = useRef<{ x: number; y: number; time: number; msgId: string } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasVibratedSwipeRef = useRef<boolean>(false);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
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

    if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }

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
        setEditingMessage(null);
        setReplyingTo(msg);
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

  // Scroll tracking
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const prevMessagesCountRef = useRef(messages.length);

  // Lookup map for family members
  const memberByUsername = useMemo(() => {
    const map = new Map<string, FamilyMember>();
    for (const m of members) {
      if (m.username) map.set(m.username.toLowerCase(), m);
    }
    return map;
  }, [members]);

  const activeTypingNames = useMemo(() => {
    const entries = Object.entries(typingUsers).filter(([uname]) => uname !== currentUsername);
    if (entries.length === 0) return null;
    if (entries.length === 1) return entries[0][1].displayName;
    if (entries.length === 2) return `${entries[0][1].displayName}, ${entries[1][1].displayName}`;
    return `${entries[0][1].displayName} ${lang === "bn" ? "ও আরও অনেকে" : "and others"}`;
  }, [typingUsers, currentUsername, lang]);

  const mentionSuggestions = useMemo(() => {
    if (!showMentionSuggestions) return [];
    const q = mentionQuery.toLowerCase();
    return members
      .filter((m) => {
        const u = (m.username || "").toLowerCase();
        const bn = (m.nameBn || "").toLowerCase();
        const en = (m.nameEn || "").toLowerCase();
        return u.includes(q) || bn.includes(q) || en.includes(q);
      })
      .slice(0, 6);
  }, [members, showMentionSuggestions, mentionQuery]);

  const pinnedMessages = useMemo(() => messages.filter((m) => m.isPinned), [messages]);
  const latestPinned = pinnedMessages.length > 0 ? pinnedMessages[pinnedMessages.length - 1] : null;

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

  useEffect(() => {
    scrollToBottom("auto");
  }, []);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isUp = distanceFromBottom > 140;
    setShowScrollBottom(isUp);
    if (!isUp) setUnreadCount(0);
  };

  const scrollToMessage = (msgId: string) => {
    const el = document.getElementById(`chat-msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedId(msgId);
      setTimeout(() => setHighlightedId((prev) => (prev === msgId ? null : prev)), 2000);
    }
  };

  const getDisplayAuthorName = (msg: FamilyChatMessage) => {
    if (lang === "bn") return msg.authorNameBn || msg.authorName || msg.authorUsername;
    return msg.authorNameEn || msg.authorName || msg.authorUsername;
  };

  const handleOpenProfile = (
    username: string,
    authorDisplayName: string,
    photoUrl?: string
  ) => {
    const norm = username.toLowerCase().replace(/^@/, "");
    const matched = memberByUsername.get(norm);
    if (matched) {
      onSelectMemberProfile?.(matched);
      return;
    }
    const pseudo: FamilyMember = {
      id: `user-${norm}`,
      username: norm,
      nameBn: authorDisplayName,
      nameEn: authorDisplayName,
      gender: "male",
      generation: 1,
      branchId: "root",
      isAlive: true,
      bloodGroup: "Unknown",
      professionBn: "",
      professionEn: "",
      locationBn: "",
      locationEn: "",
      bioBn: "",
      bioEn: "",
      photoUrl,
    };
    onSelectMemberProfile?.(pseudo);
  };

  const handleDownloadImage = async (url: string, id: string) => {
    try {
      setDownloadingImageId(id);
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `bongsho-photo-${id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      setDownloadToast(lang === "bn" ? "ছবি ডিভাইসে সংরক্ষণ হয়েছে!" : "Photo saved to device!");
      setTimeout(() => setDownloadToast(null), 2500);
    } catch {
      setDownloadToast(lang === "bn" ? "ডাউনলোড ব্যর্থ হয়েছে, আবার চেষ্টা করুন।" : "Download failed, please retry.");
      setTimeout(() => setDownloadToast(null), 3000);
    } finally {
      setDownloadingImageId(null);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingImage(true);
    try {
      const compressed = await compressImageFile(file, 880, 0.76);
      setSelectedImage(compressed);
    } catch {
      alert(lang === "bn" ? "ছবি প্রসেস করা যায়নি।" : "Could not process image.");
    } finally {
      setIsCompressingImage(false);
    }
  };

  const handleTextChange = (val: string) => {
    setText(val);
    const lastAtIdx = val.lastIndexOf("@");
    if (lastAtIdx >= 0) {
      const afterAt = val.slice(lastAtIdx + 1);
      if (!afterAt.includes(" ") && !afterAt.includes("\n")) {
        setMentionQuery(afterAt);
        setShowMentionSuggestions(true);
      } else {
        setShowMentionSuggestions(false);
      }
    } else {
      setShowMentionSuggestions(false);
    }

    onTypingChange?.(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTypingChange?.(false);
    }, 2600);
  };

  const handleSelectMention = (member: FamilyMember) => {
    const handle = member.username || member.nameEn.toLowerCase().replace(/[^a-z0-9]/g, "");
    const lastAtIdx = text.lastIndexOf("@");
    if (lastAtIdx >= 0) {
      const prefix = text.slice(0, lastAtIdx);
      setText(`${prefix}@${handle} `);
    }
    setShowMentionSuggestions(false);
  };

  const handleSendVoice = async (audioUrl: string, durationSeconds: number) => {
    if (!currentUsername || isSending) return;
    setIsSending(true);

    try {
      const authorNameBn = currentUserProfile?.nameBn || currentUserProfile?.nameEn || currentUsername;
      const authorNameEn = currentUserProfile?.nameEn || currentUserProfile?.nameBn || currentUsername;

      const newMsg: FamilyChatMessage = {
        id: `chat-${Date.now()}`,
        text: "",
        audioUrl,
        audioDuration: durationSeconds,
        authorUsername: currentUsername,
        authorName: lang === "bn" ? authorNameBn : authorNameEn,
        authorNameBn,
        authorNameEn,
        authorCountry: currentUserProfile?.countryBn || currentUserProfile?.countryEn,
        authorPhotoUrl: currentUserProfile?.photoUrl || undefined,
        createdAt: new Date().toISOString(),
        replyTo: replyingTo
          ? {
              id: replyingTo.id,
              authorName: getDisplayAuthorName(replyingTo),
              text: replyingTo.text.slice(0, 140) || (replyingTo.audioUrl ? "🎤 Voice Note" : "📷 Photo"),
            }
          : undefined,
      };

      await onSend(newMsg);
      setReplyingTo(null);
      setTimeout(() => scrollToBottom("smooth"), 60);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendOrUpdate = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    const trimmed = text.trim();
    if ((!trimmed && !selectedImage) || !currentUsername || isSending) return;

    setIsSending(true);
    onTypingChange?.(false);

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
        const authorNameBn = currentUserProfile?.nameBn || currentUserProfile?.nameEn || currentUsername;
        const authorNameEn = currentUserProfile?.nameEn || currentUserProfile?.nameBn || currentUsername;

        const newMsg: FamilyChatMessage = {
          id: `chat-${Date.now()}`,
          text: trimmed,
          imageUrl: selectedImage || undefined,
          authorUsername: currentUsername,
          authorName: lang === "bn" ? authorNameBn : authorNameEn,
          authorNameBn,
          authorNameEn,
          authorCountry: currentUserProfile?.countryBn || currentUserProfile?.countryEn,
          authorPhotoUrl: currentUserProfile?.photoUrl || undefined,
          createdAt: new Date().toISOString(),
          replyTo: replyingTo
            ? {
                id: replyingTo.id,
                authorName: getDisplayAuthorName(replyingTo),
                text: replyingTo.text.slice(0, 140) || (replyingTo.audioUrl ? "🎤 Voice Note" : "📷 Photo"),
              }
            : undefined,
        };
        await onSend(newMsg);
        setReplyingTo(null);
        setText("");
        setSelectedImage(null);
        setShowMentionSuggestions(false);
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
      setShowMentionSuggestions(false);
    }
  };

  const handleToggleReaction = async (msg: FamilyChatMessage, emoji: string) => {
    if (!currentUsername) return;
    const currentReactions = { ...(msg.reactions || {}) };
    const usersForEmoji = currentReactions[emoji] ? [...currentReactions[emoji]] : [];
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

    const updated: FamilyChatMessage = { ...msg, reactions: currentReactions };
    setActiveMenuMessage(null);
    await (onUpdate ? onUpdate(updated) : onSend(updated));
  };

  const handleTogglePin = async (msg: FamilyChatMessage) => {
    const updated: FamilyChatMessage = { ...msg, isPinned: !msg.isPinned };
    setActiveMenuMessage(null);
    await (onUpdate ? onUpdate(updated) : onSend(updated));
  };

  const handleCopyText = async (msg: FamilyChatMessage) => {
    try {
      await navigator.clipboard.writeText(msg.text);
      setCopiedId(msg.id);
      setActiveMenuMessage(null);
      setTimeout(() => setCopiedId((prev) => (prev === msg.id ? null : prev)), 1800);
    } catch {}
  };

  const handleDeleteMessage = async (msg: FamilyChatMessage) => {
    setActiveMenuMessage(null);
    const isMine = msg.authorUsername === currentUsername;
    if (isMine && onDeleteOwn) {
      const confirmMsg = lang === "bn" ? "আপনি কি এই বার্তাটি মুছবেন?" : "Delete your message?";
      if (window.confirm(confirmMsg)) await onDeleteOwn(msg.id);
      return;
    }
    if (onDeleteAdmin) onDeleteAdmin(msg.id);
  };

  const currentDisplayName =
    lang === "bn"
      ? currentUserProfile?.nameBn || currentUserProfile?.nameEn || currentUsername || ""
      : currentUserProfile?.nameEn || currentUserProfile?.nameBn || currentUsername || "";

  const handleStartGroupCall = async () => {
    setIsGroupCallModalOpen(true);
    if (currentUsername) {
      const authorName = currentDisplayName || currentUsername;
      const callMsg: FamilyChatMessage = {
        id: `chat-call-${Date.now()}`,
        text:
          lang === "bn"
            ? `📞 ${authorName} একটি ফ্যামিলি গ্রুপ কল শুরু করেছেন! যুক্ত হতে নিচের বাটনে ট্যাপ করুন।`
            : `📞 ${authorName} started a Family Group Call! Tap below to join.`,
        authorUsername: currentUsername,
        authorName,
        authorNameBn: currentUserProfile?.nameBn,
        authorNameEn: currentUserProfile?.nameEn,
        authorCountry: currentUserProfile?.countryBn || currentUserProfile?.countryEn,
        authorPhotoUrl: currentUserProfile?.photoUrl || undefined,
        createdAt: new Date().toISOString(),
      };
      await onSend(callMsg);
    }
  };

  return (
    <section className="w-full h-full flex-1 flex flex-col min-h-0 bg-white border-0 rounded-none shadow-none overflow-hidden relative">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-950 text-white px-4 py-2 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 border border-emerald-700 animate-in fade-in slide-in-from-top duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* CHAT HEADER */}
      <ChatHeader
        groupSettings={groupSettings}
        messagesCount={messages.length}
        onlineCount={onlineCount}
        pinnedCount={pinnedMessages.length}
        showPinnedOnly={showPinnedOnly}
        notifPermission={notifPermission}
        isSearchOpen={isSearchOpen}
        currentUsername={currentUsername}
        currentUserProfile={currentUserProfile}
        currentDisplayName={currentDisplayName}
        lang={lang}
        onOpenGroupInfo={() => setIsGroupInfoOpen(true)}
        onOpenOnlineMembers={() => setIsOnlineModalOpen(true)}
        onStartGroupCall={handleStartGroupCall}
        onTogglePinnedFilter={() => setShowPinnedOnly((p) => !p)}
        onToggleNotification={handleToggleNotification}
        onToggleSearch={() => {
          setIsSearchOpen((p) => !p);
          if (isSearchOpen) setSearchQuery("");
        }}
      />

      {/* PINNED & SEARCH BANNER */}
      <ChatPinnedBanner
        isSearchOpen={isSearchOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCloseSearch={() => {
          setIsSearchOpen(false);
          setSearchQuery("");
        }}
        latestPinned={latestPinned}
        showPinnedOnly={showPinnedOnly}
        pinnedCount={pinnedMessages.length}
        isAdmin={isAdmin}
        currentUsername={currentUsername}
        lang={lang}
        onScrollToMessage={scrollToMessage}
        onTogglePin={handleTogglePin}
        onShowAll={() => setShowPinnedOnly(false)}
        getDisplayAuthorName={getDisplayAuthorName}
      />

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
              {lang === "bn"
                ? "প্রথম বার্তাটি পাঠিয়ে কথোপকথন শুরু করুন!"
                : "Write a message to start the family conversation!"}
            </p>
          </div>
        ) : (
          filteredMessages.map((message, index) => {
            const isMine = message.authorUsername === currentUsername;
            const prevMsg = index > 0 ? filteredMessages[index - 1] : null;
            const nextMsg = index < filteredMessages.length - 1 ? filteredMessages[index + 1] : null;

            const currentDateLabel = formatDateLabel(message.createdAt, lang);
            const prevDateLabel = prevMsg ? formatDateLabel(prevMsg.createdAt, lang) : null;
            const showDateDivider = currentDateLabel !== prevDateLabel;

            const isGroupedWithPrev =
              !showDateDivider &&
              prevMsg !== null &&
              prevMsg.authorUsername === message.authorUsername &&
              Math.abs(new Date(message.createdAt).getTime() - new Date(prevMsg.createdAt).getTime()) < 5 * 60 * 1000;

            const isGroupedWithNext =
              nextMsg !== null &&
              formatDateLabel(nextMsg.createdAt, lang) === currentDateLabel &&
              nextMsg.authorUsername === message.authorUsername &&
              Math.abs(new Date(nextMsg.createdAt).getTime() - new Date(message.createdAt).getTime()) < 5 * 60 * 1000;

            const matchedMember = memberByUsername.get(message.authorUsername.toLowerCase());
            const authorDisplayName = getDisplayAuthorName(message);

            return (
              <React.Fragment key={message.id}>
                {showDateDivider && currentDateLabel && (
                  <div className="flex items-center justify-center my-3">
                    <span className="px-3 py-1 rounded-full bg-stone-200/85 backdrop-blur-xs text-stone-700 text-[11px] font-bold shadow-2xs border border-stone-300/60">
                      {currentDateLabel}
                    </span>
                  </div>
                )}

                <ChatMessageItem
                  message={message}
                  isMine={isMine}
                  isGroupedWithPrev={isGroupedWithPrev}
                  isGroupedWithNext={isGroupedWithNext}
                  matchedMember={matchedMember}
                  authorDisplayName={authorDisplayName}
                  lang={lang}
                  currentUsername={currentUsername}
                  swipingMsgId={swipingMsgId}
                  swipeOffset={swipeOffset}
                  highlightedId={highlightedId}
                  copiedId={copiedId}
                  downloadingImageId={downloadingImageId}
                  onTouchStart={(e) => handleTouchStart(message, e)}
                  onTouchMove={(e) => handleTouchMove(message, e)}
                  onTouchEnd={() => handleTouchEnd(message)}
                  onTouchCancel={handleTouchCancel}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setActiveMenuMessage(message);
                  }}
                  onOpenProfile={handleOpenProfile}
                  onScrollToMessage={scrollToMessage}
                  onLightboxImage={setLightboxImage}
                  onDownloadImage={handleDownloadImage}
                  onOpenMenu={() => setActiveMenuMessage(message)}
                  onToggleReaction={(emoji) => handleToggleReaction(message, emoji)}
                  onOpenCallRoom={() => setIsGroupCallModalOpen(true)}
                />
              </React.Fragment>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* FLOATING SCROLL-TO-BOTTOM BUTTON */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom("smooth")}
          className="absolute right-4 bottom-20 z-30 p-2.5 rounded-full bg-emerald-900 text-amber-300 shadow-lg border border-emerald-700/80 hover:bg-emerald-800 active:scale-95 transition flex items-center gap-1.5 cursor-pointer animate-in fade-in zoom-in-75 duration-150"
        >
          <ArrowDown className="w-4 h-4 stroke-[2.5]" />
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-emerald-950 text-[10px] font-black">
              {unreadCount}
            </span>
          )}
          <span className="text-xs font-bold hidden sm:inline">
            {lang === "bn" ? "নিচে যান" : "Bottom"}
          </span>
        </button>
      )}

      {/* INPUT BAR OR QUICK LOGIN */}
      {currentUsername ? (
        <ChatInputBar
          text={text}
          onTextChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onSubmit={handleSendOrUpdate}
          selectedImage={selectedImage}
          onClearSelectedImage={() => setSelectedImage(null)}
          onSelectImage={handleImageSelect}
          isCompressingImage={isCompressingImage}
          isSending={isSending}
          editingMessage={editingMessage}
          onCancelEdit={() => {
            setEditingMessage(null);
            setText("");
          }}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          getDisplayAuthorName={getDisplayAuthorName}
          activeTypingNames={activeTypingNames}
          showMentionSuggestions={showMentionSuggestions}
          mentionSuggestions={mentionSuggestions}
          onSelectMention={handleSelectMention}
          onSendVoice={handleSendVoice}
          currentUsername={currentUsername}
          lang={lang}
        />
      ) : (
        <ChatQuickLoginForm lang={lang} onQuickLogin={onQuickLogin} />
      )}

      {/* FULLSCREEN IMAGE LIGHTBOX */}
      {lightboxImage && (
        <ChatLightbox
          imageUrl={lightboxImage}
          onClose={() => setLightboxImage(null)}
          onDownload={handleDownloadImage}
          lang={lang}
        />
      )}

      {/* ACTION SHEET / LONG-PRESS MODAL */}
      {activeMenuMessage && (
        <ChatActionSheet
          message={activeMenuMessage}
          onClose={() => setActiveMenuMessage(null)}
          currentUsername={currentUsername}
          isAdmin={isAdmin}
          lang={lang}
          onToggleReaction={handleToggleReaction}
          onStartReply={(msg) => {
            setEditingMessage(null);
            setReplyingTo(msg);
          }}
          onDownloadImage={handleDownloadImage}
          onOpenProfile={handleOpenProfile}
          onCopyText={handleCopyText}
          onTogglePin={handleTogglePin}
          onStartEdit={(msg) => {
            setReplyingTo(null);
            setEditingMessage(msg);
            setText(msg.text);
          }}
          onDeleteMessage={handleDeleteMessage}
          getDisplayAuthorName={getDisplayAuthorName}
        />
      )}

      {/* GROUP INFORMATION & SETTINGS MODAL */}
      {groupSettings && isGroupInfoOpen && (
        <GroupInfoModal
          isOpen={isGroupInfoOpen}
          onClose={() => setIsGroupInfoOpen(false)}
          settings={groupSettings}
          members={members}
          onlineUsers={onlineUsers}
          isAdmin={isAdmin}
          lang={lang}
          onUpdateSettings={onUpdateGroupSettings || (async () => {})}
          onSelectMember={(m) => {
            setIsGroupInfoOpen(false);
            onSelectMemberProfile?.(m);
          }}
        />
      )}

      {/* ONLINE MEMBERS MODAL */}
      {isOnlineModalOpen && (
        <OnlineMembersModal
          isOpen={isOnlineModalOpen}
          onClose={() => setIsOnlineModalOpen(false)}
          onlineUsers={onlineUsers}
          members={members}
          lang={lang}
          onSelectMember={(m) => {
            setIsOnlineModalOpen(false);
            onSelectMemberProfile?.(m);
          }}
        />
      )}

      {/* FAMILY GROUP CALL MODAL */}
      {isGroupCallModalOpen && (
        <FamilyGroupCallModal
          isOpen={isGroupCallModalOpen}
          onClose={() => setIsGroupCallModalOpen(false)}
          roomName="Bongsho_Family_Group_Room_2026"
          userName={currentDisplayName || currentUsername || "Family Member"}
          userPhoto={currentUserProfile?.photoUrl}
          lang={lang}
        />
      )}
    </section>
  );
}
