"use client";

import React, { useState, useEffect } from "react";
import { X, Save, UserPlus } from "lucide-react";
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
  const [nicknameBn, setNicknameBn] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [parentId, setParentId] = useState<string>("");
  const [branchId, setBranchId] = useState<string>("root");
  const [generation, setGeneration] = useState<number>(1);
  const [spouseNameBn, setSpouseNameBn] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [isAlive, setIsAlive] = useState(true);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O+");
  const [professionBn, setProfessionBn] = useState("");
  const [locationBn, setLocationBn] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (editingMember) {
      setNameBn(editingMember.nameBn);
      setNameEn(editingMember.nameEn);
      setNicknameBn(editingMember.nicknameBn || "");
      setGender(editingMember.gender);
      setParentId(editingMember.parentId || "");
      setBranchId(editingMember.branchId);
      setGeneration(editingMember.generation);
      setSpouseNameBn(editingMember.spouseNameBn || "");
      setBirthYear(editingMember.birthYear || "");
      setIsAlive(editingMember.isAlive);
      setBloodGroup(editingMember.bloodGroup);
      setProfessionBn(editingMember.professionBn);
      setLocationBn(editingMember.locationBn);
      setPhone(editingMember.phone || "");
    } else if (defaultParent) {
      setNameBn("");
      setNameEn("");
      setNicknameBn("");
      setGender("male");
      setParentId(defaultParent.id);
      setBranchId(defaultParent.branchId === "root" ? "boro-taraf" : defaultParent.branchId);
      setGeneration(defaultParent.generation + 1);
      setSpouseNameBn("");
      setBirthYear("");
      setIsAlive(true);
      setBloodGroup("O+");
      setProfessionBn("");
      setLocationBn(defaultParent.locationBn || "");
      setPhone("");
    } else {
      const first = existingMembers[0];
      setNameBn("");
      setNameEn("");
      setNicknameBn("");
      setGender("male");
      setParentId(first?.id || "");
      setBranchId(first ? "boro-taraf" : "root");
      setGeneration(first ? first.generation + 1 : 1);
      setSpouseNameBn("");
      setBirthYear("");
      setIsAlive(true);
      setBloodGroup("O+");
      setProfessionBn("");
      setLocationBn("");
      setPhone("");
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
      if (p.branchId !== "root") setBranchId(p.branchId);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalNameBn = nameBn.trim() || nameEn.trim() || "সদস্য";
    const finalNameEn = nameEn.trim() || nameBn.trim() || "Member";

    onSave({
      id: editingMember ? editingMember.id : `mem-${Date.now()}`,
      nameBn: finalNameBn,
      nameEn: finalNameEn,
      nicknameBn: nicknameBn.trim() || undefined,
      nicknameEn: nicknameBn.trim() || undefined,
      gender,
      generation,
      branchId,
      parentId: parentId || null,
      spouseNameBn: spouseNameBn.trim() || undefined,
      spouseNameEn: spouseNameBn.trim() || undefined,
      birthYear: birthYear.trim() || undefined,
      isAlive,
      bloodGroup,
      professionBn: professionBn.trim() || "-",
      professionEn: professionBn.trim() || "-",
      locationBn: locationBn.trim() || "-",
      locationEn: locationBn.trim() || "-",
      phone: phone.trim() || undefined,
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
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="bg-emerald-950 px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>
              {editingMember
                ? lang === "bn"
                  ? "সম্পাদনা"
                  : "Edit"
                : lang === "bn"
                ? "নতুন সদস্য"
                : "New Member"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3 overflow-y-auto text-xs sm:text-sm">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "পিতা" : "Parent"}
              </label>
              <select
                value={parentId}
                onChange={(e) => handleParentChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
              >
                <option value="">{lang === "bn" ? "মূল শিকড় (১ম প্রজন্ম)" : "Root (Gen 1)"}</option>
                {existingMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {lang === "bn" ? m.nameBn : m.nameEn} (G{m.generation})
                  </option>
                ))}
              </select>
            </div>

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
              <input
                type="text"
                value={nicknameBn}
                onChange={(e) => setNicknameBn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200"
              />
            </div>

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

            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "পেশা" : "Profession"}
              </label>
              <input
                type="text"
                value={professionBn}
                onChange={(e) => setProfessionBn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200"
              />
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
              <input
                type="text"
                value={spouseNameBn}
                onChange={(e) => setSpouseNameBn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200"
              />
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

            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === "bn" ? "জন্ম" : "Birth"}
              </label>
              <input
                type="text"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200"
              />
            </div>

            <div>
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
              className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-bold text-xs cursor-pointer"
            >
              {lang === "bn" ? "বাতিল" : "Cancel"}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-900 text-amber-300 font-bold text-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {lang === "bn" ? "সংরক্ষণ" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
