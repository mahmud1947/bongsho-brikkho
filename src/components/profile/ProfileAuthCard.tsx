"use client";

import React, { useState } from "react";
import { Phone, UserPlus, AlertCircle, ArrowRight } from "lucide-react";
import { Language, UserProfile } from "@/types/family";
import AdminLoginCard from "@/components/AdminLoginCard";

interface ProfileAuthCardProps {
  lang: Language;
  loginByIdentifier: (
    identifier: string
  ) => Promise<{ success: boolean; error?: string; username?: string }>;
  checkAccountExists: (
    username: string,
    phone?: string
  ) => Promise<{ usernameExists: boolean; phoneExists: boolean }>;
  saveUserProfile: (profile: UserProfile) => Promise<void>;
  loginUsername: (username: string) => void;
  onSuccess?: () => void;
}

export default function ProfileAuthCard({
  lang,
  loginByIdentifier,
  checkAccountExists,
  saveUserProfile,
  loginUsername,
  onSuccess,
}: ProfileAuthCardProps) {
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  // Login Form State
  const [loginInput, setLoginInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Sign Up Form State
  const [signupNameEn, setSignupNameEn] = useState("");
  const [signupNameBn, setSignupNameBn] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupError, setSignupError] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const clean = loginInput.trim();
    if (!clean) {
      setLoginError(
        lang === "bn" ? "মোবাইল নম্বর অথবা ইউজারনেম লিখুন" : "Enter mobile number or username"
      );
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await loginByIdentifier(clean);
      if (!res.success) {
        setLoginError(
          lang === "bn"
            ? "এই মোবাইল নম্বর বা ইউজারনেমে কোনো অ্যাকাউন্ট পাওয়া যায়নি। দয়া করে সাইন আপ করুন।"
            : "No account found with this mobile number or username. Please sign up."
        );
      } else {
        onSuccess?.();
      }
    } catch {
      setLoginError(lang === "bn" ? "লগইন করতে সমস্যা হয়েছে" : "Login error occurred");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");

    const cleanNameEn = signupNameEn.trim();
    const cleanNameBn = signupNameBn.trim();
    const cleanPhone = signupPhone.trim();
    const cleanUsername = signupUsername.trim().toLowerCase().replace(/^@/, "");

    // 1. Name in English Required
    if (!cleanNameEn) {
      setSignupError(
        lang === "bn"
          ? "ইংরেজি নাম প্রদান করা আবশ্যক (Name in English is required)"
          : "Name (in English) is required"
      );
      return;
    }

    // 2. Mobile number Required & valid
    const digits = cleanPhone.replace(/\D/g, "");
    if (!digits || digits.length < 6) {
      setSignupError(
        lang === "bn"
          ? "সঠিক মোবাইল নম্বর প্রদান করুন (কমপক্ষে ৬ ডিজিট)"
          : "Valid mobile number is required (min 6 digits)"
      );
      return;
    }

    // 3. Username Required & valid
    if (!cleanUsername || cleanUsername.length < 3) {
      setSignupError(
        lang === "bn"
          ? "ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে"
          : "Username must be at least 3 characters"
      );
      return;
    }

    if (!/^[a-z0-9_.-]+$/.test(cleanUsername)) {
      setSignupError(
        lang === "bn"
          ? "ইউজারনেমে কেবল ইংরেজি ছোট অক্ষর, সংখ্যা, ডট বা আন্ডারস্কোর ব্যবহার করুন"
          : "Username can only contain lowercase letters, numbers, dot, or underscore"
      );
      return;
    }

    setIsSigningUp(true);
    try {
      const check = await checkAccountExists(cleanUsername, cleanPhone);
      if (check.usernameExists) {
        setSignupError(
          lang === "bn"
            ? `"${cleanUsername}" ইউজারনেমটি ইতিমধ্যে ব্যবহৃত। অন্য একটি ইউজারনেম বেছে নিন।`
            : `Username "${cleanUsername}" is already taken. Please choose another.`
        );
        setIsSigningUp(false);
        return;
      }

      if (check.phoneExists) {
        setSignupError(
          lang === "bn"
            ? "এই মোবাইল নম্বরটি ইতিমধ্যে নিবন্ধিত রয়েছে। দয়া করে লগইন করুন।"
            : "This mobile number is already registered. Please login."
        );
        setIsSigningUp(false);
        return;
      }

      const newProfile: UserProfile = {
        username: cleanUsername,
        nameEn: cleanNameEn,
        nameBn: cleanNameBn || cleanNameEn,
        phone: cleanPhone,
        whatsapp: cleanPhone,
        gender: "male",
        bloodGroup: "Unknown",
        countryBn: "বাংলাদেশ",
        countryEn: "Bangladesh",
        updatedAt: new Date().toISOString(),
      };

      await saveUserProfile(newProfile);
      loginUsername(cleanUsername);
      onSuccess?.();
    } catch {
      setSignupError(lang === "bn" ? "অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে" : "Failed to create account");
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4 px-2 sm:px-0">
      {/* Clear Status Notice: NOT LOGGED IN */}
      <div className="bg-rose-50 border-2 border-rose-200 p-3.5 rounded-3xl text-rose-950 flex items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0 animate-ping"></span>
          <span className="font-bold text-xs sm:text-sm">
            {lang === "bn" ? "আপনি বর্তমানে লগইন অবস্থায় নেই" : "You are currently NOT logged in"}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 font-extrabold text-[10px]">
          {lang === "bn" ? "অফলাইন" : "OFFLINE"}
        </span>
      </div>

      {/* Auth Box with Tabs */}
      <div className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-sm">
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-stone-100 border-b border-stone-200">
          <button
            type="button"
            onClick={() => {
              setAuthTab("login");
              setLoginError("");
            }}
            className={`py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              authTab === "login"
                ? "bg-white text-emerald-950 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-emerald-700" />
            <span>{lang === "bn" ? "লগইন" : "Login"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthTab("signup");
              setSignupError("");
            }}
            className={`py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              authTab === "signup"
                ? "bg-white text-emerald-950 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-600" />
            <span>{lang === "bn" ? "নতুন সাইন আপ" : "Sign Up"}</span>
          </button>
        </div>

        <div className="p-5 sm:p-7 space-y-4">
          {authTab === "login" ? (
            /* TAB 1: LOGIN WITH MOBILE OR USERNAME */
            <div className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 leading-tight">
                  {lang === "bn" ? "অ্যাকাউন্টে লগইন করুন" : "Account Login"}
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  {lang === "bn"
                    ? "আপনার মোবাইল নম্বর দিলে সরাসরি আপনার অ্যাকাউন্টে লগইন হয়ে যাবে।"
                    : "Enter your mobile number to log directly into your account."}
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {lang === "bn" ? "মোবাইল নম্বর অথবা ইউজারনেম" : "Mobile Number or Username"}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={loginInput}
                      onChange={(e) => setLoginInput(e.target.value)}
                      placeholder={
                        lang === "bn"
                          ? "যেমন: 017... অথবা mahmud2026"
                          : "e.g. 017... or mahmud2026"
                      }
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-stone-50/50 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold text-sm shadow cursor-pointer transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>
                    {isLoggingIn
                      ? lang === "bn"
                        ? "লগইন হচ্ছে..."
                        : "Logging in..."
                      : lang === "bn"
                      ? "লগইন করুন"
                      : "Log In"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-2 border-t border-stone-100 text-center">
                <p className="text-xs text-stone-500">
                  {lang === "bn" ? "অ্যাকাউন্ট নেই?" : "Don't have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => setAuthTab("signup")}
                    className="font-bold text-emerald-800 hover:underline cursor-pointer"
                  >
                    {lang === "bn" ? "নতুন অ্যাকাউন্ট তৈরি করুন" : "Create Account / Sign Up"}
                  </button>
                </p>
              </div>
            </div>
          ) : (
            /* TAB 2: NEW SIGN UP */
            <div className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 leading-tight">
                  {lang === "bn" ? "নতুন অ্যাকাউন্ট তৈরি (সাইন আপ)" : "Create New Account (Sign Up)"}
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  {lang === "bn"
                    ? "ইংরেজি নাম, মোবাইল নম্বর এবং ইউজারনেম দিয়ে নতুন প্রোফাইল তৈরি করুন।"
                    : "Provide your English name, mobile number, and username to register."}
                </p>
              </div>

              {signupError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{signupError}</span>
                </div>
              )}

              <form onSubmit={handleSignupSubmit} className="space-y-3">
                {/* Name (English) - REQUIRED */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {lang === "bn" ? "নাম (ইংরেজিতে) *" : "Name (in English) *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={signupNameEn}
                    onChange={(e) => setSignupNameEn(e.target.value)}
                    placeholder="e.g. Md Mahmudur Rahman"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-stone-50/50 focus:bg-white"
                  />
                </div>

                {/* Name (Bengali) - OPTIONAL */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1 flex items-center justify-between">
                    <span>{lang === "bn" ? "নাম (বাংলায়)" : "Name (in Bengali)"}</span>
                    <span className="text-[10px] text-stone-400 font-normal">
                      {lang === "bn" ? "(ঐচ্ছিক)" : "(Optional)"}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={signupNameBn}
                    onChange={(e) => setSignupNameBn(e.target.value)}
                    placeholder={lang === "bn" ? "যেমন: মোঃ মাহমুদুল রহমান" : "e.g. Mahmudur Rahman in Bengali"}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-stone-50/50 focus:bg-white"
                  />
                </div>

                {/* Mobile Number - REQUIRED */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {lang === "bn" ? "মোবাইল নম্বর *" : "Mobile Number *"}
                  </label>
                  <input
                    type="tel"
                    required
                    inputMode="numeric"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder={lang === "bn" ? "যেমন: 01712345678" : "e.g. 01712345678"}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-stone-50/50 focus:bg-white"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    {lang === "bn"
                      ? "এই নম্বর দিয়ে পরবর্তীতে সরাসরি লগইন করতে পারবেন।"
                      : "You can log in directly using this number in the future."}
                  </p>
                </div>

                {/* Username - REQUIRED */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {lang === "bn" ? "ইউজারনেম (Username) *" : "Username *"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">@</span>
                    <input
                      type="text"
                      required
                      value={signupUsername}
                      onChange={(e) =>
                        setSignupUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ""))
                      }
                      placeholder="e.g. mahmud2026"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-stone-50/50 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSigningUp}
                  className="w-full py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold text-sm shadow cursor-pointer transition flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>
                    {isSigningUp
                      ? lang === "bn"
                        ? "অ্যাকাউন্ট তৈরি হচ্ছে..."
                        : "Creating Account..."
                      : lang === "bn"
                      ? "অ্যাকাউন্ট তৈরি সম্পন্ন করুন"
                      : "Complete Sign Up"}
                  </span>
                </button>
              </form>

              <div className="pt-2 border-t border-stone-100 text-center">
                <p className="text-xs text-stone-500">
                  {lang === "bn" ? "ইতিমধ্যে অ্যাকাউন্ট আছে?" : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => setAuthTab("login")}
                    className="font-bold text-emerald-800 hover:underline cursor-pointer"
                  >
                    {lang === "bn" ? "লগইন করুন" : "Log In"}
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <AdminLoginCard />
    </div>
  );
}

