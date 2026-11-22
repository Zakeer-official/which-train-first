"use client";

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface Props {
  summaryMessage: string;
  leaderNumber: string;
  marginMin: number;
  destinationName: string;
}

export default function AudioCommentaryButton({
  summaryMessage,
  leaderNumber,
  marginMin,
  destinationName,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Audio commentary is not supported on this browser.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const textToSpeak = `Train Race Update! Attention passengers heading towards ${destinationName}. ${summaryMessage}. Predicted arrival margin is ${marginMin} minutes.`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <button
      onClick={speak}
      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
        isPlaying
          ? "bg-rail-leader/20 border-rail-leader text-rail-leader animate-pulse"
          : "bg-surface-card border-surface-border hover:bg-surface-border/50 text-slate-300"
      }`}
      title={isPlaying ? "Stop Announcement" : "Listen to Audio Track Announcement"}
    >
      {isPlaying ? (
        <>
          <VolumeX className="w-3.5 h-3.5 text-rail-leader" />
          <span>Stop Voice</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-rail-cyan" />
          <span>Track Voice Announcement</span>
        </>
      )}
    </button>
  );
}
