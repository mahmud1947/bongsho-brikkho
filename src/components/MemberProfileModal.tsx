"use client";

import React from "react";
import {
  X,
  Heart,
  MapPin,
  Briefcase,
  GraduationCap,
  Phone,
  Mail,
  Droplets,
  Calendar,
  UserPlus,
  Edit3,
  Trash2,
  ArrowUpRight,
  Globe,
} from "lucide-react";
import { FamilyBranch, FamilyMember, Language } from "@/types/family";

interface MemberProfileModalProps {
  member: FamilyMember | null;
  allMembers: FamilyMember[];
  branches: FamilyBranch[];
  lang: Language;
  onClose: () => void;
  onSelectMember: (m: FamilyMember) => void;
  onEditMember: (m: FamilyMember) => void;
  onAddChild: (parent: FamilyMember) => void;
  onDeleteMember: (id: string) => void;
}

export default function MemberProfileModal({
  member,
  allMembers,
  branches,
  lang,
  onClose,
  onSelectMember,
  onEditMember,
  onAddChild,
  onDeleteMember,
}: MemberProfileModalProps) {
  if (!member) return null;

  const parent = allMembers.find((m) => m.id === member.parentId) || null;
  const children = allMembers.filter((m) => m.parentId === member.id);
  const siblings = member.parentId
    ? allMembers.filter((m) => m.parentId === member.parentId && m.id !== member.id)
    : [];
  const branch = branches.find((b) => b.id === member.branchId);

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-emerald-950 p-4 sm:p-5 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5 pr-8">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-emerald-950 font-extrabold text-lg flex items-center justify-center flex-shrink-0">
              G{member.generation}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                {branch && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-800 text-emerald-100">
                    {lang === "bn" ? branch.nameBn : branch.nameEn}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/20 text-stone-100">
                  {member.gender === "female" ? (lang === "bn" ? "নারী" : "Female") : (lang === "bn" ? "পুরুষ" : "Male")}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/15 text-amber-200">
                  {member.isAlive ? (lang === "bn" ? "জীবিত" : "Living") : lang === "bn" ? "প্রয়াত" : "Late"}
                </span>
              </div>
              <h2 className="text-lg font-bold truncate">
                {lang === "bn" ? member.nameBn : member.nameEn}
              </h2>
              {(member.nicknameBn || member.nicknameEn) && (
                <p className="text-xs text-amber-300 font-semibold">
                  {lang === "bn" ? member.nicknameBn : member.nicknameEn}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <Briefcase className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span className="font-semibold text-stone-800 truncate">
                {lang === "bn" ? member.professionBn : member.professionEn}
              </span>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <Globe className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="font-semibold text-stone-800 truncate">
                {lang === "bn"
                  ? member.countryBn || "বাংলাদেশ"
                  : member.countryEn || "Bangladesh"}
              </span>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="font-semibold text-stone-800 truncate">
                {lang === "bn" ? member.locationBn : member.locationEn}
              </span>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <Calendar className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span className="font-semibold text-stone-800">
                {member.birthYear || "?"} — {member.isAlive ? (lang === "bn" ? "বর্তমান" : "Now") : member.deathYear || "?"}
              </span>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
              <Droplets className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span className="font-bold text-rose-700">{member.bloodGroup}</span>
            </div>

            {(member.educationBn || member.educationEn) && (
              <div className="col-span-2 flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                <GraduationCap className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span className="font-semibold text-stone-800 truncate">
                  {lang === "bn" ? member.educationBn : member.educationEn}
                </span>
              </div>
            )}

            {(member.spouseNameBn || member.spouseNameEn) && (
              <div className="col-span-2 p-3 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>{lang === "bn" ? "জীবনসঙ্গী" : "Spouse"}</span>
                </div>
                <div className="pl-5 text-xs text-stone-700 space-y-1">
                  <p className="font-bold text-stone-900 text-sm">
                    {lang === "bn" ? member.spouseNameBn : member.spouseNameEn}
                  </p>
                  {(member.spouseProfessionBn || member.spouseProfessionEn) && (
                    <p className="text-stone-600 flex items-center gap-1">
                      <span>💼</span>
                      <span>{lang === "bn" ? member.spouseProfessionBn : member.spouseProfessionEn}</span>
                    </p>
                  )}
                  {member.spousePhone && (
                    <p className="text-stone-600 flex items-center gap-1">
                      <span>📞</span>
                      <a href={`tel:${member.spousePhone}`} className="text-emerald-800 font-bold hover:underline">
                        {member.spousePhone}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}

            {member.phone && (
              <a
                href={`tel:${member.phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 font-bold text-emerald-950 hover:bg-emerald-100 transition"
              >
                <Phone className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span className="truncate">{member.phone}</span>
              </a>
            )}

            {(member.whatsapp || member.phone) && (
              <a
                href={`https://wa.me/${(member.whatsapp || member.phone || "").replace(/\D/g, "").replace(/^01/, "8801")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300 font-bold text-emerald-950 hover:bg-emerald-200 transition"
              >
                <span className="text-base">💬</span>
                <span className="truncate">WhatsApp</span>
              </a>
            )}

            {member.socialLink && (
              <a
                href={member.socialLink.startsWith("http") ? member.socialLink : `https://${member.socialLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-2 flex items-center gap-2.5 p-2.5 rounded-xl bg-blue-50 border border-blue-200 font-bold text-blue-900 hover:bg-blue-100 transition"
              >
                <span className="text-base">🌐</span>
                <span className="truncate">{lang === "bn" ? "সোশ্যাল প্রোফাইল" : "Social Profile"}</span>
              </a>
            )}

            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-100 font-semibold text-stone-800"
              >
                <Mail className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span className="truncate">{member.email}</span>
              </a>
            )}
          </div>

          {/* Relatives */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            {parent && (
              <div>
                <p className="text-xs font-bold text-stone-500 mb-1">
                  {lang === "bn" ? "পিতা" : "Parent"}
                </p>
                <button
                  onClick={() => onSelectMember(parent)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-950 border border-emerald-200 text-xs font-bold cursor-pointer"
                >
                  <span>{lang === "bn" ? parent.nameBn : parent.nameEn}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {children.length > 0 && (
              <div>
                <p className="text-xs font-bold text-stone-500 mb-1">
                  {lang === "bn" ? "সন্তান" : "Children"} ({children.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {children.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onSelectMember(c)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-950 border border-amber-200 text-xs font-bold cursor-pointer"
                    >
                      <span>{lang === "bn" ? c.nameBn : c.nameEn}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {siblings.length > 0 && (
              <div>
                <p className="text-xs font-bold text-stone-500 mb-1">
                  {lang === "bn" ? "ভাই-বোন" : "Siblings"} ({siblings.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {siblings.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onSelectMember(s)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 text-stone-800 text-xs font-semibold cursor-pointer"
                    >
                      <span>{lang === "bn" ? s.nameBn : s.nameEn}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2">
          <button
            onClick={() => onDeleteMember(member.id)}
            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
            title={lang === "bn" ? "ডিলিট" : "Delete"}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onClose();
              onEditMember(member);
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white border border-stone-300 text-xs font-bold text-stone-800 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {lang === "bn" ? "এডিট" : "Edit"}
          </button>

          <button
            onClick={() => {
              onClose();
              onAddChild(member);
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-900 text-amber-300 text-xs font-bold cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            {lang === "bn" ? "সন্তান অ্যাড" : "Add Child"}
          </button>
        </div>
      </div>
    </div>
  );
}
