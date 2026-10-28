"use client";

import React, { useState, useEffect } from "react";
import { X, Save, UserPlus } from "lucide-react";
import { BloodGroup, FamilyBranch, FamilyMember, Language } from "@/types/family";

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: FamilyMember) => void;
  existingMembers: FamilyMember[];
  branches: FamilyBranch[];
  lang: Language;
  editingMember?: FamilyMember | null;
  defaultParent?: FamilyMember | null;
}

const BLOOD_GROUPS: BloodGroup[] = [
  "A+",
  "A-",
  "B+",
  "B-",
  "O+",
  "O-",
  "AB+",
  "AB-",
  "Unknown",
];

const PROFESSION_OPTIONS = [
  { bn: "গৃহিণী", en: "Housewife" },
  { bn: "কৃষক", en: "Farmer" },
  { bn: "রিটায়ার্ড (অবসরপ্রাপ্ত)", en: "Retired" },
  { bn: "ব্যবসায়ী", en: "Businessman" },
  { bn: "শিক্ষার্থী", en: "Student" },
  { bn: "চাকরিজীবী", en: "Service Holder" },
  { bn: "শিক্ষক", en: "Teacher" },
  { bn: "প্রবাসী", en: "Expatriate" },
  { bn: "চিকিৎসক", en: "Doctor" },
  { bn: "প্রকৌশলী", en: "Engineer" },
  { bn: "জানা নেই", en: "Unknown" },
];

const YEARS = Array.from({ length: 2026 - 1850 + 1 }, (_, i) => String(2026 - i));
const MONTHS = [
  { val: "01", bn: "০১ (জানুয়ারি)", en: "01 (Jan)" },
  { val: "02", bn: "০২ (ফেব্রুয়ারি)", en: "02 (Feb)" },
  { val: "03", bn: "০৩ (মার্চ)", en: "03 (Mar)" },
  { val: "04", bn: "০৪ (এপ্রিল)", en: "04 (Apr)" },
  { val: "05", bn: "০৫ (মে)", en: "05 (May)" },
  { val: "06", bn: "০৬ (জুন)", en: "06 (Jun)" },
  { val: "07", bn: "০৭ (জুলাই)", en: "07 (Jul)" },
  { val: "08", bn: "০৮ (আগস্ট)", en: "08 (Aug)" },
  { val: "09", bn: "০৯ (সেপ্টেম্বর)", en: "09 (Sep)" },
  { val: "10", bn: "১০ (অক্টোবর)", en: "10 (Oct)" },
  { val: "11", bn: "১১ (নভেম্বর)", en: "11 (Nov)" },
  { val: "12", bn: "১২ (ডিসেম্বর)", en: "12 (Dec)" },
];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

