import { OuterSignalClashRisk } from "@/lib/types";
import { AlertTriangle, ShieldAlert, CheckCircle } from "lucide-react";

interface Props {
  clashRisk: OuterSignalClashRisk;
  destinationName: string;
}

export default function SignalClashBanner({ clashRisk, destinationName }: Props) {
  const isCritical = clashRisk.risk_level === "CRITICAL";
  const isModerate = clashRisk.risk_level === "MODERATE";

  if (clashRisk.risk_level === "LOW") {
    return (
      <div className="bg-surface-card border border-surface-border rounded-xl p-4 mb-6 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2.5">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-slate-300">
            <strong>Clear Signal Separation:</strong> Trains are separated by {clashRisk.eta_separation_minutes} minutes. Low outer signal queue risk.
          </span>
        </div>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
          CLEAR CORRIDOR
        </span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl p-5 mb-6 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        isCritical
          ? "bg-gradient-to-r from-surface-card via-surface-card to-[#2d1111] border-red-500/50 shadow-lg shadow-red-500/10"
          : "bg-gradient-to-r from-surface-card via-surface-card to-[#2c220f] border-amber-500/50 shadow-lg shadow-amber-500/10"
      }`}
    >
      <div className="flex items-start space-x-3.5">
        <div
          className={`p-2.5 rounded-xl shrink-0 ${
            isCritical
              ? "bg-red-500/15 border border-red-500/30 text-red-400"
              : "bg-amber-500/15 border border-amber-500/30 text-amber-400"
          }`}
        >
          {isCritical ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                isCritical ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
              }`}
            >
              {clashRisk.risk_level} CONGESTION RISK • {Math.round(clashRisk.clash_probability * 100)}% PROBABILITY
            </span>
            <span className="text-xs text-slate-400">Junction: {destinationName}</span>
          </div>
          <h4 className="text-sm font-bold text-white mt-1">
            Outer Home Signal Hold Warning ({clashRisk.eta_separation_minutes}m separation)
          </h4>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
            {clashRisk.operational_impact}
          </p>
        </div>
      </div>
    </div>
  );
}
