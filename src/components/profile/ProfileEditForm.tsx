"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  MapPin,
  Briefcase,
  Phone,
  Droplets,
  Calendar,
  Edit3,
  LogOut,
  Save,
  MessageSquare,
  Share2,
  X,
  Camera,
  Trash2,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import { BloodGroup, Language, UserProfile } from "@/types/family";
import CountryFlag from "@/components/CountryFlag";
import AdminLoginCard from "@/components/AdminLoginCard";
import { compressImageFile } from "@/lib/imageUtils";
import {
  BLOOD_GROUPS,
  COUNTRY_OPTIONS,
  PROFESSION_OPTIONS,
  YEARS,
  MONTHS,
} from "./profileConstants";

interface ProfileEditFormProps {
  lang: Language;
  currentUsername: string;
  currentUserProfile: UserProfile | null;
  onSave: (profileData: UserProfile) => Promise<void>;
  onCancel: () => void;
  onLogout: () => void;
}

export default function ProfileEditForm({
  lang,
  currentUsername,
  currentUserProfile,
  onSave,
  onCancel,
  onLogout,
}: ProfileEditFormProps) {
  const isNewAccount = !currentUserProfile;

  // Form State
  const [nameBn, setNameBn] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
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
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when editing existing profile
  useEffect(() => {
    if (currentUserProfile) {
      setNameBn(currentUserProfile.nameBn || "");
      setNameEn(currentUserProfile.nameEn || "");
      setGender(currentUserProfile.gender || "male");
      setPhotoUrl(currentUserProfile.photoUrl || "");
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
    } else {
      // Reset form for fresh creation
      setNameBn("");
      setNameEn("");
      setGender("male");
      setPhotoUrl("");
      setBloodGroup("O+");
      setLocationBn("");
      setPhone("");
      setWhatsapp("");
      setWhatsappSameAsPhone(true);
      setSocialLink("");
      setBio("");
      setBirthYearPart("unknown");
      setBirthMonthPart("");
      setBirthDayPart("");
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
      setFormError(
        lang === "bn" ? "দয়া করে অন্তত একটি নাম (বাংলা বা ইংরেজি) লিখুন" : "Please enter at least one name"
      );
      return;
    }

    if (phone.trim()) {
      const digitCount = phone.replace(/\D/g, "").length;
      if (digitCount < 6 || digitCount > 15) {
        setPhoneError(
          lang === "bn" ? "সঠিক ফোন নম্বর দিন (৬ থেকে ১৫ ডিজিট)" : "Please enter a valid phone (6-15 digits)"
        );
        setFormError(lang === "bn" ? "ফোন নম্বরটি সঠিক নয়" : "Invalid phone number");
        return;
      }
    }

    const finalNameBn = nameBn.trim() || nameEn.trim() || currentUsername;
    const finalNameEn = nameEn.trim() || nameBn.trim() || currentUsername;

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
      photoUrl: photoUrl.trim() || undefined,
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

    setIsSaving(true);
    try {
      await onSave(profileData);
    } catch {
      setFormError(lang === "bn" ? "সংরক্ষণ করতে সমস্যা হয়েছে" : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-3.5 px-1 sm:px-0">
      {/* CLEAR STATUS BANNER: Distinct for New Setup vs Editing */}
      {isNewAccount ? (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 p-3.5 rounded-3xl text-stone-900 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0"></span>
              <span className="font-extrabold text-xs sm:text-sm text-amber-950">
                {lang === "bn"
                  ? `অ্যাকাউন্ট এখনো তৈরি হয়নি: @${currentUsername}`
                  : `Account Not Created Yet: @${currentUsername}`}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 font-black text-[10px]">
              {lang === "bn" ? "নতুন অ্যাকাউন্ট" : "NEW SETUP"}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-stone-700 leading-relaxed">
            {lang === "bn"
              ? `আপনি "@${currentUsername}" দিয়েছেন। এই নামে এখনো প্রোফাইল তৈরি হয়নি। নিচের তথ্যগুলো দিয়ে প্রোফাইল তৈরি সম্পন্ন করুন।`
              : `You entered "@${currentUsername}". No profile exists for this username yet. Please fill in your details below to complete your account.`}
          </p>
          <div className="pt-0.5 flex items-center justify-between">
            <button
              type="button"
              onClick={onLogout}
              className="text-[11px] font-bold text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>{lang === "bn" ? "ভুল নাম? অন্য ইউজারনেম দিন" : "Switch / Change Username"}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-blue-600/10 border-2 border-blue-600/30 p-3 rounded-3xl text-blue-950 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Edit3 className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-xs sm:text-sm text-blue-950 block truncate">
                {lang === "bn" ? `প্রোফাইল তথ্য পরিবর্তন (@${currentUsername})` : `Editing Profile (@${currentUsername})`}
              </span>
              <span className="text-[10px] text-blue-700 block">
                {lang === "bn" ? "পরিবর্তনগুলো শেষ করে নিচে সংরক্ষণ করুন" : "Update your info and save changes below"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="px-2.5 py-1 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition cursor-pointer flex-shrink-0"
          >
            {lang === "bn" ? "বাতিল" : "Cancel"}
          </button>
        </div>
      )}

      {/* Profile Form Card */}
      <div className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 px-4 py-3 sm:px-5 sm:py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center flex-shrink-0">
              {isNewAccount ? <UserPlus className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300/90 block">
                {isNewAccount
                  ? lang === "bn"
                    ? "নতুন অ্যাকাউন্ট সেটআপ"
                    : "New Account Registration"
                  : lang === "bn"
                  ? "তথ্য সম্পাদনা"
                  : "Edit Details"}
              </span>
              <span className="font-bold text-sm sm:text-base text-white truncate block">
                @{currentUsername}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {!isNewAccount && (
              <button
                type="button"
                onClick={onCancel}
                className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer transition flex items-center gap-1"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "বাতিল" : "Cancel"}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-rose-300 cursor-pointer transition"
              title={lang === "bn" ? "লগআউট" : "Logout"}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
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
              <span>{lang === "bn" ? "১. পরিচয় ও ছবি" : "1. Identity & Photo"}</span>
            </div>

            {/* প্রোফাইল ছবি (Upload) */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-stone-200/80">
              <div className="relative w-14 h-14 rounded-2xl bg-emerald-950 text-amber-300 font-bold text-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-stone-200">
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{(nameBn || nameEn || currentUsername || "U").charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <span className="block text-[11px] font-bold text-stone-700">
                  {lang === "bn" ? "প্রোফাইল ছবি (ঐচ্ছিক)" : "Profile Photo (Optional)"}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 text-xs font-bold cursor-pointer transition">
                    <Camera className="w-3.5 h-3.5" />
                    <span>
                      {isUploadingPhoto
                        ? lang === "bn"
                          ? "প্রসেস হচ্ছে..."
                          : "Processing..."
                        : lang === "bn"
                        ? "ছবি সিলেক্ট করুন"
                        : "Choose Photo"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploadingPhoto(true);
                        try {
                          const dataUrl = await compressImageFile(file, 360, 0.78);
                          setPhotoUrl(dataUrl);
                        } catch {
                          setFormError(lang === "bn" ? "ছবি প্রসেস করা যায়নি" : "Failed to process photo");
                        } finally {
                          setIsUploadingPhoto(false);
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl("")}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{lang === "bn" ? "মুছুন" : "Remove"}</span>
                    </button>
                  )}
                </div>
              </div>
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
              disabled={isSaving}
              className="w-full py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold text-sm shadow-md cursor-pointer transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>
                {isSaving
                  ? lang === "bn"
                    ? "সংরক্ষণ হচ্ছে..."
                    : "Saving..."
                  : isNewAccount
                  ? lang === "bn"
                    ? "অ্যাকাউন্ট ও প্রোফাইল তৈরি সম্পন্ন করুন"
                    : "Complete Account Setup"
                  : lang === "bn"
                  ? "পরিবর্তন সংরক্ষণ করুন"
                  : "Save Changes"}
              </span>
            </button>

            {!isNewAccount && (
              <button
                type="button"
                onClick={onCancel}
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
