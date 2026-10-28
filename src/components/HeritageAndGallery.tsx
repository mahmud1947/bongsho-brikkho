"use client";

import React, { useState } from "react";
import { History, Camera, MapPin, Calendar, Plus, Trash2 } from "lucide-react";
import { GalleryItem, Language, TimelineEvent } from "@/types/family";

interface HeritageAndGalleryProps {
  timeline: TimelineEvent[];
  gallery: GalleryItem[];
  lang: Language;
  onAddTimelineEvent: (ev: TimelineEvent) => void;
  onDeleteTimelineEvent: (id: string) => void;
  onAddGalleryItem: (item: GalleryItem) => void;
  onDeleteGalleryItem: (id: string) => void;
}

export default function HeritageAndGallery({
  timeline,
  gallery,
  lang,
  onAddTimelineEvent,
  onDeleteTimelineEvent,
  onAddGalleryItem,
  onDeleteGalleryItem,
}: HeritageAndGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Timeline form state
  const [showAddTimeline, setShowAddTimeline] = useState(false);
  const [tlYear, setTlYear] = useState("");
  const [tlTitle, setTlTitle] = useState("");

  // Gallery form state
  const [showAddGallery, setShowAddGallery] = useState(false);
  const [titleBn, setTitleBn] = useState("");
  const [yearBn, setYearBn] = useState("");
  const [locationBn, setLocationBn] = useState("");
  const [category, setCategory] = useState<GalleryItem["category"]>("reunion");
  const [imageUrl, setImageUrl] = useState("");

  const filteredGallery =
    selectedCategory === "all"
      ? gallery
      : gallery.filter((g) => g.category === selectedCategory);

  const handleTimelineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tlTitle.trim()) return;
    onAddTimelineEvent({
      id: `tl-${Date.now()}`,
      yearBn: tlYear.trim() || "-",
      yearEn: tlYear.trim() || "-",
      titleBn: tlTitle.trim(),
      titleEn: tlTitle.trim(),
      descriptionBn: "",
      descriptionEn: "",
      category: "milestone",
    });
    setTlYear("");
    setTlTitle("");
    setShowAddTimeline(false);
  };

  const handleGallerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleBn.trim() || !imageUrl.trim()) return;
    onAddGalleryItem({
      id: `gal-${Date.now()}`,
      titleBn: titleBn.trim(),
      titleEn: titleBn.trim(),
      yearBn: yearBn.trim() || "-",
      yearEn: yearBn.trim() || "-",
      category,
      descriptionBn: "",
      descriptionEn: "",
      locationBn: locationBn.trim() || "-",
      locationEn: locationBn.trim() || "-",
      imageUrl: imageUrl.trim(),
    });
    setTitleBn("");
    setYearBn("");
    setLocationBn("");
    setImageUrl("");
    setShowAddGallery(false);
  };

  return (
    <div className="space-y-8">
      {/* Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-800" />
            <h3 className="text-lg font-bold text-stone-900">
              {lang === "bn" ? "টাইমলাইন" : "Timeline"}
            </h3>
          </div>
          <button
            onClick={() => setShowAddTimeline(!showAddTimeline)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-900 text-amber-300 text-xs font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {lang === "bn" ? "যোগ" : "Add"}
          </button>
        </div>

        {showAddTimeline && (
          <form
            onSubmit={handleTimelineSubmit}
            className="bg-white border border-stone-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs"
          >
            <input
              type="text"
              required
              value={tlYear}
              onChange={(e) => setTlYear(e.target.value)}
              placeholder={lang === "bn" ? "সাল *" : "Year *"}
              className="px-3 py-2 rounded-xl border border-stone-200"
            />
            <input
              type="text"
              required
              value={tlTitle}
              onChange={(e) => setTlTitle(e.target.value)}
              placeholder={lang === "bn" ? "ঘটনা *" : "Milestone *"}
              className="px-3 py-2 rounded-xl border border-stone-200"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-900 text-amber-300 font-bold cursor-pointer"
            >
              {lang === "bn" ? "সংরক্ষণ" : "Save"}
            </button>
          </form>
        )}

        {timeline.length > 0 && (
          <div className="relative pl-6 border-l-2 border-emerald-700/40 space-y-3 ml-2">
            {timeline.map((ev) => (
              <div
                key={ev.id}
                className="relative bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-center justify-between gap-3"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-emerald-950 absolute -left-[31px]" />
                <div className="flex items-center gap-3 min-w-0">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-emerald-900 text-amber-300 flex-shrink-0">
                    {lang === "bn" ? ev.yearBn : ev.yearEn}
                  </span>
                  <h4 className="font-bold text-stone-900 text-sm sm:text-base truncate">
                    {lang === "bn" ? ev.titleBn : ev.titleEn}
                  </h4>
                </div>
                <button
                  onClick={() => onDeleteTimelineEvent(ev.id)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-bold text-stone-900">
              {lang === "bn" ? "গ্যালারি" : "Gallery"}
            </h3>
          </div>

          <button
            onClick={() => setShowAddGallery(!showAddGallery)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-900 text-amber-300 text-xs font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {lang === "bn" ? "যোগ" : "Add"}
          </button>
        </div>

        {showAddGallery && (
          <form
            onSubmit={handleGallerySubmit}
            className="bg-white border border-stone-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs"
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
              value={yearBn}
              onChange={(e) => setYearBn(e.target.value)}
              placeholder={lang === "bn" ? "সাল" : "Year"}
              className="px-3 py-2 rounded-xl border border-stone-200"
            />
            <input
              type="text"
              value={locationBn}
              onChange={(e) => setLocationBn(e.target.value)}
              placeholder={lang === "bn" ? "স্থান" : "Place"}
              className="px-3 py-2 rounded-xl border border-stone-200"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GalleryItem["category"])}
              className="px-3 py-2 rounded-xl border border-stone-200 bg-white"
            >
              <option value="homestead">{lang === "bn" ? "বাড়ি" : "Home"}</option>
              <option value="ancestors">{lang === "bn" ? "পূর্বপুরুষ" : "Ancestors"}</option>
              <option value="reunion">{lang === "bn" ? "মিলনমেলা" : "Reunion"}</option>
              <option value="documents">{lang === "bn" ? "দলিল" : "Deeds"}</option>
            </select>
            <div className="flex gap-2">
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Image URL *"
                className="flex-1 px-3 py-2 rounded-xl border border-stone-200"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-900 text-amber-300 font-bold cursor-pointer"
              >
                {lang === "bn" ? "সংরক্ষণ" : "Save"}
              </button>
            </div>
          </form>
        )}

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "all", bn: "সব", en: "All" },
            { id: "homestead", bn: "বাড়ি", en: "Home" },
            { id: "ancestors", bn: "পূর্বপুরুষ", en: "Ancestors" },
            { id: "reunion", bn: "মিলনমেলা", en: "Reunion" },
            { id: "documents", bn: "দলিল", en: "Deeds" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-emerald-900 text-amber-300"
                  : "bg-white text-stone-700 border border-stone-200"
              }`}
            >
              {lang === "bn" ? cat.bn : cat.en}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredGallery.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm"
            >
              <div className="h-48 overflow-hidden relative bg-stone-100">
                <img
                  src={item.imageUrl}
                  alt={lang === "bn" ? item.titleBn : item.titleEn}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-950/75 text-amber-300 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {lang === "bn" ? item.yearBn : item.yearEn}
                </span>
                <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/90 text-stone-800 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-700" />
                  {lang === "bn" ? item.locationBn : item.locationEn}
                </span>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <h4 className="font-bold text-stone-900 text-sm sm:text-base truncate">
                  {lang === "bn" ? item.titleBn : item.titleEn}
                </h4>
                <button
                  onClick={() => onDeleteGalleryItem(item.id)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
