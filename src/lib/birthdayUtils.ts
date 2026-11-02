import { FamilyMember, Language } from "@/types/family";
import { showBrowserNotification } from "@/lib/notificationUtils";

export interface UpcomingBirthdayItem {
  member: FamilyMember;
  daysRemaining: number;
  birthDateFormatted: string;
  calculatedAge?: number;
}

export interface BirthdayCalculationResult {
  todayBirthdays: Array<{ member: FamilyMember; age?: number }>;
  upcomingBirthdays: UpcomingBirthdayItem[];
}

export function calculateBirthdays(members: FamilyMember[]): BirthdayCalculationResult {
  const todayList: Array<{ member: FamilyMember; age?: number }> = [];
  const upcomingList: UpcomingBirthdayItem[] = [];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  const currentDay = now.getDate();

  for (const m of members) {
    if (m.isAlive === false) continue;
    if (!m.birthYear || m.birthYear === "জানা নেই" || m.birthYear === "unknown") continue;

    const parts = m.birthYear
      .split("-")
      .map((p) => parseInt(p.trim(), 10))
      .filter((n) => !isNaN(n));
    let y: number | undefined;
    let month: number | undefined;
    let day: number | undefined;

    if (parts.length >= 3) {
      if (parts[0] > 1900) {
        y = parts[0];
        month = parts[1];
        day = parts[2];
      } else {
        y = parts[2];
        month = parts[1];
        day = parts[0];
      }
    } else {
      continue;
    }

    if (!month || !day || month < 1 || month > 12 || day < 1 || day > 31) continue;

    const calculatedAge = y ? currentYear - y : undefined;

    // Check if today
    if (month - 1 === currentMonth && day === currentDay) {
      todayList.push({
        member: m,
        age: calculatedAge,
      });
      upcomingList.push({
        member: m,
        daysRemaining: 0,
        birthDateFormatted: `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}`,
        calculatedAge,
      });
    } else {
      let nextBday = new Date(currentYear, month - 1, day);
      if (nextBday < now) {
        nextBday = new Date(currentYear + 1, month - 1, day);
      }
      const diffTime = nextBday.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 1 && diffDays <= 30) {
        const nextAge = y ? nextBday.getFullYear() - y : undefined;
        upcomingList.push({
          member: m,
          daysRemaining: diffDays,
          birthDateFormatted: `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}`,
          calculatedAge: nextAge,
        });
      }
    }
  }

  upcomingList.sort((a, b) => a.daysRemaining - b.daysRemaining);

  return { todayBirthdays: todayList, upcomingBirthdays: upcomingList };
}

export function checkAndTriggerBirthdayNotifications(
  todayBirthdays: Array<{ member: FamilyMember; age?: number }>,
  upcomingBirthdays: UpcomingBirthdayItem[],
  lang: Language
) {
  if (typeof window === "undefined") return;
  const todayStr = new Date().toISOString().slice(0, 10);
  const notifKey = `bongsho_bday_notif_${todayStr}`;
  if (localStorage.getItem(notifKey)) return;

  if (todayBirthdays.length > 0) {
    const p = todayBirthdays[0];
    const name = lang === "bn" ? p.member.nameBn : p.member.nameEn;
    showBrowserNotification(`🎂 শুভ জন্মদিন: ${name}!`, {
      body:
        lang === "bn"
          ? `আজ ${name}-এর শুভ জন্মদিন! পারিবারিক চ্যাটে শুভেচ্ছা জানান।`
          : `Today is ${name}'s birthday! Wish them in the Family Chat.`,
      tag: `bongsho-bday-${todayStr}`,
    });
    localStorage.setItem(notifKey, "true");
  } else {
    const tomorrowBday = upcomingBirthdays.find((b) => b.daysRemaining === 1);
    if (tomorrowBday) {
      const name = lang === "bn" ? tomorrowBday.member.nameBn : tomorrowBday.member.nameEn;
      showBrowserNotification(`🎉 আগামীকাল জন্মদিন: ${name}!`, {
        body:
          lang === "bn"
            ? `আগামীকাল ${name}-এর শুভ জন্মদিন! প্রস্তুতি নিন।`
            : `Tomorrow is ${name}'s birthday! Get ready to wish them.`,
        tag: `bongsho-bday-advance-${todayStr}`,
      });
      localStorage.setItem(notifKey, "true");
    }
  }
}
