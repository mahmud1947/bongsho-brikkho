"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  AtSign,
  MapPin,
  Briefcase,
  Phone,
  Droplets,
  Calendar,
  Edit3,
  LogOut,
  Save,
  Globe,
  AlertCircle,
  MessageSquare,
  Share2,
  FileText,
  X,
  CheckCircle2,
  Shield,
  Sparkles,
} from "lucide-react";
import { useFamily } from "@/context/FamilyContext";
import { BloodGroup, UserProfile, formatSocialUrl } from "@/types/family";
import AdminLoginCard from "@/components/AdminLoginCard";
import CountryFlag from "@/components/CountryFlag";

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
  { bn: "জার্মানি", en: "Germany" },
  { bn: "ফ্রান্স", en: "France" },
  { bn: "ভারত", en: "India" },
  { bn: "পাকিস্তান", en: "Pakistan" },
];

const PROFESSION_OPTIONS = [
  { bn: "শিক্ষার্থী", en: "Student" },
  { bn: "চাকরিজীবী", en: "Employee" },
  { bn: "ব্যবসায়ী", en: "Businessman" },
  { bn: "প্রকৌশলী", en: "Engineer" },
  { bn: "চিকিৎসক", en: "Doctor" },
  { bn: "শিক্ষক", en: "Teacher" },
  { bn: "আইনজীবী", en: "Lawyer" },
  { bn: "ব্যাংকার", en: "Banker" },
  { bn: "প্রবাসী", en: "Expatriate" },
  { bn: "গৃহিণী", en: "Homemaker" },
  { bn: "অবসরপ্রাপ্ত", en: "Retired" },
  { bn: "জানা নেই", en: "Unknown" },
];

