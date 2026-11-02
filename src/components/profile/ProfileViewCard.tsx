"use client";

import React from "react";
import {
  UserCheck,
  Edit3,
  LogOut,
  Droplets,
  Phone,
  MessageSquare,
  Share2,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
  CheckCircle2,
  X,
} from "lucide-react";
import { Language, UserProfile, formatSocialUrl } from "@/types/family";
import CountryFlag from "@/components/CountryFlag";
import AdminLoginCard from "@/components/AdminLoginCard";
import { formatWhatsappUrl } from "./profileConstants";

interface ProfileViewCardProps {
  lang: Language;
  currentUserProfile: UserProfile;
  saveSuccess: boolean;
  onDismissSaveSuccess: () => void;
  onStartEditing: () => void;
  onLogout: () => void;
}

export default function ProfileViewCard({
  lang,
  currentUserProfile,
  saveSuccess,
  onDismissSaveSuccess,
  onStartEditing,
  onLogout,
}: ProfileViewCardProps) {
  const displayName =
    lang === "bn"
      ? currentUserProfile.nameBn || currentUserProfile.nameEn
      : currentUserProfile.nameEn || currentUserProfile.nameBn;

  return (
    <div className="max-w-xl mx-auto space-y-3.5 px-1 sm:px-0">
      {saveSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{lang === "bn" ? "প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে!" : "Profile saved successfully!"}</span>
          </div>
          <button onClick={onDismissSaveSuccess} className="text-emerald-700 p-1 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* CRYSTAL CLEAR STATUS BANNER: LOGGED IN & ACCOUNT ACTIVE */}
      <div className="bg-emerald-600/10 border-2 border-emerald-600/30 p-3 sm:p-3.5 rounded-3xl text-emerald-950 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-emerald-800 text-amber-300 flex items-center justify-center flex-shrink-0 shadow-sm">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-xs sm:text-sm text-emerald-950 truncate">
                {lang === "bn" ? `লগইন আছেন: @${currentUserProfile.username}` : `Logged In: @${currentUserProfile.username}`}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white font-extrabold text-[9px] tracking-wide">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 truncate">
              {lang === "bn" ? "আপনার ব্যক্তিগত অ্যাকাউন্ট তৈরি সম্পন্ন ও সক্রিয়" : "Your personal profile is active & verified"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={onStartEditing}
            className="px-3 py-1.5 rounded-xl bg-emerald-900 text-amber-300 font-bold text-xs flex items-center gap-1 shadow-sm hover:bg-emerald-800 transition cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>{lang === "bn" ? "এডিট" : "Edit"}</span>
          </button>
          <button
            onClick={onLogout}
            className="px-2.5 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
            title={lang === "bn" ? "লগআউট" : "Logout"}
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:inline">{lang === "bn" ? "লগআউট" : "Logout"}</span>
          </button>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        {/* Banner + Avatar */}
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-5 sm:p-6 text-white relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              {currentUserProfile.photoUrl ? (
                <img
                  src={currentUserProfile.photoUrl}
                  alt={displayName}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover flex-shrink-0 shadow-lg ring-2 ring-amber-400/60"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-300 text-emerald-950 font-black text-2xl sm:text-3xl flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-white/20">
                  {displayName.charAt(0) || "U"}
                </div>
              )}
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
                onClick={onStartEditing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-amber-300 text-xs font-bold cursor-pointer transition border border-white/10"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "এডিট" : "Edit"}</span>
              </button>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-rose-300 cursor-pointer transition border border-white/10"
                title={lang === "bn" ? "লগআউট" : "Logout"}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
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
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={onStartEditing}
              className="flex-1 py-2.5 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold text-xs sm:text-sm shadow-sm cursor-pointer transition flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>{lang === "bn" ? "প্রোফাইল তথ্য পরিবর্তন করুন" : "Edit Profile Info"}</span>
            </button>
            <button
              onClick={onLogout}
              className="py-2.5 px-5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm border border-rose-200 cursor-pointer transition flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>{lang === "bn" ? "লগআউট" : "Logout"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Portal Card */}
      <AdminLoginCard />
    </div>
  );
}
