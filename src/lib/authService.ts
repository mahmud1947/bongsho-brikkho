import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/types/family";

export async function lookupAccountByIdentifier(
  identifier: string
): Promise<{ success: boolean; error?: string; username?: string }> {
  const raw = identifier.trim();
  if (!raw) {
    return { success: false, error: "empty_identifier" };
  }

  const cleanUser = raw.toLowerCase().replace(/^@/, "");
  const inputDigits = raw.replace(/\D/g, "");

  // 1. Phone number match in Firestore
  if (inputDigits.length >= 6) {
    try {
      const snap = await getDocs(collection(db, "user_profiles"));
      const matchedDoc = snap.docs.find((d) => {
        const u = d.data() as UserProfile;
        if (!u.phone) return false;
        const uDigits = u.phone.replace(/\D/g, "");
        if (!uDigits) return false;
        return (
          uDigits === inputDigits ||
          uDigits.endsWith(inputDigits) ||
          inputDigits.endsWith(uDigits)
        );
      });

      if (matchedDoc) {
        const user = matchedDoc.data() as UserProfile;
        return { success: true, username: user.username };
      }
    } catch (e) {
      console.warn("Error querying user_profiles by phone:", e);
    }
  }

  // 2. Direct Username match in Firestore
  try {
    const docRef = doc(db, "user_profiles", cleanUser);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { success: true, username: cleanUser };
    }
  } catch (e) {
    console.warn("Error querying user_profiles by username:", e);
  }

  // 3. LocalStorage fallback
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("bongsho_profile_")) {
        const rawJson = localStorage.getItem(key);
        if (rawJson) {
          const profile = JSON.parse(rawJson) as UserProfile;
          if (profile.username && profile.username.toLowerCase() === cleanUser) {
            return { success: true, username: profile.username };
          }
          if (inputDigits.length >= 6 && profile.phone) {
            const pDigits = profile.phone.replace(/\D/g, "");
            if (
              pDigits === inputDigits ||
              pDigits.endsWith(inputDigits) ||
              inputDigits.endsWith(pDigits)
            ) {
              return { success: true, username: profile.username };
            }
          }
        }
      }
    }
  } catch (e) {}

  return { success: false, error: "not_found" };
}

export async function checkIfAccountExists(
  username: string,
  phone?: string
): Promise<{ usernameExists: boolean; phoneExists: boolean }> {
  const cleanUser = username.trim().toLowerCase().replace(/^@/, "");
  const inputDigits = phone ? phone.replace(/\D/g, "") : "";

  let usernameExists = false;
  let phoneExists = false;

  try {
    const userDoc = await getDoc(doc(db, "user_profiles", cleanUser));
    if (userDoc.exists()) {
      usernameExists = true;
    }

    if (inputDigits && inputDigits.length >= 6) {
      const snap = await getDocs(collection(db, "user_profiles"));
      for (const d of snap.docs) {
        const u = d.data() as UserProfile;
        if (u.phone) {
          const uDigits = u.phone.replace(/\D/g, "");
          if (
            uDigits === inputDigits ||
            uDigits.endsWith(inputDigits) ||
            inputDigits.endsWith(uDigits)
          ) {
            phoneExists = true;
            break;
          }
        }
      }
    }
  } catch (e) {
    console.warn("Error checking account exists:", e);
  }

  return { usernameExists, phoneExists };
}