const YEARS = Array.from({ length: 2026 - 1920 + 1 }, (_, i) => String(2026 - i));
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
    lang,
    currentUsername,
    currentUserProfile,
    loginUsername,
    logoutUsername,
    saveUserProfile,
  } = useFamily();

  const [usernameInput, setUsernameInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [nameBn, setNameBn] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O+");
  const [professionSelect, setProfessionSelect] = useState<string>("শিক্ষার্থী");
  const [professionCustom, setProfessionCustom] = useState<string>("");
  const [countrySelect, setCountrySelect] = useState<string>("বাংলাদেশ");
  const [countryCustom, setCountryCustom] = useState<string>("");
  const [locationBn, setLocationBn] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState(true);
  const [socialLink, setSocialLink] = useState("");
  const [bio, setBio] = useState("");

  const [birthYearPart, setBirthYearPart] = useState<string>("unknown");
  const [birthMonthPart, setBirthMonthPart] = useState<string>("");
  const [birthDayPart, setBirthDayPart] = useState<string>("");

  const [formError, setFormError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state when editing existing profile
  useEffect(() => {
    if (currentUserProfile) {
      setNameBn(currentUserProfile.nameBn || "");
      setNameEn(currentUserProfile.nameEn || "");
      setGender(currentUserProfile.gender || "male");
      setBloodGroup(currentUserProfile.bloodGroup || "O+");
      setLocationBn(currentUserProfile.locationBn || "");
      setPhone(currentUserProfile.phone || "");
      setWhatsapp(currentUserProfile.whatsapp || "");
      setWhatsappSameAsPhone(
        !currentUserProfile.whatsapp || currentUserProfile.whatsapp === currentUserProfile.phone
      );
      setSocialLink(currentUserProfile.socialLink || "");
      setBio(currentUserProfile.bio || "");

      // Country match
      const cMatch = COUNTRY_OPTIONS.find(
        (c) => c.bn === currentUserProfile.countryBn || c.en === currentUserProfile.countryEn
      );
      if (cMatch) {
        setCountrySelect(cMatch.bn);
        setCountryCustom("");
      } else if (currentUserProfile.countryBn) {
        setCountrySelect("custom");
        setCountryCustom(currentUserProfile.countryBn);
      }

      // Profession match
      const pMatch = PROFESSION_OPTIONS.find(
        (p) => p.bn === currentUserProfile.professionBn || p.en === currentUserProfile.professionEn
      );
      if (pMatch) {
        setProfessionSelect(pMatch.bn);
        setProfessionCustom("");
      } else if (currentUserProfile.professionBn) {
        setProfessionSelect("custom");
        setProfessionCustom(currentUserProfile.professionBn);
      }

      // Birth parse
      if (currentUserProfile.birthYear && currentUserProfile.birthYear !== "জানা নেই") {
        const parts = currentUserProfile.birthYear.split("-");
        if (parts[0]) setBirthYearPart(parts[0]);
        if (parts[1]) setBirthMonthPart(parts[1]);
        if (parts[2]) setBirthDayPart(parts[2]);
      }
    }
  }, [currentUserProfile]);

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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSaveSuccess(false);

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

    const finalNameBn = nameBn.trim() || nameEn.trim() || (currentUsername || "");
    const finalNameEn = nameEn.trim() || nameBn.trim() || (currentUsername || "");

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

    const profileData: UserProfile = {
      username: currentUsername || "user",
      nameBn: finalNameBn,
      nameEn: finalNameEn,
      gender,
      bloodGroup,
      professionBn: finalProfBn,
      professionEn: finalProfEn,
      countryBn: finalCountryBn,
      countryEn: finalCountryEn,
      locationBn: locationBn.trim() || undefined,
      phone: phone.trim() || undefined,
      whatsapp: whatsappSameAsPhone ? phone.trim() || undefined : whatsapp.trim() || undefined,
      socialLink: socialLink.trim() || undefined,
      birthYear: finalBirth !== "জানা নেই" ? finalBirth : undefined,
      bio: bio.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    await saveUserProfile(profileData);
    setSaveSuccess(true);
    setIsEditing(false);
  };

  const formatWhatsappUrl = (phoneOrWa?: string) => {
    if (!phoneOrWa) return "";
    let digits = phoneOrWa.replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("01") && digits.length === 11) {
      digits = "88" + digits;
    }
    return `https://wa.me/${digits}`;
  };

  // STEP 1: Not Logged In
  if (!currentUsername) {
    return (
      <div className="max-w-md mx-auto space-y-4 px-2 sm:px-0">
        <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-amber-400 flex items-center justify-center shadow-sm flex-shrink-0">
              <AtSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 leading-tight">
                {lang === "bn" ? "ব্যক্তিগত অ্যাকাউন্ট" : "Personal Account"}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {lang === "bn"
                  ? "ইউজারনেম দিয়ে লগইন বা প্রোফাইল তৈরি করুন"
                  : "Login or create profile with username"}
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (usernameInput.trim()) loginUsername(usernameInput);
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "ইউজারনেম (Username)" : "Username"}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">@</span>
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder={lang === "bn" ? "যেমন: mahmud2026" : "e.g. mahmud2026"}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-stone-50/50 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold text-sm shadow cursor-pointer transition flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>{lang === "bn" ? "এগিয়ে যান" : "Continue"}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-stone-100 flex items-center gap-2 text-[11px] text-stone-500">
            <Shield className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
            <span>
              {lang === "bn"
                ? "এটি আপনার পার্সোনাল আইডি, যা বংশবৃক্ষের ডেটার সাথে যুক্ত হবে না।"
                : "Personal ID kept independent from family tree nodes."}
            </span>
          </div>
        </div>

        <AdminLoginCard />
      </div>
    );
  }

  // STEP 2: Creating or Editing Personal Profile Form
  if (!currentUserProfile || isEditing) {
    return (
      <div className="max-w-xl mx-auto space-y-4 px-1 sm:px-0">
        <div className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-sm">
          {/* Mobile-First Header */}
          <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 px-4 py-3.5 sm:px-5 sm:py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center flex-shrink-0">
                <Edit3 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300/90 block">
                  {lang === "bn" ? "প্রোফাইল তথ্য" : "Personal Info"}
                </span>
                <span className="font-bold text-sm sm:text-base text-white truncate block">
                  @{currentUsername}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {currentUserProfile && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer transition flex items-center gap-1"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{lang === "bn" ? "বাতিল" : "Cancel"}</span>
                </button>
              )}
              <button
                type="button"
                onClick={logoutUsername}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-rose-300 cursor-pointer transition"
                title={lang === "bn" ? "লগআউট" : "Logout"}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Discreet Identity Pill */}
          <div className="px-4 py-2 bg-stone-50 border-b border-stone-200/70 flex items-center gap-2 text-[11px] text-stone-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0"></span>
            <span className="truncate">
              {lang === "bn"
                ? "ব্যক্তিগত অ্যাকাউন্ট • বংশবৃক্ষের ডেটার সাথে সরাসরি সংযুক্ত নয়"
                : "Personal Profile • Stored independently from family tree"}
            </span>
          </div>

          {formError && (
            <div className="mx-4 mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="p-3.5 sm:p-5 space-y-3.5 text-xs sm:text-sm">
            {/* CARD 1: মৌলিক তথ্য (Basic Info) */}
            <div className="bg-stone-50/70 p-3 sm:p-3.5 rounded-2xl border border-stone-200/80 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>{lang === "bn" ? "১. পরিচয় ও মৌলিক তথ্য" : "1. Basic Identity"}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* নাম (বাংলা) */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    {lang === "bn" ? "নাম (বাংলা)" : "Name (Bengali)"}
                  </label>
                  <input
                    type="text"
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
                    placeholder={lang === "bn" ? "যেমন: মোঃ আব্দুল করিম" : "e.g. Abdul Karim"}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                {/* নাম (ইংরেজি) */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    {lang === "bn" ? "নাম (English)" : "Name (English)"}
                  </label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Abdul Karim"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                {/* লিঙ্গ (Gender Toggle) */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    {lang === "bn" ? "লিঙ্গ" : "Gender"}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-200/60 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setGender("male")}
                      className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        gender === "male"
                          ? "bg-emerald-900 text-amber-300 shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      <span>👨</span>
                      <span>{lang === "bn" ? "পুরুষ" : "Male"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender("female")}
                      className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        gender === "female"
                          ? "bg-pink-700 text-white shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      <span>👩</span>
                      <span>{lang === "bn" ? "নারী" : "Female"}</span>
                    </button>
                  </div>
                </div>

                {/* রক্তের গ্রুপ (Blood Group) */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1 flex items-center justify-between">
                    <span>{lang === "bn" ? "রক্তের গ্রুপ" : "Blood Group"}</span>
                    <Droplets className="w-3 h-3 text-rose-600" />
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white font-bold text-rose-700 text-xs sm:text-sm"
                  >
                    {BLOOD_GROUPS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* CARD 2: অবস্থান ও পেশা (Location & Work) */}
            <div className="bg-stone-50/70 p-3 sm:p-3.5 rounded-2xl border border-stone-200/80 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>{lang === "bn" ? "২. বাসস্থান ও পেশা" : "2. Location & Profession"}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* দেশ */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1 flex items-center justify-between">
                    <span>{lang === "bn" ? "দেশ" : "Country"}</span>
                    <CountryFlag country={countrySelect} className="w-4 h-3" />
                  </label>
                  <select
                    value={countrySelect}
                    onChange={(e) => setCountrySelect(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm"
                  >
                    {COUNTRY_OPTIONS.map((c) => (
                      <option key={c.bn} value={c.bn}>
                        {lang === "bn" ? c.bn : c.en}
                      </option>
                    ))}
                    <option value="custom">{lang === "bn" ? "অন্যান্য (লিখুন)" : "Other (Type)"}</option>
                  </select>
                  {countrySelect === "custom" && (
                    <input
                      type="text"
                      value={countryCustom}
                      onChange={(e) => setCountryCustom(e.target.value)}
                      placeholder={lang === "bn" ? "দেশের নাম লিখুন..." : "Enter country..."}
                      className="w-full mt-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs"
                    />
                  )}
                </div>

                {/* পেশা */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1 flex items-center justify-between">
                    <span>{lang === "bn" ? "পেশা" : "Profession"}</span>
                    <Briefcase className="w-3 h-3 text-emerald-700" />
                  </label>
                  <select
                    value={professionSelect}
                    onChange={(e) => setProfessionSelect(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm"
                  >
                    {PROFESSION_OPTIONS.map((p) => (
                      <option key={p.bn} value={p.bn}>
                        {lang === "bn" ? p.bn : p.en}
                      </option>
                    ))}
                    <option value="custom">{lang === "bn" ? "অন্যান্য (লিখুন)" : "Other (Type)"}</option>
                  </select>
                  {professionSelect === "custom" && (
                    <input
                      type="text"
                      value={professionCustom}
                      onChange={(e) => setProfessionCustom(e.target.value)}
                      placeholder={lang === "bn" ? "পেশা লিখুন..." : "Enter profession..."}
                      className="w-full mt-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs"
                    />
                  )}
                </div>

                {/* বর্তমান ঠিকানা */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    {lang === "bn" ? "বর্তমান ঠিকানা (শহর / এলাকা)" : "Current Address (City / Area)"}
                  </label>
                  <input
                    type="text"
                    value={locationBn}
                    onChange={(e) => setLocationBn(e.target.value)}
                    placeholder={lang === "bn" ? "যেমন: উপশহর, সিলেট..." : "e.g. Sylhet..."}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* CARD 3: যোগাযোগ (Contact Info) */}
            <div className="bg-stone-50/70 p-3 sm:p-3.5 rounded-2xl border border-stone-200/80 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>{lang === "bn" ? "৩. যোগাযোগ মাধ্যম" : "3. Contact & Social"}</span>
              </div>

              <div className="space-y-2.5">
                {/* ফোন */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    {lang === "bn" ? "মোবাইল নম্বর" : "Mobile Number"}
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+88017..."
                    className={`w-full px-3 py-2 rounded-xl border ${
                      phoneError ? "border-rose-400 bg-rose-50/40" : "border-stone-200 bg-white"
                    } text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600`}
                  />
                  {phoneError && <p className="text-[10px] text-rose-600 font-medium mt-1">{phoneError}</p>}
                </div>

                {/* WhatsApp */}
                <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-2">
                  <div className="flex items-center justify-between gap-2">
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
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs"
                    />
                  )}
                </div>

                {/* Social Media Link / Instagram */}
                <div>
                  <label className="flex items-center gap-1 text-[11px] font-bold text-stone-600 mb-1">
                    <Share2 className="w-3 h-3 text-blue-600" />
                    <span>{lang === "bn" ? "সোশ্যাল লিংক / ইনস্টাগ্রাম আইডি" : "Social Link / Instagram ID"}</span>
                  </label>
                  <input
                    type="text"
                    value={socialLink}
                    onChange={(e) => setSocialLink(e.target.value)}
                    placeholder={
                      lang === "bn"
                        ? "ইনস্টাগ্রাম ইউজারনেম, fb.com/..., ইত্যাদি"
                        : "instagram username, fb.com/..., etc."
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* CARD 4: জন্ম ও বায়ো (Optional Details) */}
            <div className="bg-stone-50/70 p-3 sm:p-3.5 rounded-2xl border border-stone-200/80 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                <span>{lang === "bn" ? "৪. জন্ম তারিখ ও বায়ো (ঐচ্ছিক)" : "4. Birth Date & Bio (Optional)"}</span>
              </div>

              {/* জন্ম তারিখ */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  {lang === "bn" ? "জন্ম তারিখ" : "Birth Date"}
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
                    className="px-2 py-2 rounded-xl border border-stone-200 bg-white font-semibold text-xs sm:text-sm"
                  >
                    <option value="unknown">{lang === "bn" ? "বছর (অজ্ঞাত)" : "Year"}</option>
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
                    className="px-2 py-2 rounded-xl border border-stone-200 bg-white disabled:opacity-40 text-xs sm:text-sm"
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
                    className="px-2 py-2 rounded-xl border border-stone-200 bg-white disabled:opacity-40 text-xs sm:text-sm"
                  >
                    <option value="">{lang === "bn" ? "দিন" : "Day"}</option>
                    {daysList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* বায়ো */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  {lang === "bn" ? "ব্যক্তিগত পরিচয় / বায়ো" : "Personal Bio"}
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={lang === "bn" ? "নিজের সম্পর্কে সংক্ষেপে কিছু লিখুন..." : "A brief note about yourself..."}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold text-sm shadow-md cursor-pointer transition flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{lang === "bn" ? "প্রোফাইল সংরক্ষণ করুন" : "Save Profile"}</span>
              </button>

              {currentUserProfile && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm cursor-pointer transition"
                >
                  {lang === "bn" ? "বাতিল" : "Cancel"}
                </button>
              )}
            </div>
          </form>
        </div>

        <AdminLoginCard />
      </div>
    );
  }

  // STEP 3: Viewing Personal Profile (Beautiful Mobile-First Profile Card)
  const displayName =
    lang === "bn"
      ? currentUserProfile.nameBn || currentUserProfile.nameEn
      : currentUserProfile.nameEn || currentUserProfile.nameBn;

  return (
    <div className="max-w-xl mx-auto space-y-4 px-1 sm:px-0">
      {saveSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{lang === "bn" ? "প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে!" : "Profile saved successfully!"}</span>
          </div>
          <button onClick={() => setSaveSuccess(false)} className="text-emerald-700 p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        {/* Banner + Avatar */}
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-5 sm:p-6 text-white relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-300 text-emerald-950 font-black text-2xl sm:text-3xl flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-white/20">
                {displayName.charAt(0) || "U"}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    @{currentUserProfile.username}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-white/15 text-stone-100">
                    {currentUserProfile.gender === "female" ? (lang === "bn" ? "নারী" : "Female") : (lang === "bn" ? "পুরুষ" : "Male")}
                  </span>
                  {currentUserProfile.bloodGroup && currentUserProfile.bloodGroup !== "Unknown" && (
                    <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-rose-500/25 text-rose-300 border border-rose-400/30 flex items-center gap-1">
                      <Droplets className="w-2.5 h-2.5 text-rose-400" />
                      <span>{currentUserProfile.bloodGroup}</span>
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-black truncate text-white drop-shadow-xs">{displayName}</h2>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-amber-300 text-xs font-bold cursor-pointer transition border border-white/10"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "এডিট" : "Edit"}</span>
              </button>
              <button
                onClick={logoutUsername}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-rose-300 cursor-pointer transition border border-white/10"
                title={lang === "bn" ? "লগআউট" : "Logout"}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Discreet Context Banner */}
        <div className="px-4 py-2 bg-stone-50 border-b border-stone-200/70 flex items-center gap-2 text-[11px] text-stone-600">
          <Shield className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
          <span className="truncate">
            {lang === "bn"
              ? "ব্যক্তিগত অ্যাকাউন্ট • বংশবৃক্ষের ডেটা থেকে সম্পূর্ণ আলাদা"
              : "Personal Profile • Stored independently from family tree"}
          </span>
        </div>

        {/* Quick Contact Action Pills */}
        {(currentUserProfile.phone || currentUserProfile.whatsapp || currentUserProfile.socialLink) && (
          <div className="p-3 bg-stone-50/50 border-b border-stone-100 flex items-center gap-2 flex-wrap">
            {currentUserProfile.phone && (
              <a
                href={`tel:${currentUserProfile.phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>{currentUserProfile.phone}</span>
              </a>
            )}

            {formatWhatsappUrl(currentUserProfile.whatsapp || currentUserProfile.phone) && (
              <a
                href={formatWhatsappUrl(currentUserProfile.whatsapp || currentUserProfile.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 hover:bg-green-100 text-green-900 border border-green-200 text-xs font-bold transition"
              >
                <MessageSquare className="w-3.5 h-3.5 text-green-600" />
                <span>WhatsApp</span>
              </a>
            )}

            {currentUserProfile.socialLink && (
              <a
                href={formatSocialUrl(currentUserProfile.socialLink)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold transition"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Social Link</span>
              </a>
            )}
          </div>
        )}

        {/* Details Grid (Mobile-First 2 Columns) */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {/* Country */}
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-stone-50 border border-stone-100">
              <CountryFlag country={currentUserProfile.countryBn || currentUserProfile.countryEn} className="w-5 h-3.5 shadow-xs" />
              <div className="min-w-0">
                <span className="text-[10px] text-stone-500 font-semibold block">{lang === "bn" ? "দেশ" : "Country"}</span>
                <span className="font-bold text-stone-800 truncate block">
                  {lang === "bn" ? currentUserProfile.countryBn || "বাংলাদেশ" : currentUserProfile.countryEn || "Bangladesh"}
                </span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-stone-50 border border-stone-100">
              <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-stone-500 font-semibold block">{lang === "bn" ? "ঠিকানা" : "Address"}</span>
                <span className="font-bold text-stone-800 truncate block">
                  {currentUserProfile.locationBn || (lang === "bn" ? "জানা নেই" : "Unknown")}
                </span>
              </div>
            </div>

            {/* Profession */}
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-stone-50 border border-stone-100">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-stone-500 font-semibold block">{lang === "bn" ? "পেশা" : "Profession"}</span>
                <span className="font-bold text-stone-800 truncate block">
                  {lang === "bn" ? currentUserProfile.professionBn || "জানা নেই" : currentUserProfile.professionEn || "Unknown"}
                </span>
              </div>
            </div>

            {/* Blood Group */}
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-stone-50 border border-stone-100">
              <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                <Droplets className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-stone-500 font-semibold block">{lang === "bn" ? "রক্তের গ্রুপ" : "Blood Group"}</span>
                <span className="font-bold text-rose-700 truncate block">
                  {currentUserProfile.bloodGroup || "Unknown"}
                </span>
              </div>
            </div>

            {/* Birth Date */}
            {currentUserProfile.birthYear && currentUserProfile.birthYear !== "জানা নেই" && (
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-stone-50 border border-stone-100 sm:col-span-2">
                <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-stone-500 font-semibold block">{lang === "bn" ? "জন্ম তারিখ" : "Birth Date"}</span>
                  <span className="font-bold text-stone-800 truncate block">
                    {currentUserProfile.birthYear}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Bio Section */}
          {currentUserProfile.bio && (
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-600">
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                <span>{lang === "bn" ? "পরিচিতি" : "Bio"}</span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line pl-5">
                {currentUserProfile.bio}
              </p>
            </div>
          )}

          {/* Edit Profile Big Action Button */}
          <div className="pt-2">
            <button
              onClick={() => setIsEditing(true)}
              className="w-full py-2.5 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold text-xs sm:text-sm shadow-sm cursor-pointer transition flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>{lang === "bn" ? "প্রোফাইল তথ্য পরিবর্তন করুন" : "Edit Profile Info"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Portal Card */}
      <AdminLoginCard />
    </div>
  );
}
