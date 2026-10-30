"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  UserPlus,
  MapPin,
  Search,
  LayoutList,
  Network,
  Globe,
  Phone,
  Scan,
  MessageSquare,
  Share2,
  Info,
} from "lucide-react";
import { FamilyBranch, FamilyMember, Language, formatSocialUrl } from "@/types/family";
import CountryFlag from "@/components/CountryFlag";

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
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");

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

  const [isPinching, setIsPinching] = useState<boolean>(false);
  const [showZoomBadge, setShowZoomBadge] = useState<boolean>(false);
  const zoomBadgeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const zoomRef = useRef<number>(zoom);
  zoomRef.current = zoom;

  const [contentSize, setContentSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Track unscaled content size via ResizeObserver
  useEffect(() => {
    if (!contentRef.current) return;
    const updateSize = () => {
      if (contentRef.current) {
        setContentSize({
          width: contentRef.current.scrollWidth,
          height: contentRef.current.scrollHeight,
        });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, [members, collapsedIds, viewMode]);

  // Auto-fit on mobile screens on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setZoom(0.65);
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

  // G2 Members (the main family branches under Root)
  const g2Members = useMemo(() => {
    const list: FamilyMember[] = [];
    rootMembers.forEach((r) => {
      const children = childrenMap[r.id] || [];
      list.push(...children);
    });
    if (list.length === 0) {
      return members.filter((m) => m.generation === 2);
    }
    return list;
  }, [rootMembers, childrenMap, members]);

  // 1. Initial State: Only G1 & G2 open initially (all generation >= 2 with children start collapsed)
  const [hasInitializedCollapse, setHasInitializedCollapse] = useState<boolean>(false);
  useEffect(() => {
    if (members.length > 0 && !hasInitializedCollapse) {
      const rootSet = new Set(rootMembers.map((r) => r.id));
      const initial: Record<string, boolean> = {};
      members.forEach((m) => {
        const kids = childrenMap[m.id] || [];
        if (kids.length > 0 && !rootSet.has(m.id)) {
          initial[m.id] = true;
        }
      });
      setCollapsedIds(initial);
      setHasInitializedCollapse(true);
    }
  }, [members, rootMembers, childrenMap, hasInitializedCollapse]);

  // 2. Accordion expansion: Tapping a child expands only its family down and collapses sibling branches
  const handleNodeTap = (member: FamilyMember, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const visibleChildren = childrenMap[member.id] || [];
    const hasChildren = visibleChildren.length > 0;

    // Leaf node (no children) -> open profile modal directly
    if (!hasChildren) {
      onSelectMember(member);
      return;
    }

    const isCurrentlyCollapsed = !!collapsedIds[member.id];

    if (isCurrentlyCollapsed) {
      // User is EXPANDING this member!
      // Collapse all siblings under the same parent so only this child's family unfolds down
      setCollapsedIds((prev) => {
        const next = { ...prev };
        if (member.parentId) {
          const siblings = members.filter(
            (m) => m.parentId === member.parentId && m.id !== member.id
          );
          const collapseRecursive = (pid: string) => {
            next[pid] = true;
            const kids = childrenMap[pid] || [];
            kids.forEach((k) => collapseRecursive(k.id));
          };
          siblings.forEach((s) => collapseRecursive(s.id));
        }
        delete next[member.id];
        return next;
      });

      // Update selected branch highlight if this member is in G2
      if (g2Members.some((g) => g.id === member.id)) {
        setSelectedBranchId(member.id);
      }

      setTimeout(() => {
        const el = document.getElementById(`tree-node-${member.id}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
      }, 100);
    } else {
      // User is COLLAPSING this member!
      setCollapsedIds((prev) => ({
        ...prev,
        [member.id]: true,
      }));
    }
  };

  // 3. Branch Quick-Select: Open everyone in a selected branch in a single glance
  const expandBranch = (g2MemberId: string) => {
    const newCollapsed: Record<string, boolean> = {};

    const getDescendantIds = (parentId: string): string[] => {
      const children = childrenMap[parentId] || [];
      let result: string[] = [];
      children.forEach((c) => {
        result.push(c.id);
        result = result.concat(getDescendantIds(c.id));
      });
      return result;
    };

    const branchDescendantIds = new Set([g2MemberId, ...getDescendantIds(g2MemberId)]);
    const rootSet = new Set(rootMembers.map((r) => r.id));

    members.forEach((m) => {
      const hasKids = (childrenMap[m.id] || []).length > 0;
      if (hasKids) {
        if (branchDescendantIds.has(m.id) || rootSet.has(m.id)) {
          // Keep root and all members in this selected branch EXPANDED
          delete newCollapsed[m.id];
        } else {
          // Collapse all other branches
          newCollapsed[m.id] = true;
        }
      }
    });

    setCollapsedIds(newCollapsed);
    setSelectedBranchId(g2MemberId);

    setTimeout(() => {
      const el = document.getElementById(`tree-node-${g2MemberId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      }
    }, 150);
  };

  const resetToOverview = () => {
    const rootSet = new Set(rootMembers.map((r) => r.id));
    const initial: Record<string, boolean> = {};
    members.forEach((m) => {
      const kids = childrenMap[m.id] || [];
      if (kids.length > 0 && !rootSet.has(m.id)) {
        initial[m.id] = true;
      }
    });
    setCollapsedIds(initial);
    setSelectedBranchId("all");
    handleFitScreen();
  };

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => setCollapsedIds({});

  // 1-Tap Fit to Screen
  const handleFitScreen = () => {
    if (!containerRef.current || !contentRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const contentWidth = contentRef.current.scrollWidth;
    if (contentWidth > 0) {
      const targetRatio = (containerWidth - 32) / contentWidth;
      const newZoom = Math.min(1.2, Math.max(0.35, +targetRatio.toFixed(2)));
      setZoom(newZoom);
      setShowZoomBadge(true);
      if (zoomBadgeTimeoutRef.current) clearTimeout(zoomBadgeTimeoutRef.current);
      zoomBadgeTimeoutRef.current = setTimeout(() => setShowZoomBadge(false), 1200);
    }
  };

  // Native Two-Finger Pinch-to-Zoom & Trackpad Wheel Listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container || viewMode !== "canvas") return;

    let initialDist = 0;
    let initialZoom = 1;
    let startMidX = 0;
    let startMidY = 0;
    let startScrollLeft = 0;
    let startScrollTop = 0;
    let isPinchActive = false;

    // Double tap detection
    let lastTapTime = 0;
    let lastTapX = 0;
    let lastTapY = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        initialDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
        initialZoom = zoomRef.current;

        const rect = container.getBoundingClientRect();
        startMidX = (t0.clientX + t1.clientX) / 2 - rect.left;
        startMidY = (t0.clientY + t1.clientY) / 2 - rect.top;
        startScrollLeft = container.scrollLeft;
        startScrollTop = container.scrollTop;

        isPinchActive = true;
        setIsPinching(true);
        setShowZoomBadge(true);
        if (zoomBadgeTimeoutRef.current) clearTimeout(zoomBadgeTimeoutRef.current);
      } else if (e.touches.length === 1) {
        const now = Date.now();
        const t = e.touches[0];
        const dt = now - lastTapTime;
        const dx = Math.abs(t.clientX - lastTapX);
        const dy = Math.abs(t.clientY - lastTapY);

        if (dt < 320 && dx < 25 && dy < 25) {
          const target = e.target as HTMLElement | null;
          if (!target?.closest("button") && !target?.closest("a")) {
            if (zoomRef.current < 0.75) {
              setZoom(1.0);
            } else {
              handleFitScreen();
            }
            setShowZoomBadge(true);
            if (zoomBadgeTimeoutRef.current) clearTimeout(zoomBadgeTimeoutRef.current);
            zoomBadgeTimeoutRef.current = setTimeout(() => setShowZoomBadge(false), 1200);
          }
        }
        lastTapTime = now;
        lastTapX = t.clientX;
        lastTapY = t.clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && isPinchActive && initialDist > 5) {
        if (e.cancelable) e.preventDefault();

        const t0 = e.touches[0];
        const t1 = e.touches[1];
        const currentDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
        const scale = currentDist / initialDist;
        const targetZoom = Math.min(2.0, Math.max(0.3, +(initialZoom * scale).toFixed(2)));

        const rect = container.getBoundingClientRect();
        const currentMidX = (t0.clientX + t1.clientX) / 2 - rect.left;
        const currentMidY = (t0.clientY + t1.clientY) / 2 - rect.top;

        const contentX = (startScrollLeft + startMidX) / initialZoom;
        const contentY = (startScrollTop + startMidY) / initialZoom;

        container.scrollLeft = contentX * targetZoom - currentMidX;
        container.scrollTop = contentY * targetZoom - currentMidY;

        setZoom(targetZoom);
        setShowZoomBadge(true);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2 && isPinchActive) {
        isPinchActive = false;
        setIsPinching(false);
        if (zoomBadgeTimeoutRef.current) clearTimeout(zoomBadgeTimeoutRef.current);
        zoomBadgeTimeoutRef.current = setTimeout(() => {
          setShowZoomBadge(false);
        }, 1200);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.008;
        const targetZoom = Math.min(2.0, Math.max(0.3, +(zoomRef.current + delta).toFixed(2)));
        setZoom(targetZoom);
        setShowZoomBadge(true);
        if (zoomBadgeTimeoutRef.current) clearTimeout(zoomBadgeTimeoutRef.current);
        zoomBadgeTimeoutRef.current = setTimeout(() => setShowZoomBadge(false), 1200);
      }
    };

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd, { passive: true });
    container.addEventListener("touchcancel", onTouchEnd, { passive: true });
    container.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      container.removeEventListener("touchcancel", onTouchEnd);
      container.removeEventListener("wheel", onWheel);
    };
  }, [viewMode, members]);

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
          onClick={(e) => handleNodeTap(member, e)}
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
                className="p-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold hover:bg-amber-100 shadow-sm"
                title={lang === "bn" ? "সন্তান অ্যাড" : "Add Child"}
              >
                <UserPlus className="w-4 h-4" />
              </button>
              {hasChildren && (
                <button
                  type="button"
                  onClick={(e) => handleNodeTap(member, e)}
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

  // Canvas / Tree Node Card (Single unified compact card optimized for both mobile & desktop)
  const renderCanvasNode = (member: FamilyMember): React.ReactNode => {
    const visibleChildren = childrenMap[member.id] || [];
    const hasChildren = visibleChildren.length > 0;
    const isCollapsed = !!collapsedIds[member.id];
    const style = getBranchStyle(member.branchId);

    const displayName = lang === "bn" ? member.nameBn || member.nameEn : member.nameEn || member.nameBn;
    const displayLocation =
      lang === "bn" ? member.locationBn || member.locationEn : member.locationEn || member.locationBn;
    const genderLetter = member.gender === "female" ? "F" : "M";

    return (
      <div key={member.id} className="flex flex-col items-center relative px-1">
        <div
          id={`tree-node-${member.id}`}
          onClick={(e) => handleNodeTap(member, e)}
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
              onClick={(e) => handleNodeTap(member, e)}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-900 text-amber-300 text-[10px] font-bold shadow-md cursor-pointer hover:bg-emerald-800 active:scale-95 transition"
              title={isCollapsed ? (lang === "bn" ? "পরিবার নিচে দেখুন" : "Expand family") : (lang === "bn" ? "পরিবার বন্ধ করুন" : "Collapse")}
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
      {/* Clean Compact Toolbar - All in One Single Line on Mobile & Desktop */}
      <div className="bg-white rounded-2xl border border-stone-200 p-2 sm:p-2.5 shadow-sm flex items-center gap-1.5 sm:gap-2.5 w-full">
        {/* Left: View Switcher (Chart / List) */}
        <div className="flex bg-stone-100 p-0.5 sm:p-1 rounded-xl flex-shrink-0">
          <button
            onClick={() => setViewMode("canvas")}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
              viewMode === "canvas" ? "bg-emerald-900 text-amber-300 shadow-sm" : "text-stone-600 hover:text-stone-900"
            }`}
            title={lang === "bn" ? "চার্ট ভিউ" : "Chart View"}
          >
            <Network className="w-3.5 h-3.5" />
            <span>{lang === "bn" ? "চার্ট" : "Chart"}</span>
          </button>
          <button
            onClick={() => setViewMode("mobile-tree")}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
              viewMode === "mobile-tree" ? "bg-emerald-900 text-amber-300 shadow-sm" : "text-stone-600 hover:text-stone-900"
            }`}
            title={lang === "bn" ? "লিস্ট ভিউ" : "List View"}
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>{lang === "bn" ? "লিস্ট" : "List"}</span>
          </button>
        </div>

        {/* Middle: Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === "bn" ? "সার্চ..." : "Search..."}
            className="w-full pl-7 sm:pl-8 pr-2.5 py-1.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-stone-50/50 focus:bg-white transition"
          />
          {matchingMembers.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-stone-200 z-30 max-h-48 overflow-y-auto divide-y divide-stone-100">
              {matchingMembers.map((m) => (
                <button
                  key={m.id}
                  onClick={() => focusMember(m)}
                  className="w-full text-left px-3 py-2 hover:bg-emerald-50 text-xs font-bold text-stone-800 truncate"
                >
                  {lang === "bn" ? m.nameBn : m.nameEn}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Fit Screen Button */}
        {viewMode === "canvas" && (
          <button
            onClick={handleFitScreen}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-900 text-amber-300 text-xs font-bold cursor-pointer hover:bg-emerald-800 shadow-sm flex-shrink-0"
            title={lang === "bn" ? "স্ক্রিনে ফিট করুন" : "Fit to screen"}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>{lang === "bn" ? "ফিট" : "Fit"}</span>
          </button>
        )}
      </div>

      {/* Branch Quick-Select Pill Bar (Requirement 3: নির্দিষ্ট শাখা সিলেক্ট করে এক পলকেই সেই শাখার সবাই দেখতে পাবেন) */}
      {g2Members.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 px-2.5 py-1.5 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 text-stone-500 text-xs font-bold flex-shrink-0 pr-1.5 border-r border-stone-200">
            <span className="text-emerald-700">🌿</span>
            <span>{lang === "bn" ? "শাখা" : "Branch"}</span>
          </div>

          {/* 1. All Button (Fully opens all branches) */}
          <button
            type="button"
            onClick={() => {
              expandAll();
              setSelectedBranchId("full-tree");
              handleFitScreen();
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex-shrink-0 cursor-pointer ${
              selectedBranchId === "full-tree"
                ? "bg-emerald-900 text-amber-300 shadow-sm"
                : "bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200/60"
            }`}
            title={lang === "bn" ? "সব শাখা একসাথে সম্পূর্ণ দেখুন" : "View all branches together"}
          >
            {lang === "bn" ? "সব (All)" : "All"}
          </button>

          {/* 2. G1 & G2 Overview Button */}
          <button
            type="button"
            onClick={resetToOverview}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex-shrink-0 cursor-pointer ${
              selectedBranchId === "all"
                ? "bg-emerald-900 text-amber-300 shadow-sm"
                : "bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200/60"
            }`}
            title={lang === "bn" ? "শুধু মূল ও প্রথম প্রজন্ম দেখুন" : "View G1 & G2 overview"}
          >
            {lang === "bn" ? "G1 ও G2" : "G1 & G2"}
          </button>

          {/* Individual G2 Branch Buttons */}
          {g2Members.map((g2) => {
            const isSelected = selectedBranchId === g2.id;
            const branchStyle = getBranchStyle(g2.branchId);
            const branchName = lang === "bn" ? g2.nameBn : g2.nameEn;
            const childCount = (childrenMap[g2.id] || []).length;

            return (
              <button
                key={g2.id}
                type="button"
                onClick={() => expandBranch(g2.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition flex-shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-amber-400 text-emerald-950 shadow-sm ring-2 ring-emerald-900"
                    : "bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200/60"
                }`}
                title={lang === "bn" ? `${branchName}-এর পরিবার দেখুন` : `View ${branchName}'s Family`}
              >
                <span className={`w-2 h-2 rounded-full ${branchStyle.header.split(" ")[0] || "bg-emerald-600"}`} />
                <span>{branchName}</span>
                {childCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? "bg-emerald-950 text-amber-300 font-bold"
                        : "bg-stone-200 text-stone-700"
                    }`}
                  >
                    {childCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Viewport: Mobile-tree (List) or Visual Canvas (Chart) */}
      {viewMode === "mobile-tree" ? (
        <div className="space-y-2.5">
          {rootMembers.map((root) => renderMobileNode(root))}
        </div>
      ) : (
        <div className="relative">
          <div
            ref={containerRef}
            className="bg-white/70 rounded-2xl border border-stone-200 overflow-x-auto overflow-y-auto p-3 sm:p-8 min-h-[500px] touch-pan-x touch-pan-y overscroll-x-contain"
          >
            <div
              style={{
                width: contentSize.width ? `${contentSize.width * zoom}px` : "auto",
                height: contentSize.height ? `${contentSize.height * zoom}px` : "auto",
                minWidth: "100%",
              }}
            >
              <div
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "0 0",
                  transition: isPinching ? "none" : "transform 0.2s ease-out",
                  width: "max-content",
                }}
              >
                <div
                  ref={contentRef}
                  className="flex items-start gap-4 sm:gap-6 pb-12 pt-2"
                >
                  {rootMembers.map((root) => renderCanvasNode(root))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating Zoom Level Pill (Visible while pinching or zooming) */}
          {showZoomBadge && (
            <div className="absolute bottom-4 right-4 z-20 pointer-events-none bg-stone-900/85 backdrop-blur-md text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-black shadow-xl border border-white/20 transition-opacity">
              {Math.round(zoom * 100)}%
            </div>
          )}
        </div>
      )}
    </div>
  );
}
