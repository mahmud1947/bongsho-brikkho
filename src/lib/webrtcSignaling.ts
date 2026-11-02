import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const RTC_CONFIGURATION: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ],
};

export interface CallParticipant {
  username: string;
  displayName: string;
  photoUrl?: string;
  isVideoOn: boolean;
  isAudioOn: boolean;
  joinedAt: string;
}

export interface CallSignal {
  id: string;
  from: string;
  to: string;
  type: "offer" | "answer";
  sdp: string;
  candidates?: RTCIceCandidateInit[];
}

const CALLS_COLLECTION = "call_rooms";

export async function registerParticipant(
  roomId: string,
  participant: CallParticipant
) {
  try {
    const roomRef = doc(db, CALLS_COLLECTION, roomId);
    await setDoc(
      roomRef,
      {
        id: roomId,
        status: "active",
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    const pRef = doc(db, CALLS_COLLECTION, roomId, "participants", participant.username);
    await setDoc(pRef, participant, { merge: true });
  } catch (err) {
    console.warn("Error registering call participant:", err);
  }
}

export async function updateParticipantMediaStatus(
  roomId: string,
  username: string,
  status: { isVideoOn?: boolean; isAudioOn?: boolean }
) {
  try {
    const pRef = doc(db, CALLS_COLLECTION, roomId, "participants", username);
    await updateDoc(pRef, status);
  } catch (e) {}
}

export async function unregisterParticipant(roomId: string, username: string) {
  try {
    const pRef = doc(db, CALLS_COLLECTION, roomId, "participants", username);
    await deleteDoc(pRef);

    // Clean up signals involving this user
    const signalsSnap = await getDocs(
      collection(db, CALLS_COLLECTION, roomId, "signals")
    );
    for (const d of signalsSnap.docs) {
      if (d.id.includes(username)) {
        await deleteDoc(d.ref).catch(() => {});
      }
    }

    // Check if any participants left
    const pSnap = await getDocs(
      collection(db, CALLS_COLLECTION, roomId, "participants")
    );
    if (pSnap.empty) {
      await updateDoc(doc(db, CALLS_COLLECTION, roomId), {
        status: "ended",
        endedAt: new Date().toISOString(),
      }).catch(() => {});
    }
  } catch (err) {
    console.warn("Error unregistering participant:", err);
  }
}

export function subscribeToParticipants(
  roomId: string,
  onUpdate: (participants: CallParticipant[]) => void
) {
  const pCol = collection(db, CALLS_COLLECTION, roomId, "participants");
  return onSnapshot(pCol, (snap) => {
    const list = snap.docs.map((d) => d.data() as CallParticipant);
    onUpdate(list);
  });
}

export async function sendSignal(
  roomId: string,
  from: string,
  to: string,
  type: "offer" | "answer",
  sdp: string
) {
  const signalId = `${from}_to_${to}`;
  const sRef = doc(db, CALLS_COLLECTION, roomId, "signals", signalId);
  await setDoc(sRef, {
    id: signalId,
    from,
    to,
    type,
    sdp,
    createdAt: Date.now(),
  });
}

export async function sendIceCandidate(
  roomId: string,
  from: string,
  to: string,
  candidate: RTCIceCandidateInit
) {
  const candId = `cand_${from}_${to}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const cRef = doc(db, CALLS_COLLECTION, roomId, "candidates", candId);
  await setDoc(cRef, {
    from,
    to,
    candidate: JSON.stringify(candidate),
    createdAt: Date.now(),
  });
}

export function subscribeToSignals(
  roomId: string,
  myUsername: string,
  onSignal: (signal: CallSignal) => void
) {
  const sCol = collection(db, CALLS_COLLECTION, roomId, "signals");
  return onSnapshot(sCol, (snap) => {
    snap.docChanges().forEach((change) => {
      if (change.type === "added" || change.type === "modified") {
        const data = change.doc.data() as CallSignal;
        if (data.to === myUsername) {
          onSignal(data);
        }
      }
    });
  });
}

export function subscribeToCandidates(
  roomId: string,
  myUsername: string,
  onCandidate: (from: string, candidate: RTCIceCandidateInit) => void
) {
  const cCol = collection(db, CALLS_COLLECTION, roomId, "candidates");
  return onSnapshot(cCol, (snap) => {
    snap.docChanges().forEach((change) => {
      if (change.type === "added") {
        const data = change.doc.data();
        if (data.to === myUsername && data.candidate) {
          try {
            const cand = JSON.parse(data.candidate);
            onCandidate(data.from, cand);
          } catch (e) {}
        }
      }
    });
  });
}

