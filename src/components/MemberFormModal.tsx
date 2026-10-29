"use client";

import React, { useState, useEffect } from "react";
import { X, Save, UserPlus, AlertCircle, Heart, Phone, MessageSquare, Share2 } from "lucide-react";
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

export const COUNTRY_OPTIONS = [
  { bn: "বাংলাদেশ", en: "Bangladesh" },
  { bn: "যুক্তরাজ্য (ইউকে)", en: "United Kingdom" },
  { bn: "যুক্তরাষ্ট্র (ইউএসএ)", en: "United States" },
  { bn: "সৌদি আরব", en: "Saudi Arabia" },
  { bn: "সংযুক্ত আরব আমিরাত", en: "UAE" },
  { bn: "কাতার", en: "Qatar" },
  { bn: "কুয়েত", en: "Kuwait" },
  { bn: "ওমান", en: "Oman" },
  { bn: "বাহরাইন", en: "Bahrain" },
  { bn: "মালয়েশিয়া", en: "Malaysia" },
  { bn: "সিঙ্গাপুর", en: "Singapore" },
  { bn: "কানাডা", en: "Canada" },
  { bn: "অস্ট্রেলিয়া", en: "Australia" },
  { bn: "ইতালি", en: "Italy" },
  { bn: "অন্যান্য (লিখুন)", en: "Other" },
];