export default function MemberFormModal({
  isOpen,
  onClose,
  onSave,
  existingMembers,
  branches,
  lang,
  editingMember,
  defaultParent,
}: MemberFormModalProps) {
  const [nameBn, setNameBn] = useState("");
  const [nameEn, setNameEn] = useState("");

  // Nickname: "none" | "unknown" | "custom"
  const [nicknameMode, setNicknameMode] = useState<"none" | "unknown" | "custom">("none");
  const [nicknameBn, setNicknameBn] = useState("");

  const [gender, setGender] = useState<"male" | "female">("male");
  const [parentId, setParentId] = useState<string>("");
  const [branchId, setBranchId] = useState<string>("root");
  const [generation, setGeneration] = useState<number>(1);

  // Marital status
  const [maritalStatus, setMaritalStatus] = useState<"married" | "unmarried">("unmarried");
  const [spouseNameBn, setSpouseNameBn] = useState("");

  // Profession: preset or "custom"
  const [professionSelect, setProfessionSelect] = useState<string>("গৃহিণী");
  const [professionCustom, setProfessionCustom] = useState<string>("");

  // Birth: Year -> Month -> Day (or "unknown")
  const [birthYearPart, setBirthYearPart] = useState<string>("unknown");
  const [birthMonthPart, setBirthMonthPart] = useState<string>("");
  const [birthDayPart, setBirthDayPart] = useState<string>("");

  const [isAlive, setIsAlive] = useState(true);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O+");
  const [locationBn, setLocationBn] = useState("");
  const [phone, setPhone] = useState("");

  const getNextChildBranch = (pid: string) => {
    const count = existingMembers.filter((m) => m.parentId === pid).length;
    const nextIdx = Math.min(count + 1, 10);
    return `child-${nextIdx}`;
  };

  useEffect(() => {
    if (editingMember) {
      setNameBn(editingMember.nameBn);
      setNameEn(editingMember.nameEn);

      // Parse Nickname
      if (!editingMember.nicknameBn || editingMember.nicknameBn === "নেই" || editingMember.nicknameBn === "None") {
        setNicknameMode("none");
        setNicknameBn("");
      } else if (editingMember.nicknameBn === "জানা নেই" || editingMember.nicknameBn === "Unknown") {
        setNicknameMode("unknown");
        setNicknameBn("");
      } else {
        setNicknameMode("custom");
        setNicknameBn(editingMember.nicknameBn);
      }

      setGender(editingMember.gender);
      setParentId(editingMember.parentId || "");
      setBranchId(editingMember.branchId);
      setGeneration(editingMember.generation);

      // Parse Marital Status
      const isUnmarried =
        !editingMember.spouseNameBn ||
        editingMember.spouseNameBn === "অবিবাহিত" ||
        editingMember.spouseNameBn === "Unmarried";
      setMaritalStatus(isUnmarried ? "unmarried" : "married");
      setSpouseNameBn(isUnmarried ? "" : editingMember.spouseNameBn || "");

      // Parse Profession
      const matchedProf = PROFESSION_OPTIONS.find(
        (p) => p.bn === editingMember.professionBn || p.en === editingMember.professionEn
      );
      if (matchedProf) {
        setProfessionSelect(matchedProf.bn);
        setProfessionCustom("");
      } else if (editingMember.professionBn && editingMember.professionBn !== "-") {
        setProfessionSelect("custom");
        setProfessionCustom(editingMember.professionBn);
      } else {
        setProfessionSelect("জানা নেই");
        setProfessionCustom("");
      }

      // Parse Birth Date (YYYY-MM-DD or YYYY or জানা নেই)
      const by = editingMember.birthYear || "";
      if (!by || by === "জানা নেই" || by === "Unknown" || by === "?") {
        setBirthYearPart("unknown");
        setBirthMonthPart("");
        setBirthDayPart("");
      } else {
        const parts = by.split(/[-/]/);
        setBirthYearPart(parts[0] || "unknown");
        setBirthMonthPart(parts[1] || "");
        setBirthDayPart(parts[2] || "");
      }

      setIsAlive(editingMember.isAlive);
      setBloodGroup(editingMember.bloodGroup);
      setLocationBn(editingMember.locationBn === "-" ? "" : editingMember.locationBn);
      setPhone(editingMember.phone || "");
    } else if (defaultParent) {
      setNameBn("");
      setNameEn("");
      setNicknameMode("none");
      setNicknameBn("");
      setGender("male");
      setParentId(defaultParent.id);
      setBranchId(getNextChildBranch(defaultParent.id));
      setGeneration(defaultParent.generation + 1);
      setMaritalStatus("unmarried");
      setSpouseNameBn("");
      setProfessionSelect("শিক্ষার্থী");
      setProfessionCustom("");
      setBirthYearPart("unknown");
      setBirthMonthPart("");
      setBirthDayPart("");
      setIsAlive(true);
      setBloodGroup("O+");
      setLocationBn(defaultParent.locationBn === "-" ? "" : defaultParent.locationBn || "");
      setPhone("");
    } else {
      const first = existingMembers[0];
      setNameBn("");
      setNameEn("");
      setNicknameMode("none");
      setNicknameBn("");
      setGender("male");
      setParentId(first?.id || "");
      setBranchId(first ? getNextChildBranch(first.id) : "root");
      setGeneration(first ? first.generation + 1 : 1);
      setMaritalStatus("unmarried");
      setSpouseNameBn("");
      setProfessionSelect("গৃহিণী");
      setProfessionCustom("");
      setBirthYearPart("unknown");
      setBirthMonthPart("");
      setBirthDayPart("");
      setIsAlive(true);
      setBloodGroup("O+");
      setLocationBn("");
      setPhone("");
    }
  }, [editingMember, defaultParent, existingMembers, isOpen]);

  const handleParentChange = (newParentId: string) => {
    setParentId(newParentId);
    if (!newParentId) {
      setGeneration(1);
      setBranchId("root");
      return;
    }
    const p = existingMembers.find((m) => m.id === newParentId);
    if (p) {
      setGeneration(p.generation + 1);
      setBranchId(getNextChildBranch(p.id));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalNameBn = nameBn.trim() || nameEn.trim() || "সদস্য";
    const finalNameEn = nameEn.trim() || nameBn.trim() || "Member";

    // Nickname value
    const finalNickBn =
      nicknameMode === "none"
        ? "নেই"
        : nicknameMode === "unknown"
        ? "জানা নেই"
        : nicknameBn.trim() || "নেই";
    const finalNickEn =
      nicknameMode === "none"
        ? "None"
        : nicknameMode === "unknown"
        ? "Unknown"
        : nicknameBn.trim() || "None";

    // Spouse value
    const finalSpouseBn =
      maritalStatus === "unmarried"
        ? "অবিবাহিত"
        : spouseNameBn.trim() || "বিবাহিত";
    const finalSpouseEn =
      maritalStatus === "unmarried"
        ? "Unmarried"
        : spouseNameBn.trim() || "Married";

    // Profession value
    const matchedProf = PROFESSION_OPTIONS.find((p) => p.bn === professionSelect);
    const finalProfBn =
      professionSelect === "custom"
        ? professionCustom.trim() || "জানা নেই"
        : matchedProf?.bn || "জানা নেই";
    const finalProfEn =
      professionSelect === "custom"
        ? professionCustom.trim() || "Unknown"
        : matchedProf?.en || "Unknown";

    // Birth date value (Year -> Month -> Day)
    let finalBirth = "জানা নেই";
    if (birthYearPart !== "unknown") {
      finalBirth = birthYearPart;
      if (birthMonthPart) {
        finalBirth += `-${birthMonthPart}`;
        if (birthDayPart) {
          finalBirth += `-${birthDayPart}`;
        }
      }
    }

    onSave({
      id: editingMember ? editingMember.id : `mem-${Date.now()}`,
      username: editingMember?.username,
      nameBn: finalNameBn,
      nameEn: finalNameEn,
      nicknameBn: finalNickBn,
      nicknameEn: finalNickEn,
      gender,
      generation,
      branchId,
      parentId: parentId || null,
      spouseNameBn: finalSpouseBn,
      spouseNameEn: finalSpouseEn,
      birthYear: finalBirth,
      isAlive,
      bloodGroup,
      professionBn: finalProfBn,
      professionEn: finalProfEn,
      locationBn: locationBn.trim() || "জানা নেই",
      locationEn: locationBn.trim() || "Unknown",
      phone: phone.trim() || undefined,
      bioBn: "",
      bioEn: "",
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col"
      >
        <div className="bg-emerald-950 px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>
              {editingMember
                ? lang === "bn"
                  ? "সম্পাদনা"
                  : "Edit"
                : lang === "bn"
                ? "নতুন সদস্য"
                : "New Member"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3 overflow-y-auto text-xs sm:text-sm">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "পিতা" : "Parent"}
              </label>
              <select
                value={parentId}
                onChange={(e) => handleParentChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
              >
                <option value="">{lang === "bn" ? "মূল শিকড় (১ম প্রজন্ম)" : "Root (Gen 1)"}</option>
                {existingMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {lang === "bn" ? m.nameBn : m.nameEn} (G{m.generation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "শাখা (সন্তান ক্রম)" : "Child Order"}
              </label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {lang === "bn" ? b.nameBn : b.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "নাম (বাংলা) *" : "Name (BN) *"}
              </label>
              <input
                type="text"
                required={!nameEn}
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "নাম (ইংরেজি)" : "Name (EN)"}
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200"
              />
            </div>

            {/* ডাকনাম (Nickname with Default Options) */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "ডাকনাম" : "Nickname"}
              </label>
              <div className="flex gap-1.5">
                <select
                  value={nicknameMode}
                  onChange={(e) =>
                    setNicknameMode(e.target.value as "none" | "unknown" | "custom")
                  }
                  className="px-2.5 py-2 rounded-xl border border-stone-200 bg-white font-semibold"
                >
                  <option value="none">{lang === "bn" ? "নেই" : "None"}</option>
                  <option value="unknown">{lang === "bn" ? "জানা নেই" : "Unknown"}</option>
                  <option value="custom">{lang === "bn" ? "আছে (লিখুন)" : "Custom"}</option>
                </select>
                {nicknameMode === "custom" && (
                  <input
                    type="text"
                    value={nicknameBn}
                    onChange={(e) => setNicknameBn(e.target.value)}
                    placeholder={lang === "bn" ? "ডাকনাম..." : "Nickname..."}
                    className="flex-1 min-w-0 px-2.5 py-2 rounded-xl border border-stone-200"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "রক্ত" : "Blood"}
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white font-bold text-rose-700"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            {/* পেশা (Profession Suggestions + Custom) */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "পেশা" : "Profession"}
              </label>
              <div className="flex gap-1.5">
                <select
                  value={professionSelect}
                  onChange={(e) => setProfessionSelect(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-stone-200 bg-white font-semibold"
                >
                  {PROFESSION_OPTIONS.map((p) => (
                    <option key={p.bn} value={p.bn}>
                      {lang === "bn" ? p.bn : p.en}
                    </option>
                  ))}
                  <option value="custom">
                    {lang === "bn" ? "অন্যান্য (লিখুন)" : "Other (Type)"}
                  </option>
                </select>
                {professionSelect === "custom" && (
                  <input
                    type="text"
                    value={professionCustom}
                    onChange={(e) => setProfessionCustom(e.target.value)}
                    placeholder={lang === "bn" ? "পেশা..." : "Profession..."}
                    className="flex-1 min-w-0 px-2.5 py-2 rounded-xl border border-stone-200"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "ঠিকানা" : "Location"}
              </label>
              <input
                type="text"
                value={locationBn}
                onChange={(e) => setLocationBn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200"
              />
            </div>

            {/* জীবনসঙ্গী (Marital Status + Spouse Name) */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "জীবনসঙ্গী" : "Spouse"}
              </label>
              <div className="flex gap-1.5">
                <select
                  value={maritalStatus}
                  onChange={(e) =>
                    setMaritalStatus(e.target.value as "married" | "unmarried")
                  }
                  className="px-2.5 py-2 rounded-xl border border-stone-200 bg-white font-semibold"
                >
                  <option value="unmarried">
                    {lang === "bn" ? "অবিবাহিত" : "Unmarried"}
                  </option>
                  <option value="married">
                    {lang === "bn" ? "বিবাহিত" : "Married"}
                  </option>
                </select>
                {maritalStatus === "married" && (
                  <input
                    type="text"
                    value={spouseNameBn}
                    onChange={(e) => setSpouseNameBn(e.target.value)}
                    placeholder={lang === "bn" ? "নাম..." : "Name..."}
                    className="flex-1 min-w-0 px-2.5 py-2 rounded-xl border border-stone-200"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "ফোন" : "Phone"}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200"
              />
            </div>

            {/* জন্ম (Year -> Month -> Day or Unknown) */}
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "জন্ম (বছর - মাস - তারিখ)" : "Birth (Year - Month - Day)"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={birthYearPart}
                  onChange={(e) => {
                    setBirthYearPart(e.target.value);
                    if (e.target.value === "unknown") {
                      setBirthMonthPart("");
                      setBirthDayPart("");
                    }
                  }}
                  className="px-2.5 py-2 rounded-xl border border-stone-200 bg-white font-semibold"
                >
                  <option value="unknown">
                    {lang === "bn" ? "জানা নেই" : "Unknown"}
                  </option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>

                <select
                  disabled={birthYearPart === "unknown"}
                  value={birthMonthPart}
                  onChange={(e) => {
                    setBirthMonthPart(e.target.value);
                    if (!e.target.value) setBirthDayPart("");
                  }}
                  className="px-2.5 py-2 rounded-xl border border-stone-200 bg-white disabled:opacity-50"
                >
                  <option value="">{lang === "bn" ? "মাস" : "Month"}</option>
                  {MONTHS.map((m) => (
                    <option key={m.val} value={m.val}>
                      {lang === "bn" ? m.bn : m.en}
                    </option>
                  ))}
                </select>

                <select
                  disabled={birthYearPart === "unknown" || !birthMonthPart}
                  value={birthDayPart}
                  onChange={(e) => setBirthDayPart(e.target.value)}
                  className="px-2.5 py-2 rounded-xl border border-stone-200 bg-white disabled:opacity-50"
                >
                  <option value="">{lang === "bn" ? "তারিখ" : "Day"}</option>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "অবস্থা" : "Status"}
              </label>
              <select
                value={isAlive ? "alive" : "deceased"}
                onChange={(e) => setIsAlive(e.target.value === "alive")}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
              >
                <option value="alive">{lang === "bn" ? "জীবিত" : "Living"}</option>
                <option value="deceased">{lang === "bn" ? "প্রয়াত" : "Late"}</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-bold text-xs cursor-pointer"
            >
              {lang === "bn" ? "বাতিল" : "Cancel"}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-900 text-amber-300 font-bold text-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {lang === "bn" ? "সংরক্ষণ" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
