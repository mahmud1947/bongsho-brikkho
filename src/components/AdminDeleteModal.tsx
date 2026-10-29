"use client";

import React, { useState } from "react";
import { Lock, Trash2, X, AlertCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Language } from "@/types/family";

interface AdminDeleteModalProps {
  isOpen: boolean;
  title?: string;
  itemName?: string;
  isAdmin: boolean;
  lang: Language;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  onLoginAdmin: (password: string) => boolean;
}

export default function AdminDeleteModal({
  isOpen,
  title,
  itemName,
  isAdmin,
  lang,
  onClose,
  onConfirm,
  onLoginAdmin,
}: AdminDeleteModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isAdmin) {
      if (!password.trim()) {
        setError(lang === "bn" ? "দয়া করে পাসওয়ার্ড লিখুন" : "Please enter the password");
        return;
      }
      const success = onLoginAdmin(password.trim());
      if (!success) {
        setError(
          lang === "bn"
            ? "ভুল পাসওয়ার্ড! শুধুমাত্র অনুমোদিত অ্যাডমিন ডিলিট করতে পারবেন।"
            : "Incorrect password! Only authorized admins can delete."
        );
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await onConfirm();
      setPassword("");
      setError("");
      onClose();
    } catch (err: any) {
      setError(err?.message || (lang === "bn" ? "ডিলিট করতে সমস্যা হয়েছে" : "Failed to delete"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 flex items-center justify-between text-white ${
            isAdmin ? "bg-rose-900" : "bg-emerald-950"
          }`}
        >
          <div className="flex items-center gap-2.5 font-bold text-sm sm:text-base">
            {isAdmin ? (
              <Trash2 className="w-5 h-5 text-rose-300" />
            ) : (
              <Lock className="w-5 h-5 text-amber-400" />
            )}
            <span>
              {title || (isAdmin
                ? (lang === "bn" ? "মুছে ফেলার নিশ্চিতকরণ" : "Confirm Deletion")
                : (lang === "bn" ? "অ্যাডমিন অনুমতি প্রয়োজন" : "Admin Permission Required"))}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
          {isAdmin ? (
            /* Logged in as Admin: Simple confirmation */
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-900">
                <Trash2 className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-stone-900 text-sm">
                    {itemName ? `"${itemName}"` : (lang === "bn" ? "এই তথ্যটি" : "This item")}
                  </p>
                  <p className="text-stone-600 text-xs leading-relaxed">
                    {lang === "bn"
                      ? "আপনি কি নিশ্চিতভাবে এটি মুছে ফেলতে চান? একবার মুছে ফেললে এটি আর ফিরিয়ে আনা সম্ভব হবে না।"
                      : "Are you sure you want to delete this? Once deleted, it cannot be recovered."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>{lang === "bn" ? "আপনি অ্যাডমিন হিসেবে লগইন আছেন" : "You are verified as Admin"}</span>
              </div>
            </div>
          ) : (
            /* Not logged in as Admin: Password Required */
            <div className="space-y-3.5">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-stone-800">
                <Lock className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-stone-900 text-sm">
                    {lang === "bn" ? "ডিলিট করার পাসওয়ার্ড দিন" : "Enter Admin Password"}
                  </p>
                  <p className="text-stone-600 text-xs leading-relaxed">
                    {lang === "bn"
                      ? "যে কেউ তথ্য যোগ বা এডিট করতে পারবেন, তবে মুছে ফেলার জন্য অনুমোদিত অ্যাডমিন পাসওয়ার্ড প্রয়োজন।"
                      : "Anyone can add or edit, but deleting requires the admin password."}
                  </p>
                </div>
              </div>

              {itemName && (
                <p className="text-xs text-stone-600 px-1">
                  <span className="font-semibold text-stone-700">{lang === "bn" ? "লক্ষ্য:" : "Target:"}</span>{" "}
                  <span className="font-bold text-stone-900 font-mono">{itemName}</span>
                </p>
              )}

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  {lang === "bn" ? "অ্যাডমিন পাসওয়ার্ড *" : "Admin Password *"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoFocus
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder={lang === "bn" ? "পাসওয়ার্ড লিখুন..." : "Enter password..."}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer transition disabled:opacity-50"
            >
              {lang === "bn" ? "বাতিল" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white font-bold text-xs shadow transition cursor-pointer disabled:opacity-50 ${
                isAdmin
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-emerald-900 hover:bg-emerald-800 text-amber-300"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>
                {isSubmitting
                  ? (lang === "bn" ? "মুছে ফেলা হচ্ছে..." : "Deleting...")
                  : isAdmin
                  ? (lang === "bn" ? "নিশ্চিত মুছুন" : "Confirm Delete")
                  : (lang === "bn" ? "যাচাই ও ডিলিট" : "Verify & Delete")}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