const PROFESSION_OPTIONS = [
  { bn: "গৃহিণী", en: "Housewife" },
  { bn: "কৃষক", en: "Farmer" },
  { bn: "অবসরপ্রাপ্ত", en: "Retired" },
  { bn: "ব্যবসায়ী", en: "Businessman" },
  { bn: "শিক্ষার্থী", en: "Student" },
  { bn: "চাকরিজীবী", en: "Service" },
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

  // Nickname
  const [nicknameMode, setNicknameMode] = useState<"none" | "unknown" | "custom">("none");
  const [nicknameBn, setNicknameBn] = useState("");

  // Sex
  const [gender, setGender] = useState<"male" | "female">("male");

  const [parentId, setParentId] = useState<string>("");
  const [branchId, setBranchId] = useState<string>("root");
  const [generation, setGeneration] = useState<number>(1);

  // Spouse Details (without address)
  const [maritalStatus, setMaritalStatus] = useState<"married" | "unmarried">("unmarried");
  const [spouseNameBn, setSpouseNameBn] = useState("");
  const [spouseProfessionBn, setSpouseProfessionBn] = useState("");
  const [spousePhone, setSpousePhone] = useState("");

  // Profession
  const [professionSelect, setProfessionSelect] = useState<string>("গৃহিণী");
  const [professionCustom, setProfessionCustom] = useState<string>("");

  // Country
  const [countrySelect, setCountrySelect] = useState<string>("বাংলাদেশ");
  const [countryCustom, setCountryCustom] = useState<string>("");

  // Location / Address
  const [locationBn, setLocationBn] = useState("");

  // Phone, WhatsApp, Social
  const [phone, setPhone] = useState("");
  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState(true);
  const [whatsapp, setWhatsapp] = useState("");
  const [socialLink, setSocialLink] = useState("");

  // Birth
  const [birthYearPart, setBirthYearPart] = useState<string>("unknown");
  const [birthMonthPart, setBirthMonthPart] = useState<string>("");
  const [birthDayPart, setBirthDayPart] = useState<string>("");

  // Status & Blood
  const [isAlive, setIsAlive] = useState(true);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O+");

  // Errors
  const [formError, setFormError] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");

  const getNextChildBranch = (pid: string) => {
    const count = existingMembers.filter((m) => m.parentId === pid).length;
    const nextIdx = Math.min(count + 1, 10);
    return `child-${nextIdx}`;
  };

  useEffect(() => {
    setFormError("");
    setPhoneError("");

    if (editingMember) {
      setNameBn(editingMember.nameBn);
      setNameEn(editingMember.nameEn);

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

      setGender(editingMember.gender || "male");
      setParentId(editingMember.parentId || "");
      setBranchId(editingMember.branchId);
      setGeneration(editingMember.generation);

      const isUnmarried =
        !editingMember.spouseNameBn ||
        editingMember.spouseNameBn === "অবিবাহিত" ||
        editingMember.spouseNameBn === "Unmarried";
      setMaritalStatus(isUnmarried ? "unmarried" : "married");
      setSpouseNameBn(isUnmarried ? "" : editingMember.spouseNameBn || "");
      setSpouseProfessionBn(editingMember.spouseProfessionBn || "");
      setSpousePhone(editingMember.spousePhone || "");

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

      const matchedCountry = COUNTRY_OPTIONS.find(
        (c) => c.bn === editingMember.countryBn || c.en === editingMember.countryEn
      );
      if (matchedCountry) {
        setCountrySelect(matchedCountry.bn);
        setCountryCustom("");
      } else if (editingMember.countryBn && editingMember.countryBn !== "বাংলাদেশ") {
        setCountrySelect("custom");
        setCountryCustom(editingMember.countryBn);
      } else {
        setCountrySelect("বাংলাদেশ");
        setCountryCustom("");
      }

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

      if (editingMember.whatsapp && editingMember.whatsapp !== editingMember.phone) {
        setWhatsappSameAsPhone(false);
        setWhatsapp(editingMember.whatsapp);
      } else {
        setWhatsappSameAsPhone(true);
        setWhatsapp(editingMember.whatsapp || "");
      }
      setSocialLink(editingMember.socialLink || "");
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
      setSpouseProfessionBn("");
      setSpousePhone("");
      setProfessionSelect("শিক্ষার্থী");
      setProfessionCustom("");
      setCountrySelect("বাংলাদেশ");
      setCountryCustom("");
      setBirthYearPart("unknown");
      setBirthMonthPart("");
      setBirthDayPart("");
      setIsAlive(true);
      setBloodGroup("O+");
      setLocationBn(defaultParent.locationBn === "-" ? "" : defaultParent.locationBn || "");
      setPhone("");
      setWhatsappSameAsPhone(true);
      setWhatsapp("");
      setSocialLink("");
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
      setSpouseProfessionBn("");
      setSpousePhone("");
      setProfessionSelect("ব্যবসায়ী");
      setProfessionCustom("");
      setCountrySelect("বাংলাদেশ");
      setCountryCustom("");
      setBirthYearPart("unknown");
      setBirthMonthPart("");
      setBirthDayPart("");
      setIsAlive(true);
      setBloodGroup("O+");
      setLocationBn("");
      setPhone("");
      setWhatsappSameAsPhone(true);
      setWhatsapp("");
      setSocialLink("");
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

  const handlePhoneChange = (val: string) => {
    let cleaned = val.replace(/[^\d+]/g, "");
    if (cleaned.indexOf("+") > 0) {
      cleaned = cleaned[0] + cleaned.slice(1).replace(/\+/g, "");
    }
    setPhone(cleaned);

    const digitCount = cleaned.replace(/\D/g, "").length;
    if (cleaned && digitCount < 6) {
      setPhoneError(lang === "bn" ? "ফোন নম্বর কমপক্ষে ৬ ডিজিট হতে হবে" : "Phone must be at least 6 digits");
    } else if (digitCount > 15) {
      setPhoneError(lang === "bn" ? "ফোন নম্বর সর্বোচ্চ ১৫ ডিজিট হতে পারে" : "Phone max 15 digits");
    } else {
      setPhoneError("");
    }
  };

  const handleNameBnChange = (val: string) => {
    setNameBn(val);
    if (!editingMember) {
      if (/বেগম|খাতুন|বিবি|বানু|আক্তার/i.test(val)) {
        setGender("female");
        if (professionSelect !== "custom") {
          setProfessionSelect("গৃহিণী");
        }
      }
    }
  };

  const handleNameEnChange = (val: string) => {
    setNameEn(val);
    if (!editingMember) {
      if (/begum|khatun|bibi|banu|akter|aktar/i.test(val)) {
        setGender("female");
        if (professionSelect !== "custom") {
          setProfessionSelect("গৃহিণী");
        }
      }
    }
  };

  const handleGenderChange = (newGender: "male" | "female") => {
    setGender(newGender);
    if (!editingMember) {
      if (newGender === "female" && (professionSelect === "ব্যবসায়ী" || professionSelect === "কৃষক")) {
        setProfessionSelect("গৃহিণী");
      } else if (newGender === "male" && professionSelect === "গৃহিণী") {
        setProfessionSelect("ব্যবসায়ী");
      }
    }
  };

  const handleProfessionChange = (newProf: string) => {
    setProfessionSelect(newProf);
    if (!editingMember && newProf === "গৃহিণী") {
      setGender("female");
    }
  };

  const selectedMonthObj = MONTHS.find((m) => m.val === birthMonthPart);
  const maxDays = selectedMonthObj?.days || 31;
  const daysList = Array.from({ length: maxDays }, (_, i) => String(i + 1).padStart(2, "0"));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!nameBn.trim() && !nameEn.trim()) {
      setFormError(lang === "bn" ? "দয়া করে অন্তত একটি নাম লিখুন" : "Please enter at least one name");
      return;
    }

    if (phone.trim()) {
      const digitCount = phone.replace(/\D/g, "").length;
      if (digitCount < 6 || digitCount > 15) {
        setPhoneError(lang === "bn" ? "সঠিক ফোন নম্বর দিন (৬-১৫ ডিজিট)" : "Please enter a valid phone (6-15 digits)");
        setFormError(lang === "bn" ? "ফোন নম্বরটি সঠিক নয়" : "Invalid phone number");
        return;
      }
    }

    const finalNameBn = nameBn.trim() || nameEn.trim() || "মেম্বার";
    const finalNameEn = nameEn.trim() || nameBn.trim() || "Member";

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

    // WhatsApp: default to phone if sameAsPhone
    const finalWhatsapp = whatsappSameAsPhone
      ? phone.trim() || undefined
      : whatsapp.trim() || phone.trim() || undefined;

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
      spouseProfessionBn: spouseProfessionBn.trim() || undefined,
      spouseProfessionEn: spouseProfessionBn.trim() || undefined,
      spousePhone: spousePhone.trim() || undefined,
      birthYear: finalBirth,
      isAlive,
      bloodGroup,
      professionBn: finalProfBn,
      professionEn: finalProfEn,
      countryBn: finalCountryBn,
      countryEn: finalCountryEn,
      locationBn: locationBn.trim() || "জানা নেই",
      locationEn: locationBn.trim() || "Unknown",
      phone: phone.trim() || undefined,
      whatsapp: finalWhatsapp,
      socialLink: socialLink.trim() || undefined,
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
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col"
      >
        <div className="bg-emerald-950 px-5 py-3.5 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>
              {editingMember
                ? lang === "bn"
                  ? "মেম্বার এডিট"
                  : "Edit Member"
                : lang === "bn"
                ? "মেম্বার অ্যাড"
                : "Add Member"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {formError && (
          <div className="bg-rose-50 border-b border-rose-200 px-5 py-2.5 flex items-center gap-2 text-xs font-semibold text-rose-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto text-xs sm:text-sm">
          <div className="grid grid-cols-2 gap-3">
            {/* Parent */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "পিতা" : "Parent"}
              </label>
              <select
                value={parentId}
                onChange={(e) => handleParentChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
              >
                <option value="">{lang === "bn" ? "মূল (G1)" : "Root (G1)"}</option>
                {existingMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {lang === "bn" ? m.nameBn : m.nameEn} (G{m.generation})
                  </option>
                ))}
              </select>
            </div>

            {/* Order */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "ক্রম" : "Order"}
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

            {/* Name BN */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "নাম (বাংলা) *" : "Name (BN) *"}
              </label>
              <input
                type="text"
                required={!nameEn}
                value={nameBn}
                onChange={(e) => handleNameBnChange(e.target.value)}
                placeholder={lang === "bn" ? "বাংলা নাম..." : "Bangla name..."}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            {/* Name EN */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "নাম (ইংরেজি)" : "Name (EN)"}
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => handleNameEnChange(e.target.value)}
                placeholder={lang === "bn" ? "ইংরেজি নাম..." : "English name..."}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            {/* Nickname */}
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

            {/* Sex */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "লিঙ্গ" : "Sex"}
              </label>
              <select
                value={gender}
                onChange={(e) => handleGenderChange(e.target.value as "male" | "female")}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white font-semibold text-stone-800"
              >
                <option value="male">{lang === "bn" ? "পুরুষ" : "Male"}</option>
                <option value="female">{lang === "bn" ? "নারী" : "Female"}</option>
              </select>
            </div>

            {/* Profession */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "পেশা" : "Profession"}
              </label>
              <div className="flex gap-1.5">
                <select
                  value={professionSelect}
                  onChange={(e) => handleProfessionChange(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-stone-200 bg-white font-semibold"
                >
                  {PROFESSION_OPTIONS.map((p) => (
                    <option key={p.bn} value={p.bn}>
                      {lang === "bn" ? p.bn : p.en}
                    </option>
                  ))}
                  <option value="custom">
                    {lang === "bn" ? "অন্যান্য" : "Other"}
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

            {/* Blood */}
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

            {/* Country */}
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
                {countrySelect === "অন্যান্য (লিখুন)" && (
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

            {/* Address */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "ঠিকানা" : "Address"}
              </label>
              <input
                type="text"
                value={locationBn}
                onChange={(e) => setLocationBn(e.target.value)}
                placeholder={lang === "bn" ? "যেমন: কালাইউরা, সিলেট..." : "e.g. Sylhet..."}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            {/* Phone */}
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

            {/* Spouse Section (Simple: Name, Profession, Phone — No address) */}
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

            {/* Birth */}
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

            {/* Status */}
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
              className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-bold text-xs cursor-pointer hover:bg-stone-200"
            >
              {lang === "bn" ? "কেনসেল" : "Cancel"}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-900 text-amber-300 font-bold text-xs cursor-pointer hover:bg-emerald-800 shadow"
            >
              <Save className="w-3.5 h-3.5" />
              {lang === "bn" ? "সেইভ" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
