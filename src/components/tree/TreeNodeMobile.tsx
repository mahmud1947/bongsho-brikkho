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
} from "lucide-react";
import { FamilyMember, Language, formatSocialUrl } from "@/types/family";
import CountryFlag from "@/components/CountryFlag";
import { getBranchStyle, formatWhatsappUrl } from "./treeUtils";

interface TreeNodeMobileProps {
  member: FamilyMember;
  childrenMap: Record<string, FamilyMember[]>;
  collapsedIds: Record<string, boolean>;
  highlightedId: string | null;
  lang: Language;
  onNodeTap: (member: FamilyMember, e?: React.MouseEvent) => void;
  onSelectMember: (member: FamilyMember) => void;
  onAddChildToMember: (parentMember: FamilyMember | null) => void;
}

export default function TreeNodeMobile({
  member,
  childrenMap,
  collapsedIds,
  highlightedId,
  lang,
  onNodeTap,
  onSelectMember,
  onAddChildToMember,
}: TreeNodeMobileProps) {
  const visibleChildren = childrenMap[member.id] || [];
  const hasChildren = visibleChildren.length > 0;
  const isCollapsed = !!collapsedIds[member.id];
  const style = getBranchStyle(member.branchId);

  return (
    <div key={member.id} className="w-full">
      <div
        id={`tree-node-${member.id}`}
        onClick={(e) => onNodeTap(member, e)}
        className={`rounded-2xl bg-white border border-stone-200 border-l-4 ${style.left} p-3.5 shadow-sm hover:shadow-md transition cursor-pointer ${
          highlightedId === member.id ? "ring-2 ring-amber-400" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0 flex-1 space-y-1.5">
            {/* Gen & Status Header */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-950 text-amber-300">
                G{member.generation}
              </span>
              {!member.isAlive && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-200 text-stone-700 border border-stone-300">
                  {lang === "bn" ? "প্রয়াত" : "Late"}
                </span>
              )}
              {member.bloodGroup && member.bloodGroup !== "Unknown" && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700">
                  🩸 {member.bloodGroup}
                </span>
              )}
            </div>

            {/* Name */}
            <div>
              <h3
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectMember(member);
                }}
                className="font-bold text-stone-900 text-base leading-tight truncate hover:text-emerald-700 cursor-pointer"
                title={lang === "bn" ? "প্রোফাইল দেখতে ক্লিক করুন" : "Click to view profile"}
              >
                {lang === "bn" ? member.nameBn : member.nameEn}
              </h3>
            </div>

            {/* Country, Present Address & Phone */}
            <div className="space-y-1 pt-1 text-xs text-stone-600">
              <div className="flex items-center gap-1.5 text-stone-700 truncate">
                <CountryFlag
                  country={member.countryBn || member.countryEn}
                  className="w-4.5 h-3"
                />
                <span className="font-semibold truncate">
                  {lang === "bn" ? member.countryBn || "বাংলাদেশ" : member.countryEn || "Bangladesh"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span className="truncate">
                  {lang === "bn" ? member.locationBn : member.locationEn}
                </span>
              </div>

              {/* Contacts: Phone, WhatsApp, Social */}
              <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                {member.phone && (
                  <a
                    href={`tel:${member.phone.replace(/\s+/g, "")}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-emerald-800 font-bold hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                    <span>{member.phone}</span>
                  </a>
                )}

                {(member.whatsapp || member.phone) && (
                  <a
                    href={formatWhatsappUrl(member.whatsapp || member.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[11px]"
                    title="WhatsApp Chat"
                  >
                    <MessageSquare className="w-3 h-3 text-emerald-700" />
                    <span>WhatsApp</span>
                  </a>
                )}

                {member.socialLink && (
                  <a
                    href={formatSocialUrl(member.socialLink)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px]"
                    title="Social Link"
                  >
                    <Share2 className="w-3 h-3 text-blue-600" />
                    <span>Social</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddChildToMember(member);
              }}
              className="p-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold hover:bg-amber-100 shadow-sm cursor-pointer"
              title={lang === "bn" ? "সন্তান অ্যাড" : "Add Child"}
            >
              <UserPlus className="w-4 h-4" />
            </button>
            {hasChildren && (
              <button
                type="button"
                onClick={(e) => onNodeTap(member, e)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-900 text-amber-300 text-xs font-bold hover:bg-emerald-800 shadow-sm cursor-pointer"
              >
                <span>{visibleChildren.length}</span>
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {hasChildren && !isCollapsed && (
        <div className="mt-2 space-y-2 pl-3 sm:pl-4 border-l-2 border-emerald-700/35 ml-2.5 sm:ml-3">
          {visibleChildren.map((c) => (
            <TreeNodeMobile
              key={c.id}
              member={c}
              childrenMap={childrenMap}
              collapsedIds={collapsedIds}
              highlightedId={highlightedId}
              lang={lang}
              onNodeTap={onNodeTap}
              onSelectMember={onSelectMember}
              onAddChildToMember={onAddChildToMember}
            />
          ))}
        </div>
      )}
    </div>
  );
}
