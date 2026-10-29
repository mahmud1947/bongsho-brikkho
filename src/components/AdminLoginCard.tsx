"use client";

import React, { useState } from "react";
import { ShieldCheck, Lock, LogOut, Eye, EyeOff, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { useFamily } from "@/context/FamilyContext";

export default function AdminLoginCard() {
  const { lang, isAdmin, loginAdmin, logoutAdmin } = useFamily();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!password.trim()) {
      setError(lang === "bn" ? "দয়া করে পাসওয়ার্ড লিখুন" : "Please enter the password");
      return;
    }

    const success = loginAdmin(password.trim());
    if (success) {
      setPassword("");
      setSuccessMsg(
        lang === "bn"
          ? "সফলভাবে অ্যাডমিন লগইন হয়েছে! এখন আপনি ডিলিট করার অনুমতি পাবেন।"
          : "Logged in as Admin successfully! You now have delete permissions."
      );
    } else {
      setError(
        lang === "bn"
          ? "ভুল পাসওয়ার্ড! সঠিক অ্যাডমিন পাসওয়ার্ড দিন।"
          : "Incorrect password! Please enter the correct admin password."
      );
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setSuccessMsg("");
    setError("");
  };

  return (
    <div
      className={`rounded-3xl border transition shadow-sm overflow-hidden ${
        isAdmin
          ? "bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 border-amber-400/50 text-white"
          : "bg-white border-stone-200 text-stone-800"
      }`}
    >
      <div className="p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow ${
                isAdmin
                  ? "bg-amber-400 text-emerald-950 font-bold"
                  : "bg-emerald-950 text-amber-300"
              }`}
            >
              {isAdmin ? (
                <ShieldCheck className="w-6 h-6 text-emerald-950" />
              ) : (
                <KeyRound className="w-5 h-5 text-amber-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3
                  className={`font-bold text-sm sm:text-base ${
                    isAdmin ? "text-white" : "text-stone-900"
                  }`}
                >
                  {lang === "bn" ? "অ্যাডমিন পোর্টাল" : "Admin Portal"}
                </h3>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 font-extrabold text-[10px] tracking-wide shadow-sm">
                    ACTIVE ADMIN
                  </span>
                )}
              </div>
              <p
                className={`text-xs ${
                  isAdmin ? "text-emerald-200" : "text-stone-500"
                }`}
              >
                {isAdmin
                  ? (lang === "bn"
                      ? "আপনার কাছে সদস্য, নোটিশ ও ছবি ডিলিট করার পূর্ণ অনুমতি রয়েছে।"
                      : "You have full permission to delete members, notices, and media.")
                  : (lang === "bn"
                      ? "সদস্য তথ্য বা নোটিশ ডিলিট করার জন্য অ্যাডমিন লগইন করুন।"
                      : "Login as Admin to enable deletion permissions.")}
              </p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 text-xs font-semibold cursor-pointer border border-white/15 transition"
              title={lang === "bn" ? "অ্যাডমিন লগআউট" : "Admin Logout"}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === "bn" ? "লগআউট" : "Logout"}</span>
            </button>
          )}
        </div>

        {/* Content depending on login status */}
        {isAdmin ? (
          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 text-xs text-emerald-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base">👑</span>
              <span>
                {lang === "bn"
                  ? "অ্যাডমিন সেশন চালু আছে। কাজ শেষে লগআউট করতে পারেন।"
                  : "Admin session is active. You can logout when finished."}
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder={lang === "bn" ? "অ্যাডমিন পাসওয়ার্ড লিখুন..." : "Enter admin password..."}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold text-xs sm:text-sm shadow cursor-pointer transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{lang === "bn" ? "লগইন করুন" : "Login"}</span>
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
