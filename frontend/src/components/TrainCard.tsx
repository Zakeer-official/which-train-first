import {
  Train,
  Clock,
  Gauge,
  Navigation,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Minus,
  Radio,
} from "lucide-react";
import { TrainLivePerformance } from "@/lib/types";

interface Props {
  train: TrainLivePerformance;
  isLeader: boolean;
  destinationName: string;
}

export default function TrainCard({ train, isLeader, destinationName }: Props) {
  const getTrendIcon = () => {
    if (train.delay_trend === "RECOVERING") {
      return (
        <span className="flex items-center text-emerald-400 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
          <TrendingDown className="w-3.5 h-3.5 mr-1" />
          Recovering Delay
        </span>
      );
    }
    if (train.delay_trend === "WORSENING") {
      return (
        <span className="flex items-center text-amber-400 text-xs font-semibold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
          <TrendingUp className="w-3.5 h-3.5 mr-1" />
          Delay Increasing
        </span>
      );
    }
    return (
      <span className="flex items-center text-slate-300 text-xs font-semibold bg-slate-500/10 border border-slate-500/30 px-2 py-0.5 rounded-md">
        <Minus className="w-3.5 h-3.5 mr-1" />
        Steady Pace
      </span>
    );
  };

  return (
    <div
      className={`rounded-2xl p-6 transition-all border ${
        isLeader
          ? "bg-gradient-to-b from-surface-card to-[#0d1e22] border-rail-leader/50 shadow-xl shadow-rail-leader/10"
          : "bg-surface-card border-surface-border shadow-lg"
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`p-3 rounded-xl ${
              isLeader
                ? "bg-rail-leader/15 border border-rail-leader/40 text-rail-leader"
                : "bg-rail-blue/15 border border-rail-blue/30 text-rail-cyan"
            }`}
          >
            <Train className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-black text-white">
                {train.train_number}
              </span>
              {isLeader && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-rail-leader/20 text-rail-leader border border-rail-leader/40 px-2 py-0.5 rounded-md">
                  LEADER
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-slate-300 line-clamp-1">
              {train.train_name}
            </h3>
          </div>
        </div>

        {getTrendIcon()}
      </div>

      {/* Main ETA Display Box */}
      <div className="bg-surface/80 border border-surface-border rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Predicted Destination Arrival</span>
          <span className="text-[11px] text-slate-400">
            Sched: <strong className="text-slate-200">{train.scheduled_dest_arrival}</strong>
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span
            className={`text-3xl sm:text-4xl font-black tracking-tight ${
              isLeader ? "text-rail-leader" : "text-white"
            }`}
          >
            {train.final_predicted_dest_eta}
          </span>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Delay</span>
            <span
              className={`text-base font-bold ${
                train.current_delay_min > 20
                  ? "text-rail-amber"
                  : train.current_delay_min > 0
                  ? "text-yellow-300"
                  : "text-rail-leader"
              }`}
            >
              +{train.current_delay_min} min
            </span>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Current Speed */}
        <div className="bg-surface/60 border border-surface-border/80 rounded-xl p-3">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
            <Gauge className="w-3.5 h-3.5 text-rail-cyan" />
            <span>Current Speed</span>
          </div>
          <div className="text-lg font-bold text-white">
            {train.current_speed_kmh} <span className="text-xs font-normal text-slate-400">km/h</span>
          </div>
        </div>

        {/* Distance Remaining */}
        <div className="bg-surface/60 border border-surface-border/80 rounded-xl p-3">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
            <Navigation className="w-3.5 h-3.5 text-rail-cyan" />
            <span>To {destinationName}</span>
          </div>
          <div className="text-lg font-bold text-white">
            {train.remaining_distance_km} <span className="text-xs font-normal text-slate-400">km</span>
          </div>
        </div>
      </div>

      {/* Probabilistic AI Forecast Bounds (P10 / P50 / P90) */}
      {train.probabilistic_bounds && (
        <div className="bg-surface/40 border border-surface-border/60 rounded-xl p-3 mb-4 text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span className="font-bold text-slate-300">Probabilistic Confidence Interval:</span>
            <span className="text-emerald-400 font-semibold">
              Slack Recovery: -{train.probabilistic_bounds.slack_recovery_min}m
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-surface/80 rounded-lg p-1.5 border border-surface-border/40">
              <span className="text-[10px] text-slate-400 block">P10 (Fast)</span>
              <span className="font-mono font-bold text-emerald-300">
                {train.probabilistic_bounds.p10_eta}
              </span>
            </div>
            <div className="bg-surface/80 rounded-lg p-1.5 border border-surface-border/40">
              <span className="text-[10px] text-slate-400 block">P50 (Expected)</span>
              <span className="font-mono font-bold text-white">
                {train.probabilistic_bounds.p50_eta}
              </span>
            </div>
            <div className="bg-surface/80 rounded-lg p-1.5 border border-surface-border/40">
              <span className="text-[10px] text-slate-400 block">P90 (Delayed)</span>
              <span className="font-mono font-bold text-amber-300">
                {train.probabilistic_bounds.p90_eta}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Current Position & Telemetry */}
      <div className="border-t border-surface-border/70 pt-3 text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-400">Current Reported Stop:</span>
          <span className="font-semibold text-white">
            {train.current_station_name} ({train.current_station_code})
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-400">Data Level:</span>
          <span className="font-semibold text-rail-cyan flex items-center">
            <Radio className="w-3 h-3 mr-1" />
            {train.level === "LEVEL_1"
              ? "Level 1: Live Telemetry"
              : train.level === "LEVEL_2"
              ? "Level 2: Sequence Engine"
              : "Level 3: Timetable"}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-400">Model Confidence:</span>
          <span className="font-semibold text-emerald-400">
            {Math.round(train.confidence_score * 100)}%
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>Source: {train.data_source}</span>
          <span>{train.data_freshness_sec}s ago</span>
        </div>
      </div>
    </div>
  );
}
