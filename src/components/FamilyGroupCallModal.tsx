"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Video,
  Mic,
  MicOff,
  PhoneOff,
  Users,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Share2,
  Check,
} from "lucide-react";
import { Language } from "@/types/family";
import {
  RTC_CONFIGURATION,
  CallParticipant,
  registerParticipant,
  unregisterParticipant,
  updateParticipantMediaStatus,
  subscribeToParticipants,
  sendSignal,
  sendIceCandidate,
  subscribeToSignals,
  subscribeToCandidates,
} from "@/lib/webrtcSignaling";
import ParticipantVideoTile from "./call/ParticipantVideoTile";
import CallControlsBar from "./call/CallControlsBar";

interface FamilyGroupCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName?: string;
  userName: string;
  userPhoto?: string;
  lang: Language;
}

export default function FamilyGroupCallModal({
  isOpen,
  onClose,
  roomName = "Family_Call_Room",
  userName,
  userPhoto,
  lang,
}: FamilyGroupCallModalProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [cameraFacingMode, setCameraFacingMode] = useState<"user" | "environment">("user");
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Active speaking indicator state
  const [isSpeakingLocally, setIsSpeakingLocally] = useState(false);

  // WebRTC Peer Connections Map: { remoteUsername: RTCPeerConnection }
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
  const candidateQueueRef = useRef<Record<string, RTCIceCandidateInit[]>>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const myUsername = userName ? userName.toLowerCase().replace(/[^a-z0-9_]/g, "_") : "family_guest";

  // Clean room identifier for signaling
  const cleanRoom = roomName.toLowerCase().replace(/[^a-z0-9_-]/g, "_");

  // Format Call Timer (mm:ss)
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 1. Timer effect
  useEffect(() => {
    if (!isOpen) {
      setCallDuration(0);
      return;
    }
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // 2. Local Media Acquisition
  const startLocalMedia = useCallback(async (facing: "user" | "environment" = "user") => {
    setPermissionError(null);
    setIsConnecting(true);

    try {
      // Stop existing tracks first
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsConnecting(false);

      // Track replacement for existing peer connections if switching camera
      Object.values(peerConnectionsRef.current).forEach((pc) => {
        const videoSender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
        const newVideoTrack = stream.getVideoTracks()[0];
        if (videoSender && newVideoTrack) {
          videoSender.replaceTrack(newVideoTrack);
        }
      });

      return stream;
    } catch (err: any) {
      console.warn("Could not get user media with video:", err);
      // Fallback: Try audio only if camera is blocked/busy
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = audioStream;
        setLocalStream(audioStream);
        setIsVideoOn(false);
        setIsConnecting(false);
        return audioStream;
      } catch (audioErr) {
        setPermissionError(
          lang === "bn"
            ? "ক্যামেরা বা মাইক্রোফোনের অনুমতি পাওয়া যায়নি। ব্রাউজারের সেটিংসে অনুমতি দিয়ে রিলোড দিন।"
            : "Camera or microphone permission was denied. Please allow access in browser settings."
        );
        setIsConnecting(false);
        return null;
      }
    }
  }, [lang]);

  // 3. Audio speaking detection for local user
  useEffect(() => {
    if (!localStream || !isAudioOn) {
      setIsSpeakingLocally(false);
      return;
    }

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const source = audioContext.createMediaStreamSource(localStream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let animId: number;

      const checkAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((acc, val) => acc + val, 0);
        const average = sum / dataArray.length;
        setIsSpeakingLocally(average > 18);
        animId = requestAnimationFrame(checkAudioLevel);
      };
      animId = requestAnimationFrame(checkAudioLevel);

      return () => {
        cancelAnimationFrame(animId);
        audioContext.close().catch(() => {});
      };
    } catch (e) {
      // AudioContext not supported or blocked
    }
  }, [localStream, isAudioOn]);

  // Flush queued ICE candidates once remote description is set
  const flushCandidateQueue = useCallback(async (remoteUser: string, pc: RTCPeerConnection) => {
    const queue = candidateQueueRef.current[remoteUser];
    if (queue && queue.length > 0) {
      for (const cand of queue) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (e) {}
      }
      candidateQueueRef.current[remoteUser] = [];
    }
  }, []);

  // Helper to create Peer Connection for a specific remote participant
  const createPeerConnection = useCallback(
    (remoteUser: string, isInitiator: boolean) => {
      if (peerConnectionsRef.current[remoteUser]) {
        return peerConnectionsRef.current[remoteUser];
      }

      const pc = new RTCPeerConnection(RTC_CONFIGURATION);
      peerConnectionsRef.current[remoteUser] = pc;

      // Add local tracks to connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      // Handle remote incoming tracks
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStreams((prev) => ({
            ...prev,
            [remoteUser]: event.streams[0],
          }));
        }
      };

      // Handle ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendIceCandidate(cleanRoom, myUsername, remoteUser, event.candidate.toJSON());
        }
      };

      // If initiator, create and send offer
      if (isInitiator) {
        pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            if (pc.localDescription) {
              sendSignal(cleanRoom, myUsername, remoteUser, "offer", pc.localDescription.sdp);
            }
          })
          .catch((err) => console.error("Error creating offer:", err));
      }

      return pc;
    },
    [cleanRoom, myUsername]
  );

  // 4. Main Lifecycle: Join Room & Listen to WebRTC Signaling
  useEffect(() => {
    if (!isOpen) return;

    let unmounted = false;

    // Start local camera
    startLocalMedia(cameraFacingMode).then(async (stream) => {
      if (unmounted || !stream) return;

      // Register self in room
      const selfParticipant: CallParticipant = {
        username: myUsername,
        displayName: userName || "Family Member",
        photoUrl: userPhoto,
        isVideoOn: true,
        isAudioOn: true,
        joinedAt: new Date().toISOString(),
      };
      await registerParticipant(cleanRoom, selfParticipant);
    });

    // Subscribe to room participants
    const unsubParticipants = subscribeToParticipants(cleanRoom, (list) => {
      if (unmounted) return;
      setParticipants(list);

      // Connect to any other participants in the room
      list.forEach((p) => {
        if (p.username !== myUsername && !peerConnectionsRef.current[p.username]) {
          // If my username is alphabetically greater, initiate offer to avoid collision
          const isInitiator = myUsername > p.username;
          createPeerConnection(p.username, isInitiator);
        }
      });

      // Clean up disconnected participants
      const currentRemoteUsernames = new Set(list.map((p) => p.username));
      Object.keys(peerConnectionsRef.current).forEach((u) => {
        if (!currentRemoteUsernames.has(u)) {
          peerConnectionsRef.current[u]?.close();
          delete peerConnectionsRef.current[u];
          delete candidateQueueRef.current[u];
          setRemoteStreams((prev) => {
            const next = { ...prev };
            delete next[u];
            return next;
          });
        }
      });
    });

    // Subscribe to incoming SDP offers/answers
    const unsubSignals = subscribeToSignals(cleanRoom, myUsername, async (signal) => {
      if (unmounted) return;
      const remoteUser = signal.from;

      let pc = peerConnectionsRef.current[remoteUser];
      if (!pc) {
        pc = createPeerConnection(remoteUser, false);
      }

      if (signal.type === "offer") {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: signal.sdp }));
          await flushCandidateQueue(remoteUser, pc);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendSignal(cleanRoom, myUsername, remoteUser, "answer", answer.sdp!);
        } catch (err) {
          console.error("Error handling offer:", err);
        }
      } else if (signal.type === "answer") {
        try {
          if (pc.signalingState !== "stable") {
            await pc.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: signal.sdp }));
            await flushCandidateQueue(remoteUser, pc);
          }
        } catch (err) {
          console.error("Error handling answer:", err);
        }
      }
    });

    // Subscribe to incoming ICE candidates with buffering
    const unsubCandidates = subscribeToCandidates(cleanRoom, myUsername, async (from, cand) => {
      if (unmounted) return;
      const pc = peerConnectionsRef.current[from];
      if (pc && pc.remoteDescription && pc.remoteDescription.type) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (e) {}
      } else {
        if (!candidateQueueRef.current[from]) candidateQueueRef.current[from] = [];
        candidateQueueRef.current[from].push(cand);
      }
    });

    return () => {
      unmounted = true;
      unsubParticipants();
      unsubSignals();
      unsubCandidates();

      // Clean up peer connections
      Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
      peerConnectionsRef.current = {};
      candidateQueueRef.current = {};

      // Stop local camera and mic tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      setLocalStream(null);
      setRemoteStreams({});

      // Unregister from room
      unregisterParticipant(cleanRoom, myUsername);
    };
  }, [
    isOpen,
    cleanRoom,
    myUsername,
    userName,
    userPhoto,
    cameraFacingMode,
    startLocalMedia,
    createPeerConnection,
    flushCandidateQueue,
  ]);

  // Handlers for Controls
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      const nextState = !isAudioOn;
      audioTracks.forEach((t) => (t.enabled = nextState));
      setIsAudioOn(nextState);
      updateParticipantMediaStatus(cleanRoom, myUsername, { isAudioOn: nextState });
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      const nextState = !isVideoOn;
      videoTracks.forEach((t) => (t.enabled = nextState));
      setIsVideoOn(nextState);
      updateParticipantMediaStatus(cleanRoom, myUsername, { isVideoOn: nextState });
    }
  };

  const flipCamera = async () => {
    const nextFacing = cameraFacingMode === "user" ? "environment" : "user";
    setCameraFacingMode(nextFacing);
    await startLocalMedia(nextFacing);
  };

  if (!isOpen) return null;

  const otherParticipants = participants.filter((p) => p.username !== myUsername);
  const totalCallers = 1 + otherParticipants.length;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col select-none overflow-hidden animate-in fade-in duration-200">
      {/* 1. TOP HEADER */}
      <header className="h-16 px-4 sm:px-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between text-white z-30 flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/90 text-amber-300 flex items-center justify-center flex-shrink-0 shadow-lg border border-emerald-500/30">
            <Video className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-white truncate drop-shadow-md">
                {lang === "bn" ? "ফ্যামিলি গ্রুপ ভিডিও কল" : "Family Group Call"}
              </h3>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{formatTimer(callDuration)}</span>
              </span>
            </div>
            <p className="text-[11px] text-stone-300 truncate drop-shadow-xs">
              {lang === "bn"
                ? `${totalCallers} জন অংশগ্রহণকারী • সরাসরি ইন-অ্যাপ কল`
                : `${totalCallers} connected • In-App Native Call`}
            </p>
          </div>
        </div>

        {/* Top Right Close */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-rose-600 text-stone-200 hover:text-white transition cursor-pointer border border-white/10 shadow-md"
            title={lang === "bn" ? "বন্ধ করুন" : "Close"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. MAIN VIDEO VIEWPORT */}
      <main className="flex-1 w-full h-full relative p-2.5 sm:p-5 flex flex-col items-center justify-center overflow-hidden">
        {/* Permission Denied Banner */}
        {permissionError && (
          <div className="absolute top-4 left-4 right-4 z-40 max-w-md mx-auto p-4 rounded-3xl bg-rose-950/95 border border-rose-500/50 text-white shadow-2xl backdrop-blur-xl space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <h4 className="font-bold text-sm text-rose-200">
                  {lang === "bn" ? "ক্যামেরা ও মাইক অ্যাক্সেস প্রয়োজন" : "Permission Required"}
                </h4>
                <p className="text-stone-300 leading-relaxed">{permissionError}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => startLocalMedia(cameraFacingMode)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "পুনরায় চেষ্টা করুন" : "Retry"}</span>
              </button>
            </div>
          </div>
        )}

        {/* CASE A: Waiting for other family members to join */}
        {otherParticipants.length === 0 ? (
          <div className="w-full h-full max-w-4xl max-h-[78vh] flex flex-col items-center justify-center relative">
            <ParticipantVideoTile
              displayName={userName || "You"}
              photoUrl={userPhoto}
              stream={localStream}
              isLocal={true}
              isVideoOn={isVideoOn}
              isAudioOn={isAudioOn}
              isSpeaking={isSpeakingLocally}
              className="w-full h-full min-h-[360px]"
            />

            {/* Waiting Overlay Banner */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-2xl bg-neutral-900/90 backdrop-blur-md border border-white/20 shadow-2xl flex items-center gap-2.5 text-center">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span className="font-extrabold text-xs sm:text-sm text-amber-200">
                {lang === "bn"
                  ? "পরিবারের অন্য সদস্যদের জন্য অপেক্ষা করা হচ্ছে..."
                  : "Waiting for other family members to join..."}
              </span>
            </div>
          </div>
        ) : (
          /* CASE B: 2+ participants in call (Split / Grid View) */
          <div
            className={`w-full h-full max-w-5xl max-h-[78vh] grid gap-2.5 sm:gap-4 p-1 ${
              totalCallers === 2
                ? "grid-cols-1 md:grid-cols-2"
                : totalCallers <= 4
                ? "grid-cols-2 grid-rows-2"
                : "grid-cols-2 md:grid-cols-3"
            }`}
          >
            {/* Local User Tile */}
            <ParticipantVideoTile
              displayName={userName || "You"}
              photoUrl={userPhoto}
              stream={localStream}
              isLocal={true}
              isVideoOn={isVideoOn}
              isAudioOn={isAudioOn}
              isSpeaking={isSpeakingLocally}
              className="w-full h-full"
            />

            {/* Remote Participants Tiles */}
            {otherParticipants.map((p) => {
              const rStream = remoteStreams[p.username];
              return (
                <ParticipantVideoTile
                  key={p.username}
                  displayName={p.displayName}
                  photoUrl={p.photoUrl}
                  stream={rStream}
                  isLocal={false}
                  isVideoOn={p.isVideoOn}
                  isAudioOn={p.isAudioOn}
                  className="w-full h-full"
                />
              );
            })}
          </div>
        )}
      </main>

      {/* 3. BOTTOM FLOATING CONTROL DOCK */}
      <footer className="h-24 sm:h-28 flex items-center justify-center px-4 bg-gradient-to-t from-black via-black/85 to-transparent z-30 flex-shrink-0">
        <CallControlsBar
          lang={lang}
          isAudioOn={isAudioOn}
          isVideoOn={isVideoOn}
          hasMultipleCameras={true}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onFlipCamera={flipCamera}
          onEndCall={onClose}
        />
      </footer>
    </div>
  );
}
