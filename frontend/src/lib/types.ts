export interface TrainStopSchema {
  sequence: number;
  station_code: string;
  station_name: string;
  scheduled_arrival: string | null;
  scheduled_departure: string | null;
  actual_arrival?: string | null;
  actual_departure?: string | null;
  delay_arrival_min: number;
  delay_departure_min: number;
  distance_km: number;
  day_count: number;
  has_departed: boolean;
  is_current: boolean;
}

export interface ProbabilisticBounds {
  p10_eta: string;
  p50_eta: string;
  p90_eta: string;
  slack_recovery_min: number;
  priority_tier: string;
}

export interface TrainLivePerformance {
  train_number: string;
  train_name: string;
  current_station_code: string;
  current_station_name: string;
  current_lat?: number | null;
  current_lng?: number | null;
  current_speed_kmh: number;
  current_delay_min: number;
  scheduled_dest_arrival: string;
  provider_dest_eta: string;
  backend_estimated_dest_eta: string;
  timetable_derived_dest_eta: string;
  final_predicted_dest_eta: string;
  remaining_distance_km: number;
  remaining_duration_min: number;
  delay_trend: "RECOVERING" | "WORSENING" | "STEADY";
  data_freshness_sec: number;
  confidence_score: number;
  level: "LEVEL_1" | "LEVEL_2" | "LEVEL_3" | "LEVEL_4";
  probabilistic_bounds?: ProbabilisticBounds;
  stops_to_destination: TrainStopSchema[];
  is_simulated: boolean;
  data_source: string;
}

export interface OvertakePrediction {
  overtake_station_code: string;
  overtake_station_name: string;
  overtaking_train: string;
  overtaken_train: string;
  reason: string;
}

export interface OuterSignalClashRisk {
  risk_level: "LOW" | "MODERATE" | "CRITICAL";
  clash_probability: number;
  eta_separation_minutes: number;
  operational_impact: string;
}

export interface RaceLeaderInfo {
  leader_train_number: string;
  leader_train_name: string;
  trailing_train_number: string;
  trailing_train_name: string;
  margin_minutes: number;
  summary_message: string;
  is_tie: boolean;
}

export interface LeadChangeItem {
  timestamp: string;
  previous_leader: string;
  new_leader: string;
  margin_minutes: number;
  reason: string;
}

export interface PredictionSnapshotItem {
  timestamp: string;
  train1_delay_min: number;
  train2_delay_min: number;
  train1_eta: string;
  train2_eta: string;
  leader_train_number: string;
  eta_gap_minutes: number;
  confidence_score: number;
}

export interface LiveRaceComparison {
  race_id: string;
  destination_station_code: string;
  destination_station_name: string;
  destination_lat?: number | null;
  destination_lng?: number | null;
  status: string;
  is_demo: boolean;
  train1: TrainLivePerformance;
  train2: TrainLivePerformance;
  leader: RaceLeaderInfo;
  eta_gap_minutes: number;
  predicted_overtake?: OvertakePrediction | null;
  signal_clash_risk?: OuterSignalClashRisk | null;
  recent_lead_changes: LeadChangeItem[];
  history: PredictionSnapshotItem[];
  last_updated: string;
  next_refresh_in_sec: number;
  provider_health_status: string;
}

export interface CommonStationOption {
  station_code: string;
  station_name: string;
  train1_sequence: number;
  train2_sequence: number;
  train1_scheduled_arrival?: string | null;
  train2_scheduled_arrival?: string | null;
}

export interface RaceSummary {
  id: string;
  train1_number: string;
  train2_number: string;
  destination_station_code: string;
  status: string;
  is_demo: boolean;
  created_at: string;
  share_url: string;
}

export interface TrainInfo {
  number: string;
  name: string;
  train_type: string;
  source_station_code: string;
  dest_station_code: string;
  source_station_name?: string;
  dest_station_name?: string;
}
