"use client";

import React, { useState } from "react";
import { Calendar, Pin, Plus, Megaphone, Trash2 } from "lucide-react";
import { FamilyNotice, Language } from "@/types/family";

interface NoticeBoardProps {
  notices: FamilyNotice[];
  lang: Language;
  onAddNotice: (notice: FamilyNotice) => void;
  onDeleteNotice: (id: string) => void;
}

export default function NoticeBoard({
  notices,
  lang,
  onAddNotice,
  onDeleteNotice,
}: NoticeBoardProps) {
  const [showForm, setShowForm] = useState(false);
  const [titleBn, setTitleBn] = useState("");
  const [dateBn, setDateBn] = useState("");
  const [category, setCategory] = useState<FamilyNotice["category"]>("reunion");
  const [postedByBn, setPostedByBn] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleBn.trim()) return;
    onAddNotice({
      id: `not-${Date.now()}`,
      titleBn: titleBn.trim(),
      titleEn: titleBn.trim(),
      dateBn: dateBn.trim() || (lang === "bn" ? "আজ" : "Today"),
      dateEn: dateBn.trim() || "Today",
      category,
      contentBn: "",
      contentEn: "",
      postedByBn: postedByBn.trim() || (lang === "bn" ? "অ্যাডমিন" : "Admin"),
      postedByEn: postedByBn.trim() || "Admin",
      isPinned: true,
    });
    setTitleBn("");
    setDateBn("");
    setPostedByBn("");
    setShowForm(false);
  };

  const getCategoryBadge = (cat: FamilyNotice["category"]) => {
    switch (cat) {
      case "reunion":
        return { bn: "মিলনমেলা", en: "Reunion", cls: "bg-emerald-100 text-emerald-900" };
      case "wedding":
        return { bn: "বিয়ে", en: "Wedding", cls: "bg-rose-100 text-rose-900" };
      case "prayer":
        return { bn: "দোয়া", en: "Prayer", cls: "bg-amber-100 text-amber-900" };
      default:
        return { bn: "জরুরি", en: "Urgent", cls: "bg-red-100 text-red-900" };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-bold text-stone-900">
            {lang === "bn" ? "নোটিশ" : "Notices"}
          </h2>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-900 text-amber-300 text-xs font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {lang === "bn" ? "যোগ" : "Add"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-stone-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs"
        >
          <input
            type="text"
            required
            value={titleBn}
            onChange={(e) => setTitleBn(e.target.value)}
            placeholder={lang === "bn" ? "শিরোনাম *" : "Title *"}
            className="px-3 py-2 rounded-xl border border-stone-200"
          />
          <input
            type="text"
            value={dateBn}
            onChange={(e) => setDateBn(e.target.value)}
            placeholder={lang === "bn" ? "তারিখ" : "Date"}
            className="px-3 py-2 rounded-xl border border-stone-200"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as FamilyNotice["category"])}
            className="px-3 py-2 rounded-xl border border-stone-200 bg-white"
          >
            <option value="reunion">{lang === "bn" ? "মিলনমেলা" : "Reunion"}</option>
            <option value="wedding">{lang === "bn" ? "বিয়ে" : "Wedding"}</option>
            <option value="prayer">{lang === "bn" ? "দোয়া" : "Prayer"}</option>
            <option value="urgent">{lang === "bn" ? "জরুরি" : "Urgent"}</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-900 text-amber-300 font-bold cursor-pointer"
          >
            {lang === "bn" ? "প্রকাশ" : "Post"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-3">
        {notices.map((n) => {
          const badge = getCategoryBadge(n.category);
          return (
            <div
              key={n.id}
              className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-center justify-between gap-2"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  {n.isPinned && <Pin className="w-3.5 h-3.5 text-amber-600" />}
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${badge.cls}`}>
                    {lang === "bn" ? badge.bn : badge.en}
                  </span>
                  <span className="text-xs text-stone-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {lang === "bn" ? n.dateBn : n.dateEn}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-stone-900 truncate">
                  {lang === "bn" ? n.titleBn : n.titleEn}
                </h3>
              </div>

              <button
                onClick={() => onDeleteNotice(n.id)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 cursor-pointer flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
