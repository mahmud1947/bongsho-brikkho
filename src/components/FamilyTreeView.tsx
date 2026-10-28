"use client";

import React, { useState, useMemo } from "react";
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
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [collapsedIds, setCollapsedIds] = useState<Record<string, boolean>>({});
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"canvas" | "mobile-tree">("canvas");

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
    setSelectedBranch("all");
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

  const renderMobileNode = (member: FamilyMember): React.ReactNode => {
    if (selectedBranch !== "all" && member.generation > 1 && member.branchId !== selectedBranch) {
      return null;
    }
    const visibleChildren = (childrenMap[member.id] || []).filter(
      (c) => selectedBranch === "all" || c.generation <= 1 || c.branchId === selectedBranch
    );
    const hasChildren = visibleChildren.length > 0;
    const isCollapsed = !!collapsedIds[member.id];
    const style = getBranchStyle(member.branchId);

    return (
      <div key={member.id} className="w-full">
        <div
          id={`tree-node-${member.id}`}
          onClick={() => onSelectMember(member)}
          className={`rounded-2xl bg-white border border-stone-200 border-l-4 ${style.left} p-3.5 shadow-sm cursor-pointer ${
            highlightedId === member.id ? "ring-2 ring-amber-400" : ""
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-900 font-bold text-xs flex items-center justify-center border border-emerald-200 flex-shrink-0">
                G{member.generation}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-stone-900 text-sm truncate">
                  {lang === "bn" ? member.nameBn : member.nameEn}
                </h3>
                <div className="flex items-center gap-2 text-xs text-stone-500 truncate">
                  <span className="truncate">
                    {lang === "bn" ? member.professionBn : member.professionEn}
                  </span>
                  {member.bloodGroup !== "Unknown" && (
                    <span className="text-rose-700 font-bold">
                      • {member.bloodGroup}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChildToMember(member);
                }}
                className="p-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold"
              >
                <UserPlus className="w-3.5 h-3.5" />
              </button>
              {hasChildren && (
                <button
                  type="button"
                  onClick={(e) => toggleCollapse(member.id, e)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-900 text-amber-300 text-xs font-bold"
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
          <div className="mt-2 space-y-2 pl-4 border-l-2 border-emerald-700/35 ml-3">
            {visibleChildren.map((c) => renderMobileNode(c))}
          </div>
        )}
      </div>
    );
  };

  const renderCanvasNode = (member: FamilyMember): React.ReactNode => {
    if (selectedBranch !== "all" && member.generation > 1 && member.branchId !== selectedBranch) {
      return null;
    }
    const visibleChildren = (childrenMap[member.id] || []).filter(
      (c) => selectedBranch === "all" || c.generation <= 1 || c.branchId === selectedBranch
    );
    const hasChildren = visibleChildren.length > 0;
    const isCollapsed = !!collapsedIds[member.id];
    const style = getBranchStyle(member.branchId);

    return (
      <div key={member.id} className="flex flex-col items-center relative px-2">
        <div
          id={`tree-node-${member.id}`}
          onClick={() => onSelectMember(member)}
          className={`w-56 sm:w-64 rounded-2xl bg-white border-2 ${style.border} shadow-md hover:shadow-lg transition cursor-pointer relative ${
            highlightedId === member.id ? "ring-4 ring-amber-400" : ""
          }`}
        >
          <div className={`px-3 py-1 rounded-t-[14px] flex items-center justify-between text-[11px] font-bold ${style.header}`}>
            <span>
              G{member.generation} • {member.gender === "female" ? (lang === "bn" ? "নারী" : "Female") : (lang === "bn" ? "পুরুষ" : "Male")}
            </span>
            <span>
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
            <div>
              <h3 className="font-bold text-stone-900 text-sm truncate">
                {lang === "bn" ? member.nameBn : member.nameEn}
              </h3>
              <p className="text-[11px] text-stone-500">
                {member.birthYear || "?"}
                {member.bloodGroup !== "Unknown" ? ` • 🩸 ${member.bloodGroup}` : ""}
              </p>
            </div>

            <div className="pt-2 border-t border-stone-100 space-y-1 text-xs text-stone-600">
              <div className="flex items-center gap-1.5 truncate">
                <Briefcase className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                <span className="truncate">
                  {lang === "bn" ? member.professionBn : member.professionEn}
                </span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span className="truncate">
                  {lang === "bn"
                    ? [member.locationBn, member.countryBn].filter((x) => x && x !== "জানা নেই" && x !== "-").join(", ") || member.locationBn
                    : [member.locationEn, member.countryEn].filter((x) => x && x !== "Unknown" && x !== "-").join(", ") || member.locationEn}
                </span>
              </div>
            </div>

            <div className="pt-1.5 flex justify-end">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChildToMember(member);
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold"
              >
                <UserPlus className="w-3 h-3" />
                {lang === "bn" ? "সন্তান অ্যাড" : "Child"}
              </button>
            </div>
          </div>

          {hasChildren && (
            <button
              type="button"
              onClick={(e) => toggleCollapse(member.id, e)}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-900 text-amber-300 text-[11px] font-bold shadow cursor-pointer"
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
          <span>{lang === "bn" ? "যোগ" : "Add"}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Compact Toolbar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-3 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <div className="flex bg-stone-100 p-1 rounded-xl mr-1">
            <button
              onClick={() => setViewMode("canvas")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                viewMode === "canvas" ? "bg-emerald-900 text-amber-300" : "text-stone-600"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              {lang === "bn" ? "চার্ট" : "Chart"}
            </button>
            <button
              onClick={() => setViewMode("mobile-tree")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                viewMode === "mobile-tree" ? "bg-emerald-900 text-amber-300" : "text-stone-600"
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              {lang === "bn" ? "লিস্ট" : "List"}
            </button>
          </div>

          <button
            onClick={() => setSelectedBranch("all")}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
              selectedBranch === "all" ? "bg-emerald-900 text-amber-300" : "bg-stone-100 text-stone-700"
            }`}
          >
            {lang === "bn" ? "সব" : "All"}
          </button>
          {branches
            .filter((b) => b.id !== "root")
            .map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBranch(b.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
                  selectedBranch === b.id ? "bg-emerald-900 text-amber-300" : "bg-stone-100 text-stone-700"
                }`}
              >
                {lang === "bn" ? b.nameBn : b.nameEn}
              </button>
            ))}
        </div>

        <div className="flex items-center gap-1.5 justify-between sm:justify-end">
          <div className="relative flex-1 sm:w-48">
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

          <button
            onClick={expandAll}
            className="px-2.5 py-1.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold cursor-pointer"
          >
            {lang === "bn" ? "খুলুন" : "Expand"}
          </button>
          <button
            onClick={collapseCompact}
            className="px-2.5 py-1.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold cursor-pointer"
          >
            {lang === "bn" ? "সংক্ষিপ্ত" : "Compact"}
          </button>

          {viewMode === "canvas" && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(1)))}
                className="p-1.5 rounded-lg bg-stone-100 text-stone-700 cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.min(1.4, +(z + 0.1).toFixed(1)))}
                className="p-1.5 rounded-lg bg-stone-100 text-stone-700 cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-1.5 rounded-lg bg-stone-100 text-stone-700 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tree Viewport */}
      {viewMode === "mobile-tree" ? (
        <div className="space-y-2.5">
          {rootMembers.map((root) => renderMobileNode(root))}
        </div>
      ) : (
        <div className="bg-white/60 rounded-2xl border border-stone-200 overflow-x-auto overflow-y-auto p-4 sm:p-8 min-h-[500px]">
          <div
            className="inline-flex min-w-full justify-start sm:justify-center transition-transform duration-200 origin-top-left sm:origin-top"
            style={{ transform: `scale(${zoom})` }}
          >
            <div className="flex items-start gap-6 pb-10">
              {rootMembers.map((root) => renderCanvasNode(root))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
