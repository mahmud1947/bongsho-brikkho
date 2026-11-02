"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { FamilyBranch, FamilyMember, Language } from "@/types/family";
import TreeToolbar from "./tree/TreeToolbar";
import TreeBranchBar from "./tree/TreeBranchBar";
import TreeNodeCanvas from "./tree/TreeNodeCanvas";
import TreeNodeMobile from "./tree/TreeNodeMobile";

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

  // Initial State: Only G1 & G2 open initially (all generation >= 2 with children start collapsed)
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

  // Accordion expansion: Tapping a child expands only its family down and collapses sibling branches
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

  // Branch Quick-Select: Open everyone in a selected branch in a single glance
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
          delete newCollapsed[m.id];
        } else {
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
      <TreeToolbar
        lang={lang}
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        matchingMembers={matchingMembers}
        onSelectSearchMember={focusMember}
        onFitScreen={handleFitScreen}
      />

      {/* Branch Quick-Select Pill Bar */}
      <TreeBranchBar
        lang={lang}
        g2Members={g2Members}
        childrenMap={childrenMap}
        selectedBranchId={selectedBranchId}
        onExpandAll={() => {
          expandAll();
          setSelectedBranchId("full-tree");
          handleFitScreen();
        }}
        onResetToOverview={resetToOverview}
        onExpandBranch={expandBranch}
      />

      {/* Viewport: Mobile-tree (List) or Visual Canvas (Chart) */}
      {viewMode === "mobile-tree" ? (
        <div className="space-y-2.5">
          {rootMembers.map((root) => (
            <TreeNodeMobile
              key={root.id}
              member={root}
              childrenMap={childrenMap}
              collapsedIds={collapsedIds}
              highlightedId={highlightedId}
              lang={lang}
              onNodeTap={handleNodeTap}
              onSelectMember={onSelectMember}
              onAddChildToMember={onAddChildToMember}
            />
          ))}
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
                  {rootMembers.map((root) => (
                    <TreeNodeCanvas
                      key={root.id}
                      member={root}
                      childrenMap={childrenMap}
                      collapsedIds={collapsedIds}
                      highlightedId={highlightedId}
                      lang={lang}
                      onNodeTap={handleNodeTap}
                      onSelectMember={onSelectMember}
                      onAddChildToMember={onAddChildToMember}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating Zoom Level Pill */}
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
