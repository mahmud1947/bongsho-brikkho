"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Camera,
  Edit2,
  Check,
  ShieldCheck,
  Search,
  Users,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Info,
} from "lucide-react";
import {
  FamilyMember,
  GroupSettings,
  Language,
  UserPresence,
} from "@/types/family";
import { compressImageFile } from "@/lib/imageUtils";

interface GroupInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GroupSettings;
  members: FamilyMember[];
  onlineUsers: UserPresence[];
  isAdmin: boolean;
  lang: Language;
  onUpdateSettings: (newSettings: Partial<GroupSettings>) => Promise<void>;
  onSelectMember: (member: FamilyMember) => void;
}

export default function GroupInfoModal({
  isOpen,
  onClose,
  settings,
  members,
  onlineUsers,
  isAdmin,
  lang,
  onUpdateSettings,
  onSelectMember,
}: GroupInfoModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [nameBn, setNameBn] = useState(
    settings.groupNameBn && !/bongsho|বংশবৃক্ষ/i.test(settings.groupNameBn)
      ? settings.groupNameBn
      : "Family Chat"
  );
  const [nameEn, setNameEn] = useState(
    settings.groupNameEn && !/bongsho|বংশবৃক্ষ/i.test(settings.groupNameEn)
      ? settings.groupNameEn
      : "Family Chat"
  );
  const [descBn, setDescBn] = useState(settings.descriptionBn || "পরিবারের সবার সাথে আনন্দ ও সুখ-দুঃখ ভাগাভাগি করার স্থান।");
  const [descEn, setDescEn] = useState(settings.descriptionEn || "Official communication space for all family members.");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Build online status lookup map
  const onlineUserSet = new Set(
    onlineUsers.map((u) => u.username.toLowerCase())
  );

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isAdmin) return;

    setIsUploadingPhoto(true);
    try {
      const compressed = await compressImageFile(file, 800, 0.82);
      await onUpdateSettings({ logoUrl: compressed });
    } catch (err) {
      console.error("Group logo upload error:", err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || isSaving) return;

    setIsSaving(true);
    try {
      await onUpdateSettings({
        groupNameBn: nameBn.trim() || settings.groupNameBn,
        groupNameEn: nameEn.trim() || settings.groupNameEn,
        descriptionBn: descBn.trim() || settings.descriptionBn,
        descriptionEn: descEn.trim() || settings.descriptionEn,
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.nameBn.toLowerCase().includes(q) ||
      m.nameEn.toLowerCase().includes(q) ||
      m.username?.toLowerCase().includes(q) ||
      m.professionBn.toLowerCase().includes(q)
    );
  });

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
      >
        {/* Top Sticky Header */}
        <div className="bg-emerald-950 p-4 text-white flex items-center justify-between border-b border-emerald-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base sm:text-lg">
              {lang === "bn" ? "গ্রুপ তথ্য ও সদস্যবৃন্দ" : "Group Info & Members"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 divide-y divide-stone-100">
          {/* 1. EXPANDABLE GROUP PROFILE SECTION */}
          <div className="p-4 sm:p-5 bg-gradient-to-b from-stone-50 to-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Group Logo with Admin Camera Edit */}
                <div className="relative flex-shrink-0">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  {settings.logoUrl ? (
                    <img
                      src={settings.logoUrl}
                      alt="Group Logo"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl object-cover border-2 border-emerald-700 shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-400 text-emerald-950 font-black text-2xl flex items-center justify-center shadow-md">
                      🌳
                    </div>
                  )}

                  {isAdmin && (
                    <button
                      type="button"
                      disabled={isUploadingPhoto}
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-emerald-900 text-amber-300 hover:bg-emerald-800 shadow-md border-2 border-white cursor-pointer"
                      title={lang === "bn" ? "লোগো পরিবর্তন করুন" : "Change group logo"}
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-black text-stone-900 truncate">
                    {lang === "bn" ? settings.groupNameBn : settings.groupNameEn}
                  </h2>
                  <p className="text-xs text-stone-500 font-semibold flex items-center gap-1.5 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-emerald-700" />
                    <span>
                      {members.length} {lang === "bn" ? "জন সদস্য" : "members"}
                    </span>
                    <span className="text-emerald-700 font-bold">
                      • {onlineUsers.length} {lang === "bn" ? "অনলাইন" : "online"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {isAdmin && !isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer transition text-xs font-bold flex items-center gap-1"
                    title={lang === "bn" ? "তথ্য সম্পাদনা" : "Edit Info"}
                  >
                    <Edit2 className="w-3.5 h-3.5 text-emerald-800" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 cursor-pointer transition"
                  title={isHeaderExpanded ? "সংক্ষেপ করুন" : "বিস্তারিত দেখুন"}
                >
                  {isHeaderExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Expandable Group Description / Edit Form */}
            {isHeaderExpanded && (
              <div className="mt-4 pt-3 border-t border-stone-200/80 animate-in fade-in duration-150">
                {isEditing ? (
                  <form onSubmit={handleSaveInfo} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-stone-600 block mb-1">
                        {lang === "bn" ? "গ্রুপের নাম (বাংলা)" : "Group Name (Bengali)"}
                      </label>
                      <input
                        type="text"
                        value={nameBn}
                        onChange={(e) => setNameBn(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-600 block mb-1">
                        {lang === "bn" ? "গ্রুপের নাম (English)" : "Group Name (English)"}
                      </label>
                      <input
                        type="text"
                        value={nameEn}
                        onChange={(e) => setNameEn(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-600 block mb-1">
                        {lang === "bn" ? "গ্রুপের বিবরণ (বাংলা)" : "Description (Bengali)"}
                      </label>
                      <textarea
                        rows={2}
                        value={descBn}
                        onChange={(e) => setDescBn(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200 cursor-pointer"
                      >
                        {lang === "bn" ? "বাতিল" : "Cancel"}
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-4 py-1.5 rounded-xl bg-emerald-900 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{lang === "bn" ? "সংরক্ষণ করুন" : "Save"}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {lang === "bn" ? settings.descriptionBn : settings.descriptionEn}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. GROUP MEMBERS LIST */}
          <div className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <span>{lang === "bn" ? "সদস্যবৃন্দ" : "Group Members"}</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700">
                  {members.length}
                </span>
              </h4>

              {/* Member Search */}
              <div className="relative w-40 sm:w-48">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === "bn" ? "সদস্য খুঁজুন..." : "Search..."}
                  className="w-full pl-8 pr-2.5 py-1 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
              {filteredMembers.map((member) => {
                const name = lang === "bn" ? member.nameBn : member.nameEn;
                const isOnline =
                  member.username &&
                  onlineUserSet.has(member.username.toLowerCase());

                return (
                  <div
                    key={member.id}
                    onClick={() => {
                      onClose();
                      onSelectMember(member);
                    }}
                    className="flex items-center justify-between p-2 rounded-2xl hover:bg-stone-50 border border-transparent hover:border-stone-200 cursor-pointer transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative flex-shrink-0">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={name}
                            className="w-10 h-10 rounded-2xl object-cover border border-stone-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-2xl bg-emerald-900 text-amber-300 font-bold flex items-center justify-center text-sm">
                            {name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {/* Online Dot */}
                        {isOnline ? (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                        ) : (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-stone-300 ring-2 ring-white" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-stone-800 text-xs sm:text-sm truncate group-hover:text-emerald-900 transition">
                            {name}
                          </p>
                          {member.username === "mahmud" && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-amber-400/20 text-amber-800 text-[9px] font-black border border-amber-300">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-400 font-mono truncate">
                          {member.username ? `@${member.username}` : `G${member.generation} • ${member.professionBn || member.professionEn}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOnline
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {isOnline ? (lang === "bn" ? "অনলাইন" : "Online") : (lang === "bn" ? "অফলাইন" : "Offline")}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-800 transition" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
