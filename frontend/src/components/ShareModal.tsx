"use client";

import { useState } from "react";
import { Share2, Copy, Check, MessageCircle, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  raceId: string;
  train1Number: string;
  train2Number: string;
  destinationName: string;
  leaderNumber: string;
  marginMin: number;
}

export default function ShareModal({
  isOpen,
  onClose,
  raceId,
  train1Number,
  train2Number,
  destinationName,
  leaderNumber,
  marginMin,
}: Props) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const raceUrl = typeof window !== "undefined" ? window.location.href : `https://which-train-first.vercel.app/race/${raceId}`;
  const shareMessage = `🚆 Which Train First Live: ${train1Number} vs ${train2Number} towards ${destinationName}!\nCurrently Train ${leaderNumber} is predicted to arrive ${marginMin} mins earlier.\nTrack live here: ${raceUrl}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(raceUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-card border border-surface-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 bg-rail-cyan/10 border border-rail-cyan/30 text-rail-cyan rounded-xl">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Share Live Race</h3>
            <p className="text-xs text-slate-400">
              Anyone with this link can watch this head-to-head comparison live
            </p>
          </div>
        </div>

        {/* URL Box */}
        <div className="bg-surface border border-surface-border rounded-xl p-3 flex items-center justify-between mb-4">
          <input
            type="text"
            readOnly
            value={raceUrl}
            className="bg-transparent text-xs text-slate-300 font-mono focus:outline-none w-full mr-2 truncate"
          />
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-rail-cyan/20 hover:bg-rail-cyan/30 text-rail-cyan text-xs font-bold rounded-lg transition-colors shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* WhatsApp Button */}
        <button
          onClick={shareWhatsApp}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-[#25D366]/20"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>Share via WhatsApp</span>
        </button>

        <p className="text-[11px] text-slate-500 text-center mt-3">
          No sign-in or app installation needed for recipients. Fully mobile responsive.
        </p>
      </div>
    </div>
  );
}
