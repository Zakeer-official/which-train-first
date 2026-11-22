"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  RotateCw,
  Share2,
  Clock,
  Radio,
  AlertTriangle,
  Play,
  Pause,
  ExternalLink,
} from "lucide-react";
import { fetchRaceData } from "@/lib/api";
import { LiveRaceComparison } from "@/lib/types";

import RaceLeaderBanner from "@/components/RaceLeaderBanner";
import TrainCard from "@/components/TrainCard";
import ProgressTracker from "@/components/ProgressTracker";
import RaceMap from "@/components/RaceMap";
import HistoricalCharts from "@/components/HistoricalCharts";
import UpcomingStationsTable from "@/components/UpcomingStationsTable";
import ShareModal from "@/components/ShareModal";
import SignalClashBanner from "@/components/SignalClashBanner";
import OvertakePredictionCard from "@/components/OvertakePredictionCard";
import AudioCommentaryButton from "@/components/AudioCommentaryButton";

export default function LiveRaceDashboard() {
  const params = useParams();
  const raceId = params?.id as string;

  const [raceData, setRaceData] = useState<LiveRaceComparison | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-refresh controls
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(15);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Share Modal
  const [isShareOpen, setIsShareOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!raceId) return;
    setIsRefreshing(true);
    try {
      const data = await fetchRaceData(raceId);
      setRaceData(data);
      setError(null);
      setCountdown(15);
    } catch (err: any) {
      setError(err.message || "Failed to refresh race data.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [raceId]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Countdown and periodic refresh interval
  useEffect(() => {
    if (!isAutoRefresh) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadData();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoRefresh, loadData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-rail-cyan/20 border-t-rail-cyan rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-semibold">
          Establishing telemetry link & calculating ETA predictions...
        </p>
      </div>
    );
  }

  if (error || !raceData) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-surface-card border border-red-500/30 rounded-2xl p-8 text-center space-y-4">
        <div className="p-3 bg-red-500/10 text-red-400 rounded-full w-fit mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Race Stream Unavailable</h2>
        <p className="text-sm text-slate-400">{error || "Race not found."}</p>
        <button
          onClick={loadData}
          className="px-6 py-2.5 bg-surface border border-surface-border hover:bg-surface-border text-white text-xs font-bold rounded-xl transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const isTrain1Leader =
    raceData.leader.leader_train_number === raceData.train1.train_number;
  const isTrain2Leader =
    raceData.leader.leader_train_number === raceData.train2.train_number;

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-border gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-surface-card border border-surface-border px-3 py-1.5 rounded-xl text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-rail-leader animate-ping"></span>
            <span className="font-bold text-white uppercase tracking-wider">
              LIVE COMPARISON
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Race ID: {raceData.race_id}
          </span>
          {raceData.is_demo && (
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
              DEMO SIMULATION FEED
            </span>
          )}
        </div>

        {/* Refresh & Share Controls */}
        <div className="flex items-center space-x-3">
          {/* Audio Race Commentary Voice */}
          <AudioCommentaryButton
            summaryMessage={raceData.leader.summary_message}
            leaderNumber={raceData.leader.leader_train_number}
            marginMin={raceData.leader.margin_minutes}
            destinationName={raceData.destination_station_name}
          />

          {/* Pause / Resume Auto-Refresh */}
          <button
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-surface-card border border-surface-border hover:bg-surface-border/50 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
            title={isAutoRefresh ? "Pause Live Updates" : "Resume Live Updates"}
          >
            {isAutoRefresh ? (
              <>
                <Pause className="w-3.5 h-3.5 text-rail-cyan" />
                <span>Next update in {countdown}s</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-slate-400" />
                <span>Updates Paused</span>
              </>
            )}
          </button>

          {/* Manual Refresh */}
          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="p-2 bg-surface-card border border-surface-border hover:bg-surface-border/50 text-slate-300 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh Now"
          >
            <RotateCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin text-rail-cyan" : ""}`}
            />
          </button>

          {/* Share Race Button */}
          <button
            onClick={() => setIsShareOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-rail-cyan/15 hover:bg-rail-cyan/25 border border-rail-cyan/40 text-rail-cyan text-xs font-bold rounded-xl transition-colors shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Race</span>
          </button>
        </div>
      </div>

      {/* Prominent Predicted Leader Banner */}
      <RaceLeaderBanner
        leader={raceData.leader}
        destinationName={raceData.destination_station_name}
        destinationCode={raceData.destination_station_code}
      />

      {/* Signal Congestion / Outer Home Signal Clash Warning */}
      {raceData.signal_clash_risk && (
        <SignalClashBanner
          clashRisk={raceData.signal_clash_risk}
          destinationName={raceData.destination_station_name}
        />
      )}

      {/* Predicted Physical Overtake Station */}
      {raceData.predicted_overtake && (
        <OvertakePredictionCard overtake={raceData.predicted_overtake} />
      )}

      {/* Side-by-Side Train Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TrainCard
          train={raceData.train1}
          isLeader={isTrain1Leader}
          destinationName={raceData.destination_station_name}
        />
        <TrainCard
          train={raceData.train2}
          isLeader={isTrain2Leader}
          destinationName={raceData.destination_station_name}
        />
      </div>

      {/* Dual Linear Track Progress Visualization */}
      <ProgressTracker
        train1={raceData.train1}
        train2={raceData.train2}
        destinationName={raceData.destination_station_name}
        destinationCode={raceData.destination_station_code}
      />

      {/* Interactive Leaflet Geospatial Convergence Map */}
      <RaceMap
        train1={raceData.train1}
        train2={raceData.train2}
        destinationName={raceData.destination_station_name}
        destinationCode={raceData.destination_station_code}
        destLat={raceData.destination_lat}
        destLng={raceData.destination_lng}
      />

      {/* Upcoming Intermediate Halts Table */}
      <UpcomingStationsTable
        train1Number={raceData.train1.train_number}
        train2Number={raceData.train2.train_number}
        stops1={raceData.train1.stops_to_destination}
        stops2={raceData.train2.stops_to_destination}
        destinationCode={raceData.destination_station_code}
      />

      {/* Recharts Delay Trend & Lead Change Log */}
      <HistoricalCharts
        history={raceData.history}
        leadChanges={raceData.recent_lead_changes}
        train1Number={raceData.train1.train_number}
        train2Number={raceData.train2.train_number}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        raceId={raceData.race_id}
        train1Number={raceData.train1.train_number}
        train2Number={raceData.train2.train_number}
        destinationName={raceData.destination_station_name}
        leaderNumber={raceData.leader.leader_train_number}
        marginMin={raceData.leader.margin_minutes}
      />
    </div>
  );
}
