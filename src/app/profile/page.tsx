"use client";

import React, { useState } from "react";
import {
  User,
  AtSign,
  Heart,
  MapPin,
  Briefcase,
  Phone,
  Droplets,
  Calendar,
  UserPlus,
  Edit3,
  LogOut,
  Save,
  ArrowUpRight,
} from "lucide-react";
import { useFamily } from "@/context/FamilyContext";
import { BloodGroup } from "@/types/family";

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

export default function ProfilePage() {
  const {
    members,
    branches,
    lang,
    currentUsername,
    currentUserProfile,
    loginUsername,
    logoutUsername,
    saveMember,
    openAddModal,
    openEditModal,
    setSelectedMember,
  } = useFamily();

  const [usernameInput, setUsernameInput] = useState("");

  // New Profile Creation State
  const [nameBn, setNameBn] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nicknameMode, setNicknameMode] = useState<"none" | "unknown" | "custom">("none");
  const [nicknameBn, setNicknameBn] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [parentId, setParentId] = useState<string>("");
  const [branchId, setBranchId] = useState<string>("root");
  const [generation, setGeneration] = useState<number>(1);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O+");
  const [professionSelect, setProfessionSelect] = useState<string>("শিক্ষার্থী");
  const [professionCustom, setProfessionCustom] = useState<string>("");
  const [locationBn, setLocationBn] = useState("");
  const [maritalStatus, setMaritalStatus] = useState<"married" | "unmarried">("unmarried");
  const [spouseNameBn, setSpouseNameBn] = useState("");
  const [phone, setPhone] = useState("");
  const [birthYearPart, setBirthYearPart] = useState<string>("unknown");
  const [birthMonthPart, setBirthMonthPart] = useState<string>("");
  const [birthDayPart, setBirthDayPart] = useState<string>("");

  const handleParentChange = (newParentId: string) => {
    setParentId(newParentId);
    if (!newParentId) {
      setGeneration(1);
      setBranchId("root");
      return;
    }
    const p = members.find((m) => m.id === newParentId);
    if (p) {
      setGeneration(p.generation + 1);
      const count = members.filter((m) => m.parentId === p.id).length;
      setBranchId(`child-${Math.min(count + 1, 10)}`);
    }
  };

  // STEP 1: Enter Username
  if (!currentUsername) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-5 mt-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-950 text-amber-400 flex items-center justify-center">
            <AtSign className="w-5 h-5" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900">
            {lang === "bn" ? "ইউজারনেম" : "Username"}
          </h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (usernameInput.trim()) loginUsername(usernameInput);
          }}
          className="space-y-3"
        >
          <input
            type="text"
            required
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder={lang === "bn" ? "username লিখুন..." : "Enter username..."}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold text-sm shadow cursor-pointer"
          >
            {lang === "bn" ? "প্রবেশ" : "Continue"}
          </button>
        </form>
      </div>
    );
  }

  // STEP 2: Username entered, but profile not created yet -> Create Own Profile
  if (!currentUserProfile) {
    const handleCreateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      const finalNameBn = nameBn.trim() || nameEn.trim() || currentUsername;
      const finalNameEn = nameEn.trim() || nameBn.trim() || currentUsername;

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

      const finalSpouseBn =
        maritalStatus === "unmarried"
          ? "অবিবাহিত"
          : spouseNameBn.trim() || "বিবাহিত";
      const finalSpouseEn =
        maritalStatus === "unmarried"
          ? "Unmarried"
          : spouseNameBn.trim() || "Married";

      const matchedProf = PROFESSION_OPTIONS.find((p) => p.bn === professionSelect);
      const finalProfBn =
        professionSelect === "custom"
          ? professionCustom.trim() || "জানা নেই"
          : matchedProf?.bn || "জানা নেই";
      const finalProfEn =
        professionSelect === "custom"
          ? professionCustom.trim() || "Unknown"
          : matchedProf?.en || "Unknown";

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

      await saveMember({
        id: `user-${currentUsername}`,
        username: currentUsername,
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
        isAlive: true,
        bloodGroup,
        professionBn: finalProfBn,
        professionEn: finalProfEn,
        locationBn: locationBn.trim() || "জানা নেই",
        locationEn: locationBn.trim() || "Unknown",
        phone: phone.trim() || undefined,
        bioBn: "",
        bioEn: "",
      });
    };

    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="bg-emerald-950 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
            <User className="w-4 h-4 text-amber-400" />
            <span>@{currentUsername}</span>
          </div>
          <button
            onClick={logoutUsername}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            {lang === "bn" ? "পরিবর্তন" : "Change"}
          </button>
        </div>

        <form onSubmit={handleCreateProfile} className="p-5 space-y-3.5 text-xs sm:text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "পিতা" : "Parent"}
              </label>
              <select
                value={parentId}
                onChange={(e) => handleParentChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
              >
                <option value="">{lang === "bn" ? "মূল শিকড় (G1)" : "Root (G1)"}</option>
                {members.map((m) => (
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

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  {lang === "bn" ? "লিঙ্গ" : "Gender"}
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as "male" | "female")}
                  className="w-full px-2.5 py-2 rounded-xl border border-stone-200 bg-white"
                >
                  <option value="male">{lang === "bn" ? "পুরুষ" : "Male"}</option>
                  <option value="female">{lang === "bn" ? "নারী" : "Female"}</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  {lang === "bn" ? "রক্ত" : "Blood"}
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                  className="w-full px-2.5 py-2 rounded-xl border border-stone-200 bg-white font-bold text-rose-700"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold text-sm shadow cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {lang === "bn" ? "প্রোফাইল তৈরি করুন" : "Create Profile"}
          </button>
        </form>
      </div>
    );
  }

  // STEP 3: Own Profile View
  const parent = members.find((m) => m.id === currentUserProfile.parentId) || null;
  const children = members.filter((m) => m.parentId === currentUserProfile.id);
  const siblings = currentUserProfile.parentId
    ? members.filter(
        (m) =>
          m.parentId === currentUserProfile.parentId &&
          m.id !== currentUserProfile.id
      )
    : [];
  const branch = branches.find((b) => b.id === currentUserProfile.branchId);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-emerald-950 p-5 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-emerald-950 font-extrabold text-xl flex items-center justify-center flex-shrink-0">
            G{currentUserProfile.generation}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-400/20 text-amber-300">
                @{currentUserProfile.username || currentUsername}
              </span>
              {branch && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-800 text-emerald-100">
                  {lang === "bn" ? branch.nameBn : branch.nameEn}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold truncate">
              {lang === "bn"
                ? currentUserProfile.nameBn
                : currentUserProfile.nameEn}
            </h2>
            {(currentUserProfile.nicknameBn || currentUserProfile.nicknameEn) && (
              <p className="text-xs text-amber-300 font-semibold">
                {lang === "bn"
                  ? currentUserProfile.nicknameBn
                  : currentUserProfile.nicknameEn}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(currentUserProfile)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {lang === "bn" ? "সম্পাদনা" : "Edit"}
          </button>
          <button
            onClick={() => openAddModal(currentUserProfile)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            {lang === "bn" ? "সন্তান" : "Child"}
          </button>
          <button
            onClick={logoutUsername}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 cursor-pointer"
            title={lang === "bn" ? "প্রস্থান" : "Logout"}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6 space-y-5 text-xs sm:text-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-100">
            <Briefcase className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span className="font-semibold text-stone-800 truncate">
              {lang === "bn"
                ? currentUserProfile.professionBn
                : currentUserProfile.professionEn}
            </span>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-100">
            <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="font-semibold text-stone-800 truncate">
              {lang === "bn"
                ? currentUserProfile.locationBn
                : currentUserProfile.locationEn}
            </span>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-50/60 border border-rose-100">
            <Droplets className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span className="font-bold text-rose-700">
              {currentUserProfile.bloodGroup}
            </span>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-100">
            <Calendar className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span className="font-semibold text-stone-800">
              {currentUserProfile.birthYear || "-"}
            </span>
          </div>

          {(currentUserProfile.spouseNameBn || currentUserProfile.spouseNameEn) && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-50/60 border border-rose-100">
              <Heart className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span className="font-semibold text-stone-800 truncate">
                {lang === "bn"
                  ? currentUserProfile.spouseNameBn
                  : currentUserProfile.spouseNameEn}
              </span>
            </div>
          )}

          {currentUserProfile.phone && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 font-bold text-emerald-950">
              <Phone className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span className="truncate">{currentUserProfile.phone}</span>
            </div>
          )}
        </div>

        {/* Relatives */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-stone-100">
          <div>
            <p className="text-xs font-bold text-stone-500 mb-2">
              {lang === "bn" ? "পিতা" : "Parent"}
            </p>
            {parent ? (
              <button
                onClick={() => setSelectedMember(parent)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-950 border border-emerald-200 text-xs font-bold cursor-pointer"
              >
                <span>{lang === "bn" ? parent.nameBn : parent.nameEn}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-xs text-stone-400">-</span>
            )}
          </div>

          <div>
            <p className="text-xs font-bold text-stone-500 mb-2">
              {lang === "bn" ? "সন্তান" : "Children"} ({children.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {children.length > 0 ? (
                children.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedMember(c)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-950 border border-amber-200 text-xs font-bold cursor-pointer"
                  >
                    <span>{lang === "bn" ? c.nameBn : c.nameEn}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                ))
              ) : (
                <span className="text-xs text-stone-400">-</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-stone-500 mb-2">
              {lang === "bn" ? "ভাই-বোন" : "Siblings"} ({siblings.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {siblings.length > 0 ? (
                siblings.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedMember(s)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 text-stone-800 text-xs font-semibold cursor-pointer"
                  >
                    <span>{lang === "bn" ? s.nameBn : s.nameEn}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                ))
              ) : (
                <span className="text-xs text-stone-400">-</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
