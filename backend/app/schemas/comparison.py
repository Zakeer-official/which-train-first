from pydantic import BaseModel
from typing import List, Optional
from app.schemas.train import TrainStopSchema

class ProbabilisticBounds(BaseModel):
    p10_eta: str
    p50_eta: str
    p90_eta: str
    slack_recovery_min: int
    priority_tier: str

class TrainLivePerformance(BaseModel):
    train_number: str
    train_name: str
    current_station_code: str
    current_station_name: str
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    current_speed_kmh: float
    current_delay_min: int
    scheduled_dest_arrival: str
    provider_dest_eta: str
    backend_estimated_dest_eta: str
    timetable_derived_dest_eta: str
    final_predicted_dest_eta: str
    remaining_distance_km: float
    remaining_duration_min: int
    delay_trend: str # RECOVERING, WORSENING, STEADY
    data_freshness_sec: int
    confidence_score: float # 0.0 - 1.0
    level: str # LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4
    probabilistic_bounds: Optional[ProbabilisticBounds] = None
    stops_to_destination: List[TrainStopSchema] = []
    is_simulated: bool = False
    data_source: str

class RaceLeaderInfo(BaseModel):
    leader_train_number: str
    leader_train_name: str
    trailing_train_number: str
    trailing_train_name: str
    margin_minutes: int
    summary_message: str
    is_tie: bool = False

class LeadChangeItem(BaseModel):
    timestamp: str
    previous_leader: str
    new_leader: str
    margin_minutes: int
    reason: str

class PredictionSnapshotItem(BaseModel):
    timestamp: str
    train1_delay_min: int
    train2_delay_min: int
    train1_eta: str
    train2_eta: str
    leader_train_number: str
    eta_gap_minutes: int
    confidence_score: float

class OvertakePrediction(BaseModel):
    overtake_station_code: str
    overtake_station_name: str
    overtaking_train: str
    overtaken_train: str
    reason: str

class OuterSignalClashRisk(BaseModel):
    risk_level: str # LOW, MODERATE, CRITICAL
    clash_probability: float # 0.0 - 1.0
    eta_separation_minutes: int
    operational_impact: str

class StationRaceMilestone(BaseModel):
    station_code: str
    station_name: str
    train1_expected_time: Optional[str] = None
    train1_delay_min: int = 0
    train1_status: str # DEPARTED, HALTED, PASSING, UPCOMING
    train1_halt_min: int = 2
    train2_expected_time: Optional[str] = None
    train2_delay_min: int = 0
    train2_status: str # DEPARTED, HALTED, PASSING, UPCOMING
    train2_halt_min: int = 2
    earlier_train_number: Optional[str] = None
    time_gap_at_station_min: int = 0
    is_destination: bool = False

class LiveRaceComparison(BaseModel):
    race_id: str
    destination_station_code: str
    destination_station_name: str
    destination_lat: Optional[float] = None
    destination_lng: Optional[float] = None
    status: str # ACTIVE, FINISHED
    is_demo: bool
    train1: TrainLivePerformance
    train2: TrainLivePerformance
    leader: RaceLeaderInfo
    eta_gap_minutes: int
    predicted_overtake: Optional[OvertakePrediction] = None
    signal_clash_risk: Optional[OuterSignalClashRisk] = None
    station_milestones: List[StationRaceMilestone] = []
    recent_lead_changes: List[LeadChangeItem] = []
    history: List[PredictionSnapshotItem] = []
    last_updated: str
    next_refresh_in_sec: int
    provider_health_status: str
