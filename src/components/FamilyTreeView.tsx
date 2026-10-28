"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronDown,
  ChevronRight,
  UserPlus,
  MapPin,
  Briefcase,
  Search,
  LayoutList,
  Network,
  Globe,
  Phone,
  Scan,
  Sparkles,
  MessageSquare,
  Share2,
} from "lucide-react";
import { FamilyBranch, FamilyMember, Language } from "@/types/family";

interface FamilyTreeViewProps {
  members: FamilyMember[];
  branches: FamilyBranch[];
  lang: Language;
  onSelectMember: (member: FamilyMember) => void;
  onAddChildToMember: (parentMember: FamilyMember | null) => void;
}

export default function FamilyTreeView({
  members,
  branches,
  lang,
  onSelectMember,
  onAddChildToMember,
}: FamilyTreeViewProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [collapsedIds, setCollapsedIds] = useState<Record<string, boolean>>({});
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"canvas" | "mobile-tree">("canvas");
  const [isCompact, setIsCompact] = useState<boolean>(false);

  const formatWhatsappUrl = (phoneOrWa?: string) => {
    if (!phoneOrWa) return "";
    let digits = phoneOrWa.replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("01") && digits.length === 11) {
      digits = "88" + digits;
    }
    return `https://wa.me/${digits}`;
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-fit on mobile screens on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setZoom(0.65);
      setIsCompact(true);
    }
  }, []);

  const childrenMap = useMemo(() => {
    const map: Record<string, FamilyMember[]> = {};
    members.forEach((m) => {
      const pid = m.parentId || "root";
      if (!map[pid]) map[pid] = [];
      map[pid].push(m);
    });
    return map;
  }, [members]);

  const rootMembers = useMemo(() => {
    const memberIds = new Set(members.map((m) => m.id));
    return members.filter((m) => !m.parentId || !memberIds.has(m.parentId));
  }, [members]);

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => setCollapsedIds({});
  const collapseCompact = () => {
    const next: Record<string, boolean> = {};
    members.forEach((m) => {
      if (m.generation >= 2 && (childrenMap[m.id]?.length || 0) > 0) {
        next[m.id] = true;
      }
    });
    setCollapsedIds(next);
  };

  // 1-Tap Fit to Screen
  const handleFitScreen = () => {
    if (!containerRef.current || !contentRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const contentWidth = contentRef.current.scrollWidth;
    if (contentWidth > 0) {
      const unscaledWidth = contentWidth / zoom;
      const targetRatio = (containerWidth - 36) / unscaledWidth;
      const newZoom = Math.min(1.2, Math.max(0.35, +targetRatio.toFixed(2)));
      setZoom(newZoom);
    }
  };

  const matchingMembers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.nameBn.toLowerCase().includes(q) ||
        m.nameEn.toLowerCase().includes(q) ||
        m.nicknameBn?.toLowerCase().includes(q) ||
        m.nicknameEn?.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  const focusMember = (member: FamilyMember) => {
    const nextCollapsed = { ...collapsedIds };
    let curr: FamilyMember | undefined = member;
    while (curr && curr.parentId) {
      delete nextCollapsed[curr.parentId];
      curr = members.find((m) => m.id === curr?.parentId);
    }
    setCollapsedIds(nextCollapsed);
    setHighlightedId(member.id);
    setSearchQuery("");
    setTimeout(() => {
      document
        .getElementById(`tree-node-${member.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }, 100);
  };

  const getBranchStyle = (branchId: string) => {
    switch (branchId) {
      case "root":
        return {
          border: "border-amber-500",
          left: "border-l-amber-500",
          header: "bg-emerald-950 text-amber-300",
        };
      case "child-1":
      case "boro-taraf":
        return {
          border: "border-emerald-600",
          left: "border-l-emerald-600",
          header: "bg-emerald-800 text-white",
        };
      case "child-2":
      case "mejo-taraf":
        return {
          border: "border-amber-600",
          left: "border-l-amber-600",
          header: "bg-amber-700 text-white",
        };
      case "child-3":
      case "choto-taraf":
        return {
          border: "border-sky-600",
          left: "border-l-sky-600",
          header: "bg-sky-800 text-white",
        };
      case "child-4":
        return {
          border: "border-purple-600",
          left: "border-l-purple-600",
          header: "bg-purple-800 text-white",
        };
      case "child-5":
        return {
          border: "border-rose-600",
          left: "border-l-rose-600",
          header: "bg-rose-800 text-white",
        };
      default:
        return {
          border: "border-teal-600",
          left: "border-l-teal-600",
          header: "bg-teal-800 text-white",
        };
    }
  };

  // Mobile / List Mode Card
  const renderMobileNode = (member: FamilyMember): React.ReactNode => {
    const visibleChildren = childrenMap[member.id] || [];
    const hasChildren = visibleChildren.length > 0;
    const isCollapsed = !!collapsedIds[member.id];
    const style = getBranchStyle(member.branchId);

    return (
      <div key={member.id} className="w-full">
        <div
          id={`tree-node-${member.id}`}
          onClick={() => onSelectMember(member)}
          className={`rounded-2xl bg-white border border-stone-200 border-l-4 ${style.left} p-3.5 shadow-sm hover:shadow-md transition cursor-pointer ${
            highlightedId === member.id ? "ring-2 ring-amber-400" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-2.5">
            <div className="min-w-0 flex-1 space-y-1.5">
              {/* Gen • Sex • Status Header */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-950 text-amber-300">
                  G{member.generation}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-stone-100 text-stone-700">
                  {member.gender === "female" ? (lang === "bn" ? "নারী" : "Female") : (lang === "bn" ? "পুরুষ" : "Male")}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    member.isAlive
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-stone-100 text-stone-600 border border-stone-200"
                  }`}
                >
                  {member.isAlive ? (lang === "bn" ? "জীবিত" : "Living") : (lang === "bn" ? "প্রয়াত" : "Late")}
                </span>
                {member.bloodGroup && member.bloodGroup !== "Unknown" && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700">
                    🩸 {member.bloodGroup}
                  </span>
                )}
              </div>

              {/* Name */}
              <div>
                <h3 className="font-bold text-stone-900 text-base leading-tight truncate">
                  {lang === "bn" ? member.nameBn : member.nameEn}
                </h3>
                {(member.nicknameBn || member.nicknameEn) && (
                  <p className="text-xs text-amber-700 font-semibold truncate">
                    ({lang === "bn" ? member.nicknameBn : member.nicknameEn})
                  </p>
                )}
              </div>

              {/* Country, Present Address & Phone */}
              <div className="space-y-1 pt-1 text-xs text-stone-600">
                <div className="flex items-center gap-1.5 text-stone-700 truncate">
                  <Globe className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="font-semibold truncate">
                    {lang === "bn" ? (member.countryBn || "বাংলাদেশ") : (member.countryEn || "Bangladesh")}
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
                      href={member.socialLink}
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
                className="p-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold hover:bg-amber-100 shadow-sm"
                title={lang === "bn" ? "সন্তান অ্যাড" : "Add Child"}
              >
                <UserPlus className="w-4 h-4" />
              </button>
              {hasChildren && (
                <button
                  type="button"
                  onClick={(e) => toggleCollapse(member.id, e)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-900 text-amber-300 text-xs font-bold hover:bg-emerald-800 shadow-sm"
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
            {visibleChildren.map((c) => renderMobileNode(c))}
          </div>
        )}
      </div>
    );
  };

  // Canvas / Tree Node Card
  const renderCanvasNode = (member: FamilyMember): React.ReactNode => {
    const visibleChildren = childrenMap[member.id] || [];
    const hasChildren = visibleChildren.length > 0;
    const isCollapsed = !!collapsedIds[member.id];
    const style = getBranchStyle(member.branchId);

    // COMPACT CARD (Specifically optimized for Mobile so multiple branches fit without scrolling)
    if (isCompact) {
      return (
        <div key={member.id} className="flex flex-col items-center relative px-1">
          <div
            id={`tree-node-${member.id}`}
            onClick={() => onSelectMember(member)}
            className={`w-36 sm:w-44 rounded-xl bg-white border-2 ${style.border} shadow-sm hover:shadow-lg transition cursor-pointer relative ${
              highlightedId === member.id ? "ring-2 ring-amber-400" : ""
            }`}
          >
            {/* Header: Gen • Sex | Status */}
            <div className={`px-2 py-1 rounded-t-[10px] flex items-center justify-between text-[10px] font-bold ${style.header}`}>
              <span>
                G{member.generation} • {member.gender === "female" ? (lang === "bn" ? "নারী" : "F") : (lang === "bn" ? "পুরুষ" : "M")}
              </span>
              <span className="text-[9px] px-1 rounded bg-white/20">
                {member.isAlive ? (lang === "bn" ? "জীবিত" : "L") : (lang === "bn" ? "প্রয়াত" : "D")}
              </span>
            </div>

            <div className="p-2 space-y-1">
              <h3 className="font-bold text-stone-900 text-xs sm:text-sm leading-tight truncate">
                {lang === "bn" ? member.nameBn : member.nameEn}
              </h3>

              <div className="text-[10px] text-stone-600 space-y-0.5 pt-0.5 border-t border-stone-100">
                <p className="truncate flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-amber-600 flex-shrink-0" />
                  <span className="truncate">{member.locationBn}</span>
                </p>
                {member.phone && (
                  <div className="flex items-center justify-between gap-1 pt-0.5">
                    <a
                      href={`tel:${member.phone.replace(/\s+/g, "")}`}
                      onClick={(e) => e.stopPropagation()}
                      className="truncate flex items-center gap-1 text-emerald-800 font-bold hover:underline"
                    >
                      <Phone className="w-2.5 h-2.5 text-emerald-700 flex-shrink-0" />
                      <span className="truncate">{member.phone}</span>
                    </a>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {formatWhatsappUrl(member.whatsapp || member.phone) && (
                        <a
                          href={formatWhatsappUrl(member.whatsapp || member.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-green-600 hover:text-green-700"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {member.socialLink && (
                        <a
                          href={member.socialLink.startsWith("http") ? member.socialLink : `https://${member.socialLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 hover:text-blue-700"
                          title="Social Link"
                        >
                          <Share2 className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-1 flex items-center justify-between">
                <span className="text-[9px] text-blue-600 font-medium truncate">
                  {lang === "bn" ? member.countryBn || "বাংলাদেশ" : member.countryEn || "BD"}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChildToMember(member);
                  }}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[9px] font-bold"
                  title={lang === "bn" ? "সন্তান অ্যাড" : "Add Child"}
                >
                  <UserPlus className="w-2.5 h-2.5" />
                  <span>+</span>
                </button>
              </div>
            </div>

            {hasChildren && (
              <button
                type="button"
                onClick={(e) => toggleCollapse(member.id, e)}
                className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-900 text-amber-300 text-[9px] font-bold shadow cursor-pointer hover:bg-emerald-800"
              >
                <span>{visibleChildren.length}</span>
                {isCollapsed ? <ChevronRight className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
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
                      {renderCanvasNode(child)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    // FULL DETAILED CARD
    return (
      <div key={member.id} className="flex flex-col items-center relative px-2">
        <div
          id={`tree-node-${member.id}`}
          onClick={() => onSelectMember(member)}
          className={`w-60 sm:w-64 rounded-2xl bg-white border-2 ${style.border} shadow-md hover:shadow-xl transition cursor-pointer relative ${
            highlightedId === member.id ? "ring-4 ring-amber-400" : ""
          }`}
        >
          {/* Header: Gen • Sex (Left) | Status (Right) */}
          <div className={`px-3 py-1.5 rounded-t-[14px] flex items-center justify-between text-[11px] font-bold ${style.header}`}>
            <span className="flex items-center gap-1.5">
              <span>G{member.generation}</span>
              <span>•</span>
              <span>
                {member.gender === "female"
                  ? lang === "bn"
                    ? "নারী"
                    : "Female"
                  : lang === "bn"
                  ? "পুরুষ"
                  : "Male"}
              </span>
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/20">
              {member.isAlive
                ? lang === "bn"
                  ? "জীবিত"
                  : "Living"
                : lang === "bn"
                ? "প্রয়াত"
                : "Late"}
            </span>
          </div>

          <div className="p-3 space-y-2">
            {/* Name */}
            <div>
              <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug truncate">
                {lang === "bn" ? member.nameBn : member.nameEn}
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                {(member.nicknameBn || member.nicknameEn) && (
                  <span className="text-amber-700 font-semibold truncate">
                    ({lang === "bn" ? member.nicknameBn : member.nicknameEn})
                  </span>
                )}
                {member.bloodGroup && member.bloodGroup !== "Unknown" && (
                  <span className="text-rose-700 font-bold ml-auto">
                    🩸 {member.bloodGroup}
                  </span>
                )}
              </div>
            </div>

            {/* Country, Present Address, Phone */}
            <div className="pt-2 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
              {/* Country */}
              <div className="flex items-center gap-1.5 truncate">
                <Globe className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span className="font-semibold text-stone-700 truncate">
                  {lang === "bn"
                    ? member.countryBn || "বাংলাদেশ"
                    : member.countryEn || "Bangladesh"}
                </span>
              </div>

              {/* Present Address */}
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span className="truncate">
                  {lang === "bn" ? member.locationBn : member.locationEn}
                </span>
              </div>

              {/* Phone & WhatsApp & Social */}
              {(member.phone || member.whatsapp || member.socialLink) && (
                <div className="flex items-center justify-between gap-1 flex-wrap pt-0.5">
                  {member.phone ? (
                    <div className="flex items-center gap-1.5 truncate">
                      <Phone className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                      <a
                        href={`tel:${member.phone.replace(/\s+/g, "")}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-emerald-800 font-bold hover:underline truncate"
                      >
                        {member.phone}
                      </a>
                    </div>
                  ) : <div />}

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {formatWhatsappUrl(member.whatsapp || member.phone) && (
                      <a
                        href={formatWhatsappUrl(member.whatsapp || member.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-50 hover:bg-green-100 text-green-700 font-semibold text-[11px] border border-green-200"
                        title="WhatsApp Chat"
                      >
                        <MessageSquare className="w-3 h-3 text-green-600" />
                        <span>WA</span>
                      </a>
                    )}
                    {member.socialLink && (
                      <a
                        href={member.socialLink.startsWith("http") ? member.socialLink : `https://${member.socialLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] border border-blue-200"
                        title="Social Link"
                      >
                        <Share2 className="w-3 h-3 text-blue-600" />
                        <span>Social</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Profession (if available) */}
              {member.professionBn && member.professionBn !== "-" && member.professionBn !== "জানা নেই" && (
                <div className="flex items-center gap-1.5 truncate text-[11px] text-stone-500">
                  <Briefcase className="w-3 h-3 text-stone-400 flex-shrink-0" />
                  <span className="truncate">
                    {lang === "bn" ? member.professionBn : member.professionEn}
                  </span>
                </div>
              )}
            </div>

            {/* Action button */}
            <div className="pt-1.5 flex justify-end">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChildToMember(member);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "সন্তান অ্যাড" : "Add Child"}</span>
              </button>
            </div>
          </div>

          {hasChildren && (
            <button
              type="button"
              onClick={(e) => toggleCollapse(member.id, e)}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-0.5 px-2.5 py-0.5 rounded-full bg-emerald-900 text-amber-300 text-[11px] font-bold shadow cursor-pointer hover:bg-emerald-800"
            >
              <span>{visibleChildren.length}</span>
              {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>

        {hasChildren && !isCollapsed && (
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-7 bg-emerald-700/60" />
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
                    <div className="w-0.5 h-6 bg-emerald-700/60" />
                    {renderCanvasNode(child)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4">
        <button
          onClick={() => onAddChildToMember(null)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 text-sm font-bold shadow cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>{lang === "bn" ? "নতুন মেম্বার অ্যাড" : "Add Member"}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Clean Compact Toolbar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-2.5 sm:p-3 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Left: View Switcher (Chart / List) & Density Switcher (Details / Compact) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Chart / List Switcher */}
          <div className="flex bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("canvas")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                viewMode === "canvas" ? "bg-emerald-900 text-amber-300 shadow-sm" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>{lang === "bn" ? "চার্ট" : "Chart"}</span>
            </button>
            <button
              onClick={() => setViewMode("mobile-tree")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                viewMode === "mobile-tree" ? "bg-emerald-900 text-amber-300 shadow-sm" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>{lang === "bn" ? "লিস্ট" : "List"}</span>
            </button>
          </div>

          {/* Density Switcher for Chart (Details vs Compact Mini-Cards) */}
          {viewMode === "canvas" && (
            <div className="flex bg-amber-50 border border-amber-200 p-1 rounded-xl">
              <button
                onClick={() => setIsCompact(false)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                  !isCompact ? "bg-amber-400 text-emerald-950 shadow-sm" : "text-amber-900"
                }`}
              >
                {lang === "bn" ? "ডিটেইলস" : "Full"}
              </button>
              <button
                onClick={() => setIsCompact(true)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                  isCompact ? "bg-amber-400 text-emerald-950 shadow-sm" : "text-amber-900"
                }`}
              >
                <Sparkles className="w-3 h-3 inline mr-1" />
                {lang === "bn" ? "কমপ্যাক্ট" : "Mini"}
              </button>
            </div>
          )}
        </div>

        {/* Right: Search, Fit Screen, & Zoom Controls */}
        <div className="flex items-center gap-2 justify-between sm:justify-end">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "bn" ? "সার্চ..." : "Search..."}
              className="w-full pl-8 pr-2.5 py-1.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            {matchingMembers.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-stone-200 z-30 max-h-48 overflow-y-auto divide-y divide-stone-100">
                {matchingMembers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => focusMember(m)}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 text-xs font-bold text-stone-800"
                  >
                    {lang === "bn" ? m.nameBn : m.nameEn}
                  </button>
                ))}
              </div>
            )}
          </div>

          {viewMode === "canvas" && (
            <div className="flex items-center gap-1.5">
              {/* 1-Tap Fit to Screen Button */}
              <button
                onClick={handleFitScreen}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-900 text-amber-300 text-xs font-bold cursor-pointer hover:bg-emerald-800 shadow-sm"
                title={lang === "bn" ? "স্ক্রিনে ফিট করুন" : "Fit to screen"}
              >
                <Scan className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "ফিট স্ক্রিন" : "Fit"}</span>
              </button>

              <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-xl">
                <button
                  onClick={() => setZoom((z) => Math.max(0.35, +(z - 0.1).toFixed(2)))}
                  className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-700 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.min(1.4, +(z + 0.1).toFixed(2)))}
                  className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-700 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-700 cursor-pointer"
                  title="Reset 100%"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Viewport: Mobile-tree (List) or Visual Canvas (Chart) */}
      {viewMode === "mobile-tree" ? (
        <div className="space-y-2.5">
          {rootMembers.map((root) => renderMobileNode(root))}
        </div>
      ) : (
        <div
          ref={containerRef}
          className="bg-white/70 rounded-2xl border border-stone-200 overflow-x-auto overflow-y-auto p-3 sm:p-8 min-h-[500px] touch-pan-x touch-pan-y overscroll-x-contain"
        >
          <div
            ref={contentRef}
            className="inline-flex min-w-full justify-start sm:justify-center transition-transform duration-200 origin-top-left sm:origin-top"
            style={{ transform: `scale(${zoom})` }}
          >
            <div className="flex items-start gap-4 sm:gap-6 pb-12 pt-2">
              {rootMembers.map((root) => renderCanvasNode(root))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
