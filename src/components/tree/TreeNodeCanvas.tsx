"use client";

import React from "react";
import {
  ChevronDown,
  ChevronRight,
  UserPlus,
  MapPin,
  Phone,
  MessageSquare,
  Share2,
  Info,
} from "lucide-react";
import { FamilyMember, Language, formatSocialUrl } from "@/types/family";
import CountryFlag from "@/components/CountryFlag";
import { getBranchStyle, formatWhatsappUrl } from "./treeUtils";

interface TreeNodeCanvasProps {
  member: FamilyMember;
  childrenMap: Record<string, FamilyMember[]>;
  collapsedIds: Record<string, boolean>;
  highlightedId: string | null;
  lang: Language;
  onNodeTap: (member: FamilyMember, e?: React.MouseEvent) => void;
  onSelectMember: (member: FamilyMember) => void;
  onAddChildToMember: (parentMember: FamilyMember | null) => void;
}

const TreeNodeCanvas = React.memo(function TreeNodeCanvas({
  member,
  childrenMap,
  collapsedIds,
  highlightedId,
  lang,
  onNodeTap,
  onSelectMember,
  onAddChildToMember,
}: TreeNodeCanvasProps) {
  const visibleChildren = childrenMap[member.id] || [];
  const hasChildren = visibleChildren.length > 0;
  const isCollapsed = !!collapsedIds[member.id];
  const style = getBranchStyle(member.branchId);

  const displayName = lang === "bn" ? member.nameBn || member.nameEn : member.nameEn || member.nameBn;
  const displayLocation =
    lang === "bn" ? member.locationBn || member.locationEn : member.locationEn || member.locationBn;
  const genderLetter = member.gender === "female" ? "F" : "M";

  return (
    <div className="flex flex-col items-center relative px-1">
      <div
        id={`tree-node-${member.id}`}
        onClick={(e) => onNodeTap(member, e)}
        className={`w-44 sm:w-48 rounded-xl bg-white border-2 ${style.border} shadow-sm hover:shadow-lg transition cursor-pointer relative ${
          highlightedId === member.id ? "ring-2 ring-amber-400" : ""
        }`}
      >
        {/* Header: G{generation} • M/F (Left) | Late (if deceased) + Flag (Right) */}
        <div className={`px-2 py-1 rounded-t-[10px] flex items-center justify-between text-[10px] font-bold ${style.header}`}>
          <div className="flex items-center gap-1">
            <span>G{member.generation}</span>
            <span>•</span>
            <span>{genderLetter}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {!member.isAlive && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/30 text-stone-100 font-semibold leading-none">
                Late
              </span>
            )}
            <CountryFlag
              country={member.countryBn || member.countryEn}
              title={member.countryBn || member.countryEn || "Bangladesh"}
              className="w-5 h-3.5 shadow-xs"
            />
          </div>
        </div>

        <div className="p-2 space-y-1">
          {/* Name + Profile Info */}
          <div>
            <div className="flex items-center justify-between gap-1">
              <h3
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectMember(member);
                }}
                className="font-bold text-stone-900 text-xs sm:text-sm leading-tight truncate hover:text-emerald-700 cursor-pointer flex-1"
                title={lang === "bn" ? "প্রোফাইল দেখতে ক্লিক করুন" : "Click to view profile"}
              >
                {displayName}
              </h3>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectMember(member);
                }}
                className="p-0.5 rounded text-stone-400 hover:text-emerald-800 hover:bg-emerald-50 transition cursor-pointer flex-shrink-0"
                title={lang === "bn" ? "প্রোফাইল দেখুন" : "View Profile"}
              >
                <Info className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Address (Country text omitted since flag is in header) */}
          {displayLocation && (
            <p className="truncate flex items-center gap-1 text-[10px] text-stone-600">
              <MapPin className="w-2.5 h-2.5 text-amber-600 flex-shrink-0" />
              <span className="truncate">{displayLocation}</span>
            </p>
          )}

          {/* Phone & Contact Icons & Add Child */}
          <div className="flex items-center justify-between gap-1 pt-1 border-t border-stone-100 text-[10px]">
            {member.phone ? (
              <a
                href={`tel:${member.phone.replace(/\s+/g, "")}`}
                onClick={(e) => e.stopPropagation()}
                className="truncate flex items-center gap-1 text-emerald-800 font-bold hover:underline"
                title={member.phone}
              >
                <Phone className="w-2.5 h-2.5 text-emerald-700 flex-shrink-0" />
                <span className="truncate">{member.phone}</span>
              </a>
            ) : (
              <span className="text-stone-300 text-[9px] italic truncate">
                {lang === "bn" ? "ফোন নেই" : "No phone"}
              </span>
            )}

            <div className="flex items-center gap-1 flex-shrink-0">
              {formatWhatsappUrl(member.whatsapp || member.phone) && (
                <a
                  href={formatWhatsappUrl(member.whatsapp || member.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-green-600 hover:text-green-700 p-0.5"
                  title="WhatsApp"
                >
                  <MessageSquare className="w-3 h-3" />
                </a>
              )}
              {member.socialLink && (
                <a
                  href={formatSocialUrl(member.socialLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-600 hover:text-blue-700 p-0.5"
                  title="Social Link"
                >
                  <Share2 className="w-3 h-3" />
                </a>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChildToMember(member);
                }}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[9px] font-bold cursor-pointer ml-0.5"
                title={lang === "bn" ? "সন্তান অ্যাড" : "Add Child"}
              >
                <UserPlus className="w-2.5 h-2.5" />
                <span>+</span>
              </button>
            </div>
          </div>
        </div>

        {hasChildren && (
          <button
            type="button"
            onClick={(e) => onNodeTap(member, e)}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-900 text-amber-300 text-[10px] font-bold shadow-md cursor-pointer hover:bg-emerald-800 active:scale-95 transition"
            title={
              isCollapsed
                ? lang === "bn"
                  ? "পরিবার নিচে দেখুন"
                  : "Expand family"
                : lang === "bn"
                ? "পরিবার বন্ধ করুন"
                : "Collapse"
            }
          >
            <span>{visibleChildren.length}</span>
            {isCollapsed ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
          </button>
        )}
      </div>

      {hasChildren && !isCollapsed && (
        <div className="flex flex-col items-center">
          <div className="w-0.5 h-5 bg-emerald-700/60" />
          <div className="flex items-start justify-center relative">
            {visibleChildren.map((child, idx) => {
              const isOnly = visibleChildren.length === 1;
              return (
                <div key={child.id} className="flex flex-col items-center relative">
                  {!isOnly && (
                    <div
                      className={`h-0.5 bg-emerald-700/60 absolute top-0 ${
                        idx === 0
                          ? "left-1/2 right-0"
                          : idx === visibleChildren.length - 1
                          ? "left-0 right-1/2"
                          : "left-0 right-0"
                      }`}
                    />
                  )}
                  <div className="w-0.5 h-4 bg-emerald-700/60" />
                  <TreeNodeCanvas
                    member={child}
                    childrenMap={childrenMap}
                    collapsedIds={collapsedIds}
                    highlightedId={highlightedId}
                    lang={lang}
                    onNodeTap={onNodeTap}
                    onSelectMember={onSelectMember}
                    onAddChildToMember={onAddChildToMember}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

export default TreeNodeCanvas;

