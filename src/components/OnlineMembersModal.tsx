"use client";

import React from "react";
import { X, Users, ArrowUpRight } from "lucide-react";
import { Language, UserPresence, FamilyMember } from "@/types/family";

interface OnlineMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onlineUsers: UserPresence[];
  members: FamilyMember[];
  lang: Language;
  onSelectMember: (member: FamilyMember) => void;
}

export default function OnlineMembersModal({
  isOpen,
  onClose,
  onlineUsers,
  members,
  lang,
  onSelectMember,
}: OnlineMembersModalProps) {
  if (!isOpen) return null;

  const memberByUsername = new Map<string, FamilyMember>();
  members.forEach((m) => {
    if (m.username) {
      memberByUsername.set(m.username.toLowerCase(), m);
    }
  });

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-emerald-400/30 animate-pulse" />
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {lang === "bn" ? "অনলাইন পরিবার সদস্য" : "Online Family Members"}
              </h3>
              <p className="text-xs text-emerald-200/80">
                {onlineUsers.length}{" "}
                {lang === "bn" ? "জন এখন সক্রিয় আছেন" : "currently active"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member List */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2 flex-1">
          {onlineUsers.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-sm">
              <Users className="w-8 h-8 mx-auto mb-2 text-stone-400 opacity-60" />
              <p>
                {lang === "bn"
                  ? "বর্তমানে কেউ অনলাইনে নেই"
                  : "No family members currently online"}
              </p>
            </div>
          ) : (
            onlineUsers.map((user) => {
              const matchedMember = memberByUsername.get(user.username.toLowerCase());
              const displayName =
                user.displayName ||
                matchedMember?.nameBn ||
                matchedMember?.nameEn ||
                `@${user.username}`;

              return (
                <div
                  key={user.username}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-stone-50 hover:bg-emerald-50/50 border border-stone-200/80 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      {user.photoUrl || matchedMember?.photoUrl ? (
                        <img
                          src={user.photoUrl || matchedMember?.photoUrl}
                          alt={displayName}
                          className="w-10 h-10 rounded-2xl object-cover border border-emerald-600/30"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-amber-300 font-bold flex items-center justify-center text-sm shadow-xs">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </div>

                    <div className="min-w-0">
                      <p className="font-bold text-stone-900 text-sm truncate">
                        {displayName}
                      </p>
                      <p className="text-[11px] text-stone-400 font-mono truncate">
                        @{user.username}
                      </p>
                    </div>
                  </div>

                  {matchedMember ? (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectMember(matchedMember);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-white border border-stone-200 text-emerald-800 text-xs font-bold hover:bg-emerald-50 cursor-pointer transition flex items-center gap-1 shadow-2xs"
                    >
                      <span>{lang === "bn" ? "প্রোফাইল" : "Profile"}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      {lang === "bn" ? "অনলাইন" : "Active"}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
