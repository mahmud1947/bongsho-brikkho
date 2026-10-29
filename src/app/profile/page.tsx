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
  Globe,
  AlertCircle,
  MessageSquare,
  Share2,
  ShieldCheck,
  Lock,
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

const COUNTRY_OPTIONS = [
  { bn: "বাংলাদেশ", en: "Bangladesh" },
  { bn: "যুক্তরাজ্য (ইউকে)", en: "United Kingdom (UK)" },
  { bn: "যুক্তরাষ্ট্র (ইউএসএ)", en: "United States (USA)" },
  { bn: "সৌদি আরব", en: "Saudi Arabia" },
  { bn: "সংযুক্ত আরব আমিরাত (ইউএই)", en: "UAE" },
  { bn: "কাতার", en: "Qatar" },
  { bn: "কুয়েত", en: "Kuwait" },
  { bn: "ওমান", en: "Oman" },
  { bn: "বাহরাইন", en: "Bahrain" },
  { bn: "মালয়েশিয়া", en: "Malaysia" },
  { bn: "সিঙ্গাপুর", en: "Singapore" },
  { bn: "কানাডা", en: "Canada" },
  { bn: "অস্ট্রেলিয়া", en: "Australia" },
  { bn: "ইতালি", en: "Italy" },
  { bn: "আদার (টাইপ করুন)", en: "Other (Type)" },
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
  { val: "01", bn: "০১ (জানুয়ারি)", en: "01 (Jan)", days: 31 },
  { val: "02", bn: "০২ (ফেব্রুয়ারি)", en: "02 (Feb)", days: 29 },
  { val: "03", bn: "০৩ (মার্চ)", en: "03 (Mar)", days: 31 },
  { val: "04", bn: "০৪ (এপ্রিল)", en: "04 (Apr)", days: 30 },
  { val: "05", bn: "০৫ (মে)", en: "05 (May)", days: 31 },
  { val: "06", bn: "০৬ (জুন)", en: "06 (Jun)", days: 30 },
  { val: "07", bn: "০৭ (জুলাই)", en: "07 (Jul)", days: 31 },
  { val: "08", bn: "০৮ (আগস্ট)", en: "08 (Aug)", days: 31 },
  { val: "09", bn: "০৯ (সেপ্টেম্বর)", en: "09 (Sep)", days: 30 },
  { val: "10", bn: "১০ (অক্টোবর)", en: "10 (Oct)", days: 31 },
  { val: "11", bn: "১১ (নভেম্বর)", en: "11 (Nov)", days: 30 },
  { val: "12", bn: "১২ (ডিসেম্বর)", en: "12 (Dec)", days: 31 },
];

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
    isAdmin,
    logoutAdmin,
    openDeletePrompt,
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
  const [countrySelect, setCountrySelect] = useState<string>("বাংলাদেশ");
  const [countryCustom, setCountryCustom] = useState<string>("");
  const [locationBn, setLocationBn] = useState("");
  const [maritalStatus, setMaritalStatus] = useState<"married" | "unmarried">("unmarried");
  const [spouseNameBn, setSpouseNameBn] = useState("");
  const [spouseProfessionBn, setSpouseProfessionBn] = useState("");
  const [spouseLocationBn, setSpouseLocationBn] = useState("");
  const [spousePhone, setSpousePhone] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState(true);
  const [socialLink, setSocialLink] = useState("");

  const formatWhatsappUrl = (phoneOrWa?: string) => {
    if (!phoneOrWa) return "";
    let digits = phoneOrWa.replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("01") && digits.length === 11) {
      digits = "88" + digits;
    }
    return `https://wa.me/${digits}`;
  };

  const [birthYearPart, setBirthYearPart] = useState<string>("unknown");
  const [birthMonthPart, setBirthMonthPart] = useState<string>("");
  const [birthDayPart, setBirthDayPart] = useState<string>("");

  // Validations
  const [formError, setFormError] = useState("");
  const [phoneError, setPhoneError] = useState("");

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

  const handlePhoneChange = (val: string) => {
    let cleaned = val.replace(/[^\d+]/g, "");
    if (cleaned.indexOf("+") > 0) {
      cleaned = cleaned[0] + cleaned.slice(1).replace(/\+/g, "");
    }
    setPhone(cleaned);
    if (whatsappSameAsPhone) {
      setWhatsapp(cleaned);
    }

    const digitCount = cleaned.replace(/\D/g, "").length;
    if (cleaned && digitCount < 6) {
      setPhoneError(lang === "bn" ? "ফোন নম্বর কমপক্ষে ৬ ডিজিট হতে হবে" : "Phone must be at least 6 digits");
    } else if (digitCount > 15) {
      setPhoneError(lang === "bn" ? "ফোন নম্বর সর্বোচ্চ ১৫ ডিজিট হতে পারে" : "Phone max 15 digits");
    } else {
      setPhoneError("");
    }
  };

  const selectedMonthObj = MONTHS.find((m) => m.val === birthMonthPart);
  const maxDays = selectedMonthObj?.days || 31;
  const daysList = Array.from({ length: maxDays }, (_, i) => String(i + 1).padStart(2, "0"));

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
            {lang === "bn" ? "কন্টিনিউ" : "Continue"}
          </button>
        </form>
      </div>
    );
  }

  // STEP 2: Username entered, but profile not created yet -> Create Own Profile
  if (!currentUserProfile) {
    const handleCreateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError("");

      if (!nameBn.trim() && !nameEn.trim()) {
        setFormError(lang === "bn" ? "দয়া করে অন্তত একটি নাম (বাংলা বা ইংরেজি) লিখুন" : "Please enter at least one name");
        return;
      }

      if (phone.trim()) {
        const digitCount = phone.replace(/\D/g, "").length;
        if (digitCount < 6 || digitCount > 15) {
          setPhoneError(lang === "bn" ? "সঠিক ফোন নম্বর দিন (৬ থেকে ১৫ ডিজিট)" : "Please enter a valid phone (6-15 digits)");
          setFormError(lang === "bn" ? "ফোন নম্বরটি সঠিক নয়" : "Invalid phone number");
          return;
        }
      }

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

      const matchedCountry = COUNTRY_OPTIONS.find((c) => c.bn === countrySelect);
      const finalCountryBn =
        countrySelect === "custom"
          ? countryCustom.trim() || "বাংলাদেশ"
          : matchedCountry?.bn || "বাংলাদেশ";
      const finalCountryEn =
        countrySelect === "custom"
          ? countryCustom.trim() || "Bangladesh"
          : matchedCountry?.en || "Bangladesh";

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
        spouseProfessionBn: spouseProfessionBn.trim() || undefined,
        spouseProfessionEn: spouseProfessionBn.trim() || undefined,
        spousePhone: spousePhone.trim() || undefined,
        birthYear: finalBirth,
        isAlive: true,
        bloodGroup,
        professionBn: finalProfBn,
        professionEn: finalProfEn,
        countryBn: finalCountryBn,
        countryEn: finalCountryEn,
        locationBn: locationBn.trim() || "জানা নেই",
        locationEn: locationBn.trim() || "Unknown",
        phone: phone.trim() || undefined,
        whatsapp: (whatsappSameAsPhone ? phone.trim() : whatsapp.trim()) || undefined,
        socialLink: socialLink.trim() || undefined,
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
            {lang === "bn" ? "চেঞ্জ" : "Change"}
          </button>
        </div>

        {formError && (
          <div className="bg-rose-50 border-b border-rose-200 px-5 py-2.5 flex items-center gap-2 text-xs font-semibold text-rose-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateProfile} className="p-5 space-y-3.5 text-xs sm:text-sm">
          <div className="grid grid-cols-2 gap-3">
            {/* পিতা */}
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

            {/* শাখা */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "শাখা" : "Branch"}
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
                placeholder={lang === "bn" ? "বাংলা নাম..." : "Bangla name..."}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
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
                placeholder={lang === "bn" ? "ইংরেজি নাম..." : "English name..."}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            {/* ডাকনাম */}
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
                  <option value="custom">{lang === "bn" ? "আছে" : "Custom"}</option>
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

            {/* লিঙ্গ */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "লিঙ্গ" : "Sex"}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as "male" | "female")}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white font-semibold text-stone-800"
              >
                <option value="male">{lang === "bn" ? "পুরুষ" : "Male"}</option>
                <option value="female">{lang === "bn" ? "নারী" : "Female"}</option>
              </select>
            </div>

            {/* পেশা */}
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
                    {lang === "bn" ? "আদার (টাইপ করুন)" : "Other (Type)"}
                  </option>
                </select>
                {professionSelect === "custom" && (
                  <input
                    type="text"
                    value={professionCustom}
                    onChange={(e) => setProfessionCustom(e.target.value)}
                    placeholder={lang === "bn" ? "প্রফেশন..." : "Profession..."}
                    className="flex-1 min-w-0 px-2.5 py-2 rounded-xl border border-stone-200"
                  />
                )}
              </div>
            </div>

            {/* রক্ত */}
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

            {/* দেশ */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "দেশ" : "Country"}
              </label>
              <div className="flex gap-1.5">
                <select
                  value={countrySelect}
                  onChange={(e) => setCountrySelect(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-stone-200 bg-white font-semibold"
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.bn} value={c.bn}>
                      {lang === "bn" ? c.bn : c.en}
                    </option>
                  ))}
                </select>
                {countrySelect === "আদার (টাইপ করুন)" && (
                  <input
                    type="text"
                    value={countryCustom}
                    onChange={(e) => setCountryCustom(e.target.value)}
                    placeholder={lang === "bn" ? "দেশ..." : "Country..."}
                    className="flex-1 min-w-0 px-2.5 py-2 rounded-xl border border-stone-200"
                  />
                )}
              </div>
            </div>

            {/* ঠিকানা */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "ঠিকানা" : "Address"}
              </label>
              <input
                type="text"
                value={locationBn}
                onChange={(e) => setLocationBn(e.target.value)}
                placeholder={lang === "bn" ? "যেমন: ঢাকা, সিলেট..." : "e.g. Dhaka..."}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            {/* ফোন */}
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "ফোন" : "Phone"}
              </label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9+]*"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder={lang === "bn" ? "যেমন: 01712345678" : "e.g. +8801712345678"}
                className={`w-full px-3 py-2 rounded-xl border ${
                  phoneError ? "border-rose-400 bg-rose-50/40" : "border-stone-200"
                } focus:outline-none focus:ring-1 ${
                  phoneError ? "focus:ring-rose-500" : "focus:ring-emerald-600"
                }`}
              />
              {phoneError && (
                <p className="text-[10px] text-rose-600 font-medium mt-1">
                  {phoneError}
                </p>
              )}
            </div>

            {/* WhatsApp */}
            <div className="col-span-2 space-y-1.5 p-2.5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-950">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{lang === "bn" ? "হোয়াটসঅ্যাপ" : "WhatsApp"}</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={whatsappSameAsPhone}
                    onChange={(e) => {
                      setWhatsappSameAsPhone(e.target.checked);
                      if (e.target.checked) setWhatsapp(phone);
                    }}
                    className="rounded text-emerald-800 focus:ring-emerald-600"
                  />
                  <span>{lang === "bn" ? "ফোনের নম্বরটিই হোয়াটসঅ্যাপ" : "Same as Phone"}</span>
                </label>
              </div>

              {!whatsappSameAsPhone && (
                <input
                  type="tel"
                  inputMode="numeric"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value.replace(/[^\d+]/g, ""))}
                  placeholder={lang === "bn" ? "ভিন্ন হোয়াটসঅ্যাপ নম্বর..." : "Different WhatsApp number..."}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 text-xs"
                />
              )}
            </div>

            {/* Social Media Link */}
            <div className="col-span-2">
              <label className="flex items-center gap-1 text-[11px] font-bold text-stone-600 mb-1">
                <Share2 className="w-3 h-3 text-blue-600" />
                <span>{lang === "bn" ? "সোশ্যাল" : "Social Link"}</span>
              </label>
              <input
                type="url"
                value={socialLink}
                onChange={(e) => setSocialLink(e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-xs"
              />
            </div>

            {/* জীবনসঙ্গী */}
            <div className="col-span-2 bg-stone-50/80 p-3 rounded-2xl border border-stone-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-stone-700">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>{lang === "bn" ? "জীবনসঙ্গী" : "Spouse"}</span>
                </label>
                <select
                  value={maritalStatus}
                  onChange={(e) =>
                    setMaritalStatus(e.target.value as "married" | "unmarried")
                  }
                  className="px-2.5 py-1 rounded-xl border border-stone-200 bg-white font-semibold text-xs"
                >
                  <option value="unmarried">
                    {lang === "bn" ? "অবিবাহিত" : "Unmarried"}
                  </option>
                  <option value="married">
                    {lang === "bn" ? "বিবাহিত" : "Married"}
                  </option>
                </select>
              </div>

              {maritalStatus === "married" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-stone-200">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-1">
                      {lang === "bn" ? "নাম *" : "Name *"}
                    </label>
                    <input
                      type="text"
                      value={spouseNameBn}
                      onChange={(e) => setSpouseNameBn(e.target.value)}
                      placeholder={lang === "bn" ? "নাম..." : "Name..."}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-1">
                      {lang === "bn" ? "পেশা" : "Profession"}
                    </label>
                    <input
                      type="text"
                      value={spouseProfessionBn}
                      onChange={(e) => setSpouseProfessionBn(e.target.value)}
                      placeholder={lang === "bn" ? "পেশা..." : "Profession..."}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-1">
                      {lang === "bn" ? "ফোন" : "Phone"}
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={spousePhone}
                      onChange={(e) => setSpousePhone(e.target.value.replace(/[^\d+]/g, ""))}
                      placeholder={lang === "bn" ? "ফোন..." : "Phone..."}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "জন্ম" : "Birth"}
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
                  {daysList.map((d) => (
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
            {lang === "bn" ? "প্রোফাইল ক্রিয়েট" : "Create Profile"}
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
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-400/20 text-amber-300">
                @{currentUserProfile.username || currentUsername}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/15 text-stone-200">
                {currentUserProfile.gender === "female" ? (lang === "bn" ? "নারী" : "Female") : (lang === "bn" ? "পুরুষ" : "Male")}
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
            {lang === "bn" ? "এডিট" : "Edit"}
          </button>
          <button
            onClick={() => openAddModal(currentUserProfile)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            {lang === "bn" ? "সন্তান অ্যাড" : "Add Child"}
          </button>
          <button
            onClick={logoutUsername}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 cursor-pointer"
            title={lang === "bn" ? "লগআউট" : "Logout"}
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
            <Globe className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="font-semibold text-stone-800 truncate">
              {lang === "bn"
                ? currentUserProfile.countryBn || "বাংলাদেশ"
                : currentUserProfile.countryEn || "Bangladesh"}
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

          {currentUserProfile.phone && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 font-bold text-emerald-950">
              <Phone className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <a
                href={`tel:${currentUserProfile.phone.replace(/\s+/g, "")}`}
                className="truncate hover:underline"
              >
                {currentUserProfile.phone}
              </a>
            </div>
          )}

          {formatWhatsappUrl(currentUserProfile.whatsapp || currentUserProfile.phone) && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-green-50 border border-green-200 font-bold text-green-950">
              <MessageSquare className="w-4 h-4 text-green-600 flex-shrink-0" />
              <a
                href={formatWhatsappUrl(currentUserProfile.whatsapp || currentUserProfile.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:underline text-green-800"
              >
                {currentUserProfile.whatsapp || currentUserProfile.phone} (WA)
              </a>
            </div>
          )}

          {currentUserProfile.socialLink && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-200 font-bold text-blue-950">
              <Share2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <a
                href={currentUserProfile.socialLink.startsWith("http") ? currentUserProfile.socialLink : `https://${currentUserProfile.socialLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:underline text-blue-800"
              >
                Social
              </a>
            </div>
          )}
        </div>

        {/* Spouse Detailed Card */}
        {(currentUserProfile.spouseNameBn || currentUserProfile.spouseNameEn) && (
          <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-1.5">
            <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>{lang === "bn" ? "জীবনসঙ্গী" : "Spouse"}</span>
            </div>
            <div className="pl-5 text-xs text-stone-700 space-y-1">
              <p className="font-bold text-stone-900 text-sm">
                {lang === "bn" ? currentUserProfile.spouseNameBn : currentUserProfile.spouseNameEn}
              </p>
              {(currentUserProfile.spouseProfessionBn || currentUserProfile.spouseProfessionEn) && (
                <p className="text-stone-600 flex items-center gap-1">
                  <span>💼</span>
                  <span>{lang === "bn" ? currentUserProfile.spouseProfessionBn : currentUserProfile.spouseProfessionEn}</span>
                </p>
              )}
              {currentUserProfile.spousePhone && (
                <p className="text-stone-600 flex items-center gap-1">
                  <span>📞</span>
                  <a href={`tel:${currentUserProfile.spousePhone.replace(/\s+/g, "")}`} className="text-emerald-800 font-bold hover:underline">
                    {currentUserProfile.spousePhone}
                  </a>
                </p>
              )}
            </div>
          </div>
        )}

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

        {/* Admin Access / Delete Permission Section */}
        <div className="pt-4 border-t border-stone-200">
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isAdmin ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-stone-200 text-stone-700"
                }`}
              >
                {isAdmin ? <ShieldCheck className="w-5 h-5 text-amber-700" /> : <Lock className="w-4 h-4 text-stone-600" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <span>{lang === "bn" ? "অ্যাডমিন অনুমতি" : "Admin Permission"}</span>
                  {isAdmin && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-400 text-emerald-950 font-extrabold text-[10px]">
                      VERIFIED
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-stone-500">
                  {isAdmin
                    ? (lang === "bn" ? "আপনি অ্যাডমিন হিসেবে লগইন আছেন (ডিলিট করতে পারবেন)" : "Logged in as Admin (can delete)")
                    : (lang === "bn" ? "ডিলিট করার জন্য পাসওয়ার্ড প্রয়োজন" : "Password required to delete")}
                </p>
              </div>
            </div>

            {isAdmin ? (
              <button
                onClick={logoutAdmin}
                className="px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold cursor-pointer transition"
              >
                {lang === "bn" ? "লগআউট" : "Logout"}
              </button>
            ) : (
              <button
                onClick={() => {
                  openDeletePrompt({
                    title: lang === "bn" ? "অ্যাডমিন লগইন" : "Admin Login",
                    itemName: undefined,
                    onConfirm: async () => {},
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 text-xs font-bold shadow cursor-pointer transition"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "অ্যাডমিন লগইন" : "Admin Login"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
