"use client";

import { StationRaceMilestone } from "@/lib/types";
import { Clock, MapPin, CheckCircle2, Navigation, AlertCircle, ArrowRight, Zap, Flag } from "lucide-react";

interface Props {
  milestones: StationRaceMilestone[];
  train1Number: string;
  train2Number: string;
  train1Name: string;
  train2Name: string;
  destinationCode: string;
}

export default function StationRaceTimeline({
  milestones,
  train1Number,
  train2Number,
  train1Name,
  train2Name,
  destinationCode,
}: Props) {
  if (!milestones || milestones.length === 0) {
    return null;
  }

  const getStatusBadge = (status: string, delay: number) => {
    switch (status) {
      case "HALTED":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>Halted at Platform</span>
          </span>
        );
      case "PASSING":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rail-cyan/15 text-rail-cyan border border-rail-cyan/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rail-cyan"></span>
            <span>Passing Through</span>
          </span>
        );
      case "DEPARTED":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
            <CheckCircle2 className="w-3 h-3 text-slate-500" />
            <span>Departed</span>
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-semibold text-slate-400">
            Upcoming Stop
          </span>
        );
    }
  };

  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl p-6 mb-8 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-surface-border gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-rail-cyan/10 border border-rail-cyan/30 text-rail-cyan rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-white">
              Station-by-Station Race Timeline & Halt Forecast
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time milestone breakdown comparing projected arrival times, station delays, and earliest cover at every upcoming stop
          </p>
        </div>
        <div className="flex items-center space-x-4 text-xs font-semibold">
          <div className="flex items-center space-x-1.5 text-rail-cyan">
            <span className="w-2.5 h-2.5 rounded-full bg-rail-cyan"></span>
            <span>Train {train1Number}</span>
          </div>
          <div className="flex items-center space-x-1.5 text-purple-400">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
            <span>Train {train2Number}</span>
          </div>
        </div>
      </div>

      {/* Desktop & Tablet Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-surface-border text-slate-400 uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3">Station & Scheduled Halt</th>
              <th className="py-3 px-3 text-rail-cyan font-bold">
                Train {train1Number} Expected
              </th>
              <th className="py-3 px-3 text-center">Projected Station Leader</th>
              <th className="py-3 px-3 text-purple-400 font-bold">
                Train {train2Number} Expected
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/60">
            {milestones.map((m, idx) => {
              const isT1Earlier = m.earlier_train_number === train1Number;
              const isT2Earlier = m.earlier_train_number === train2Number;
              const isTie = m.earlier_train_number === "TIE";

              return (
                <tr
                  key={idx}
                  className={`hover:bg-surface/50 transition-colors ${
                    m.is_destination
                      ? "bg-rail-leader/10 border-l-4 border-l-rail-leader font-semibold"
                      : ""
                  }`}
                >
                  {/* Station Name & Halt */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center space-x-2">
                      {m.is_destination ? (
                        <Flag className="w-4 h-4 text-rail-leader shrink-0" />
                      ) : (
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <div className="font-bold text-white text-sm">
                          {m.station_name}{" "}
                          <span className="font-mono text-slate-400 text-xs">
                            ({m.station_code})
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center space-x-2 mt-0.5">
                          <span>Scheduled Halt: {m.train1_halt_min}m</span>
                          {m.is_destination && (
                            <span className="text-rail-leader font-bold">
                              • Common Destination
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Train 1 Arrival & Delay */}
                  <td className="py-3.5 px-3">
                    <div className="space-y-1">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-base font-extrabold font-mono text-white">
                          {m.train1_expected_time}
                        </span>
                        {m.train1_delay_min > 0 ? (
                          <span className="text-[10px] font-bold text-amber-400">
                            +{m.train1_delay_min}m delay
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-400">
                            On Time
                          </span>
                        )}
                      </div>
                      <div>{getStatusBadge(m.train1_status, m.train1_delay_min)}</div>
                    </div>
                  </td>

                  {/* Earlier Arrival / Leader Badge */}
                  <td className="py-3.5 px-3 text-center">
                    {isTie ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        Simultaneous Arrival
                      </span>
                    ) : isT1Earlier ? (
                      <div className="inline-flex flex-col items-center">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-black bg-rail-cyan/15 text-rail-cyan border border-rail-cyan/30">
                          <Zap className="w-3.5 h-3.5" />
                          <span>Train {train1Number} Earlier</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 mt-0.5">
                          +{m.time_gap_at_station_min}m earlier
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex flex-col items-center">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-black bg-purple-500/15 text-purple-400 border border-purple-500/30">
                          <Zap className="w-3.5 h-3.5" />
                          <span>Train {train2Number} Earlier</span>
                        </span>
                        <span className="text-[10px] font-bold text-purple-300 mt-0.5">
                          +{m.time_gap_at_station_min}m earlier
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Train 2 Arrival & Delay */}
                  <td className="py-3.5 px-3">
                    <div className="space-y-1">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-base font-extrabold font-mono text-white">
                          {m.train2_expected_time}
                        </span>
                        {m.train2_delay_min > 0 ? (
                          <span className="text-[10px] font-bold text-amber-400">
                            +{m.train2_delay_min}m delay
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-400">
                            On Time
                          </span>
                        )}
                      </div>
                      <div>{getStatusBadge(m.train2_status, m.train2_delay_min)}</div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
