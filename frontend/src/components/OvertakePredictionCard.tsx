import { OvertakePrediction } from "@/lib/types";
import { Zap, GitCommit, Navigation } from "lucide-react";

interface Props {
  overtake: OvertakePrediction;
}

export default function OvertakePredictionCard({ overtake }: Props) {
  return (
    <div className="bg-gradient-to-r from-surface-card via-surface-card to-[#151c2e] border border-rail-cyan/40 rounded-2xl p-5 mb-6 shadow-lg shadow-rail-cyan/5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-rail-cyan/15 border border-rail-cyan/30 text-rail-cyan rounded-xl shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-rail-cyan/15 text-rail-cyan border border-rail-cyan/30 px-2 py-0.5 rounded">
                PREDICTED OVERTAKE POINT
              </span>
              <span className="text-xs text-slate-400">Track Precedence Model</span>
            </div>
            <h4 className="text-base font-extrabold text-white mt-0.5">
              Train {overtake.overtaking_train} predicted to overtake Train {overtake.overtaken_train} at {overtake.overtake_station_name} ({overtake.overtake_station_code})
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              {overtake.reason}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
