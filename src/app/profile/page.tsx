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
      phone: phone.trim() || undefined,
      whatsapp: (whatsappSameAsPhone ? phone.trim() : whatsapp.trim()) || undefined,
      socialLink: socialLink.trim() || undefined,
      locationBn: locationBn.trim() || "জানা নেই",
      locationEn: locationBn.trim() || "Unknown",
      countryBn: finalCountryBn,
      countryEn: finalCountryEn,
      professionBn: finalProfBn,
      professionEn: finalProfEn,
      bloodGroup,
      birthYear: finalBirth,
      bio: bio.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    await saveUserProfile(profileData);
    setIsEditing(false);
  };

  // STEP 1: Not Logged In
  if (!currentUsername) {
    return (
      <div className="max-w-md mx-auto space-y-4 mt-4">
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-950 text-amber-400 flex items-center justify-center">
              <AtSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900">
                {lang === "bn" ? "ব্যক্তিগত প্রোফাইল" : "Personal Profile"}
              </h2>
              <p className="text-xs text-stone-500">
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

        <AdminLoginCard />
      </div>
    );
  }

  // STEP 2: Creating or Editing Personal Profile Form
  if (!currentUserProfile || isEditing) {
    return (
      <div className="max-w-xl mx-auto space-y-4 mt-2">
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="bg-emerald-950 px-5 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
              <User className="w-4 h-4 text-amber-400" />
              <span>@{currentUsername}</span>
            </div>
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="p-4 bg-amber-50/60 border-b border-amber-100 text-xs text-amber-950 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>
              {lang === "bn"
                ? "এটি আপনার ব্যক্তিগত প্রোফাইল। এটি বংশবৃক্ষের মেম্বারদের সাথে সরাসরি যুক্ত নয়।"
                : "This is your personal profile. It is not connected to the family tree."}
            </span>
          </div>

          {formError && (
            <div className="mx-4 mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="p-4 sm:p-5 space-y-3.5 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
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
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* লিঙ্গ */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  {lang === "bn" ? "লিঙ্গ" : "Gender"}
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as "male" | "female")}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                >
                  <option value="male">{lang === "bn" ? "পুরুষ (Male)" : "Male"}</option>
                  <option value="female">{lang === "bn" ? "নারী (Female)" : "Female"}</option>
                </select>
              </div>

              {/* রক্তের গ্রুপ */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  {lang === "bn" ? "রক্তের গ্রুপ" : "Blood Group"}
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white font-semibold text-rose-700"
                >
                  {BLOOD_GROUPS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* পেশা */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  {lang === "bn" ? "পেশা" : "Profession"}
                </label>
                <select
                  value={professionSelect}
                  onChange={(e) => setProfessionSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
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
                    className="w-full mt-2 px-3 py-1.5 rounded-xl border border-stone-200"
                  />
                )}
              </div>

              {/* দেশ */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  {lang === "bn" ? "দেশ" : "Country"}
                </label>
                <select
                  value={countrySelect}
                  onChange={(e) => setCountrySelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.bn} value={c.bn}>
                      {lang === "bn" ? c.bn : c.en}
                    </option>
                  ))}
                </select>
                {countrySelect === "custom" && (
                  <input
                    type="text"
                    value={countryCustom}
                    onChange={(e) => setCountryCustom(e.target.value)}
                    placeholder={lang === "bn" ? "দেশের নাম লিখুন..." : "Enter country..."}
                    className="w-full mt-2 px-3 py-1.5 rounded-xl border border-stone-200"
                  />
                )}
              </div>

              {/* ঠিকানা */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  {lang === "bn" ? "বর্তমান ঠিকানা" : "Current Address"}
                </label>
                <input
                  type="text"
                  value={locationBn}
                  onChange={(e) => setLocationBn(e.target.value)}
                  placeholder={lang === "bn" ? "যেমন: উপশহর, সিলেট..." : "e.g. Sylhet..."}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* ফোন */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  {lang === "bn" ? "ফোন নম্বর" : "Phone Number"}
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+88017..."
                  className={`w-full px-3 py-2 rounded-xl border ${
                    phoneError ? "border-rose-400 bg-rose-50/40" : "border-stone-200"
                  } focus:outline-none focus:ring-1 focus:ring-emerald-600`}
                />
                {phoneError && <p className="text-[10px] text-rose-600 font-medium mt-1">{phoneError}</p>}
              </div>

              {/* WhatsApp */}
              <div className="sm:col-span-2 space-y-1.5 p-2.5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
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
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs"
                  />
                )}
              </div>

              {/* Social Media Link */}
              <div className="sm:col-span-2">
                <label className="flex items-center gap-1 text-[11px] font-bold text-stone-600 mb-1">
                  <Share2 className="w-3 h-3 text-blue-600" />
                  <span>{lang === "bn" ? "সোশ্যাল লিংক / ইনস্টাগ্রাম আইডি" : "Social Link / Instagram ID"}</span>
                </label>
                <input
                  type="text"
                  value={socialLink}
                  onChange={(e) => setSocialLink(e.target.value)}
                  placeholder="fb.com/username, instagram id, etc."
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                />
              </div>

              {/* জন্ম */}
              <div className="sm:col-span-2">
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
                    className="px-2.5 py-2 rounded-xl border border-stone-200 bg-white font-semibold"
                  >
                    <option value="unknown">{lang === "bn" ? "জানা নেই" : "Unknown"}</option>
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
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  {lang === "bn" ? "ব্যক্তিগত পরিচয় / বায়ো" : "Personal Bio"}
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={lang === "bn" ? "নিজের সম্পর্কে সংক্ষেপে কিছু লিখুন..." : "A brief note about yourself..."}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold text-sm shadow cursor-pointer mt-2"
            >
              <Save className="w-4 h-4" />
              <span>{lang === "bn" ? "প্রোফাইল সেভ করুন" : "Save Profile"}</span>
            </button>
          </form>
        </div>

        <AdminLoginCard />
      </div>
    );
  }

  // STEP 3: Viewing Personal Profile (Completely disconnected from tree)
  const formatWhatsappUrl = (phoneOrWa?: string) => {
    if (!phoneOrWa) return "";
    let digits = phoneOrWa.replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("01") && digits.length === 11) {
      digits = "88" + digits;
    }
    return `https://wa.me/${digits}`;
  };

  const displayName =
    lang === "bn"
      ? currentUserProfile.nameBn || currentUserProfile.nameEn
      : currentUserProfile.nameEn || currentUserProfile.nameBn;

  return (
    <div className="max-w-xl mx-auto space-y-4 mt-2">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-950 p-5 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-emerald-950 font-black text-2xl flex items-center justify-center flex-shrink-0 shadow-md">
              {displayName.charAt(0) || "U"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-400/20 text-amber-300">
                  @{currentUserProfile.username}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/15 text-stone-200">
                  {currentUserProfile.gender === "female" ? (lang === "bn" ? "নারী" : "Female") : (lang === "bn" ? "পুরুষ" : "Male")}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold truncate">{displayName}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{lang === "bn" ? "এডিট" : "Edit"}</span>
            </button>
            <button
              onClick={logoutUsername}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-rose-300 cursor-pointer transition"
              title={lang === "bn" ? "লগআউট" : "Logout"}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notice: Personal profile statement */}
        <div className="p-3 bg-stone-50 border-b border-stone-100 text-[11px] text-stone-600 flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
          <span>
            {lang === "bn"
              ? "এটি আপনার ব্যক্তিগত প্রোফাইল (বংশবৃক্ষের সাথে সংযুক্ত নয়)।"
              : "This is your personal profile (not connected to the family tree)."}
          </span>
        </div>

        {/* Details Grid */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {/* Country */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <CountryFlag country={currentUserProfile.countryBn || currentUserProfile.countryEn} className="w-5 h-3.5" />
              <span className="font-semibold text-stone-800 truncate">
                {lang === "bn" ? currentUserProfile.countryBn || "বাংলাদেশ" : currentUserProfile.countryEn || "Bangladesh"}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="font-semibold text-stone-800 truncate">
                {currentUserProfile.locationBn || "জানা নেই"}
              </span>
            </div>

            {/* Profession */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <Briefcase className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span className="font-semibold text-stone-800 truncate">
                {lang === "bn" ? currentUserProfile.professionBn || "জানা নেই" : currentUserProfile.professionEn || "Unknown"}
              </span>
            </div>

            {/* Blood Group */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <Droplets className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span className="font-bold text-rose-700">
                {currentUserProfile.bloodGroup || "Unknown"}
              </span>
            </div>

            {/* Birth Date */}
            {currentUserProfile.birthYear && currentUserProfile.birthYear !== "জানা নেই" && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                <Calendar className="w-4 h-4 text-sky-700 flex-shrink-0" />
                <span className="font-semibold text-stone-800">
                  {currentUserProfile.birthYear}
                </span>
              </div>
            )}

            {/* Phone */}
            {currentUserProfile.phone && (
              <a
                href={`tel:${currentUserProfile.phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-100 font-semibold text-emerald-800 hover:bg-emerald-50 transition truncate"
              >
                <Phone className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span className="truncate">{currentUserProfile.phone}</span>
              </a>
            )}
          </div>

          {/* Social Links & WhatsApp */}
          {(currentUserProfile.whatsapp || currentUserProfile.socialLink) && (
            <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-stone-100">
              {currentUserProfile.whatsapp && (
                <a
                  href={formatWhatsappUrl(currentUserProfile.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                  <span>WhatsApp</span>
                </a>
              )}

              {currentUserProfile.socialLink && (
                <a
                  href={formatSocialUrl(currentUserProfile.socialLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition"
                >
                  <Share2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Social Profile</span>
                </a>
              )}
            </div>
          )}

          {/* Bio */}
          {currentUserProfile.bio && (
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 space-y-1">
              <p className="text-[11px] font-bold text-stone-500">
                {lang === "bn" ? "পরিচয়" : "About"}
              </p>
              <p className="text-xs text-stone-700 whitespace-pre-wrap">{currentUserProfile.bio}</p>
            </div>
          )}
        </div>
      </div>

      <AdminLoginCard />
    </div>
  );
}
