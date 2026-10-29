"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TreePine,
  Users,
  User,
  BookOpen,
  Bell,
  UserPlus,
  Globe,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { useFamily } from "@/context/FamilyContext";

export default function Navbar() {
  const pathname = usePathname();
  const {
    lang,
    setLang,
    openAddModal,
    resetData,
    members,
    notices,
    isAdmin,
    logoutAdmin,
  } = useFamily();

  const navItems = [
    {
      href: "/",
      labelBn: "বৃক্ষ",
      labelEn: "Tree",
      icon: <TreePine className="w-4 h-4" />,
    },
    {
      href: "/directory",
      labelBn: "সদস্য",
      labelEn: "Members",
      icon: <Users className="w-4 h-4" />,
      badge: members.length,
    },
    {
      href: "/profile",
      labelBn: "প্রোফাইল",
      labelEn: "Profile",
      icon: <User className="w-4 h-4" />,
    },
    {
      href: "/heritage",
      labelBn: "ইতিহাস",
      labelEn: "History",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      href: "/notices",
      labelBn: "নোটিশ",
      labelEn: "Notices",
      icon: <Bell className="w-4 h-4" />,
      badge: notices.length,
    },
  ];

  const isRouteActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-emerald-950/95 backdrop-blur-md border-b border-emerald-800/70 text-white shadow">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2.5 sm:py-3 gap-2">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-emerald-950 shadow">
                <TreePine className="w-5 h-5 stroke-[2.3]" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-amber-300">
                {lang === "bn" ? "বংশবৃক্ষ" : "Bongsho"}
              </span>
            </Link>

            {/* Desktop Page Links */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navItems.map((item) => {
                const isActive = isRouteActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? "bg-amber-400 text-emerald-950 shadow-sm"
                        : "text-emerald-100 hover:bg-emerald-900"
                    }`}
                  >
                    {item.icon}
                    <span>{lang === "bn" ? item.labelBn : item.labelEn}</span>
                    {item.badge !== undefined && (
                      <span
                        className={`text-xs px-1.5 rounded-full font-bold ${
                          isActive
                            ? "bg-emerald-950 text-amber-300"
                            : "bg-emerald-800 text-emerald-200"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              {isAdmin && (
                <button
                  onClick={logoutAdmin}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-amber-400/20 border border-amber-400/50 text-xs font-bold text-amber-300 hover:bg-amber-400/30 cursor-pointer"
                  title={lang === "bn" ? "অ্যাডমিন লগআউট করুন" : "Logout Admin"}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">{lang === "bn" ? "অ্যাডমিন" : "Admin"}</span>
                </button>
              )}
              <button
                onClick={() => setLang(lang === "bn" ? "en" : "bn")}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 border border-emerald-700 text-xs font-bold text-amber-300 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "EN" : "বাং"}</span>
              </button>
              <button
                onClick={() => openAddModal(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs sm:text-sm shadow cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{lang === "bn" ? "অ্যাড" : "Add"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Links (5 items) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-emerald-950/98 backdrop-blur-lg border-t border-emerald-800 px-1.5 py-1.5 shadow-lg">
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = isRouteActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition ${
                  isActive
                    ? "bg-amber-400 text-emerald-950 font-bold"
                    : "text-emerald-200 hover:text-white"
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge !== undefined && (
                    <span
                      className={`absolute -top-1.5 -right-3 text-[9px] px-1 rounded-full font-extrabold ${
                        isActive
                          ? "bg-emerald-950 text-amber-300"
                          : "bg-amber-500 text-emerald-950"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 leading-none truncate max-w-full">
                  {lang === "bn" ? item.labelBn : item.labelEn}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
