from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Tuple
from app.schemas.train import RunningStatusResponse, TrainStopSchema
from app.schemas.comparison import (
    TrainLivePerformance,
    RaceLeaderInfo,
    LiveRaceComparison,
    LeadChangeItem,
    PredictionSnapshotItem,
    ProbabilisticBounds,
    OvertakePrediction,
    OuterSignalClashRisk,
    StationRaceMilestone
)
from app.engine.eta_calculator import ETACalculator, parse_time_to_minutes, minutes_to_time_str
from app.engine.probabilistic_eta import ProbabilisticETAEngine
from app.engine.overtake_engine import OvertakeAndCongestionEngine
from app.providers.factory import get_station_metadata

class TrainComparisonEngine:
    """
    Core Head-to-Head Train Comparison Engine.
    Evaluates:
    - Independent destination ETA calculations across both trains
    - Predicted leader and exact gap in minutes
    - Delay recovery/worsening trends
    - Lead changes and historical trajectory
    - Fallback levels (Level 1 to Level 4)
    """

    @staticmethod
    def evaluate_train_performance(
        status: RunningStatusResponse,
        destination_station_code: str,
        previous_delay_min: Optional[int] = None
    ) -> Tuple[TrainLivePerformance, int]:
        """
        Evaluates one train's metrics towards the common destination.
        Returns (TrainLivePerformance, final_predicted_arrival_minutes).
        """
        dest_code = destination_station_code.upper()
        all_stops = status.all_stops

        # Find destination stop in train's route
        dest_stop: Optional[TrainStopSchema] = None
        for s in all_stops:
            if s.station_code == dest_code:
                dest_stop = s
                break

        if not dest_stop:
            raise ValueError(f"Station {dest_code} is not an upcoming stop for Train {status.train_number}")

        # 1. Scheduled Arrival
        sched_dest_str = dest_stop.scheduled_arrival or dest_stop.scheduled_departure or "Unknown"

        # 2. Timetable-Derived ETA (Level 3)
        timetable_eta_str, timetable_min = ETACalculator.calculate_timetable_derived_eta(
            scheduled_arrival=dest_stop.scheduled_arrival,
            day_count=dest_stop.day_count,
            current_delay_min=status.delay_minutes
        )

        # 3. Backend-Estimated ETA (Level 2)
        backend_eta_str, backend_min, rem_dist, rem_duration = ETACalculator.calculate_backend_estimated_eta(
            all_stops=all_stops,
            current_station_code=status.current_station_code,
            destination_station_code=dest_code,
            current_speed_kmh=status.speed_kmh,
            current_delay_min=status.delay_minutes,
            train_type="SUPERFAST"
        )

        # 4. Provider Reported ETA (Level 1)
        # If provider supplied realistic ETA or we blend with backend
        provider_eta_str = timetable_eta_str # Default fallback

        # Determine level & final predicted ETA
        if status.speed_kmh > 0 and status.current_lat is not None:
            level = "LEVEL_1" # Reliable live telemetry & coordinates
            final_eta_min = backend_min
            final_eta_str = backend_eta_str
        elif status.current_station_code != "UNKNOWN":
            level = "LEVEL_2" # Reported station sequence estimate
            final_eta_min = backend_min
            final_eta_str = backend_eta_str
        elif status.delay_minutes is not None:
            level = "LEVEL_3" # Timetable + delay fallback
            final_eta_min = timetable_min
            final_eta_str = timetable_eta_str
        else:
            level = "LEVEL_4" # Stale / data unavailable
            final_eta_min = timetable_min
            final_eta_str = "Unavailable"

        # Delay trend
        if previous_delay_min is None:
            delay_trend = "STEADY"
        elif status.delay_minutes < previous_delay_min:
            delay_trend = "RECOVERING"
        elif status.delay_minutes > previous_delay_min:
            delay_trend = "WORSENING"
        else:
            delay_trend = "STEADY"

        # Confidence
        stops_to_dest = [s for s in status.upcoming_stops if s.sequence <= dest_stop.sequence]
        confidence = ETACalculator.compute_confidence(
            data_freshness_sec=status.data_freshness_seconds,
            remaining_stops_count=len(stops_to_dest),
            has_live_speed=(status.speed_kmh > 0)
        )

        # Probabilistic Bounds Calculation
        prob_stats = ProbabilisticETAEngine.calculate_probabilistic_arrival(
            base_eta_minutes=final_eta_min,
            current_delay_min=status.delay_minutes,
            remaining_distance_km=rem_dist,
            train_type="SUPERFAST",
            remaining_stops_count=len(stops_to_dest)
        )
        prob_bounds = ProbabilisticBounds(
            p10_eta=minutes_to_time_str(prob_stats["p10_minutes"]),
            p50_eta=minutes_to_time_str(prob_stats["p50_minutes"]),
            p90_eta=minutes_to_time_str(prob_stats["p90_minutes"]),
            slack_recovery_min=prob_stats["slack_recovery_potential_min"],
            priority_tier=prob_stats["priority_tier"]
        )

        perf = TrainLivePerformance(
            train_number=status.train_number,
            train_name=status.train_name,
            current_station_code=status.current_station_code,
            current_station_name=status.current_station_name,
            current_lat=status.current_lat,
            current_lng=status.current_lng,
            current_speed_kmh=status.speed_kmh,
            current_delay_min=status.delay_minutes,
            scheduled_dest_arrival=sched_dest_str,
            provider_dest_eta=provider_eta_str,
            backend_estimated_dest_eta=backend_eta_str,
            timetable_derived_dest_eta=timetable_eta_str,
            final_predicted_dest_eta=final_eta_str,
            remaining_distance_km=rem_dist,
            remaining_duration_min=rem_duration,
            delay_trend=delay_trend,
            data_freshness_sec=status.data_freshness_seconds,
            confidence_score=confidence,
            level=level,
            probabilistic_bounds=prob_bounds,
            stops_to_destination=stops_to_dest,
            is_simulated=status.is_simulated,
            data_source=status.data_source
        )

        return perf, final_eta_min

    @classmethod
    def compare_races(
        cls,
        race_id: str,
        dest_station_code: str,
        status1: RunningStatusResponse,
        status2: RunningStatusResponse,
        previous_snapshot: Optional[PredictionSnapshotItem] = None,
        history: Optional[List[PredictionSnapshotItem]] = None,
        lead_changes: Optional[List[LeadChangeItem]] = None,
        next_refresh_sec: int = 30,
        provider_health_status: str = "HEALTHY"
    ) -> LiveRaceComparison:
        """
        Performs head-to-head comparison between two trains racing towards the common destination.
        Identifies leader, ETA gap, lead changes, and constructs complete dashboard payload.
        """
        # Previous delays for trend detection
        prev_delay1 = previous_snapshot.train1_delay_min if previous_snapshot else None
        prev_delay2 = previous_snapshot.train2_delay_min if previous_snapshot else None

        perf1, t1_eta_min = cls.evaluate_train_performance(status1, dest_station_code, prev_delay1)
        perf2, t2_eta_min = cls.evaluate_train_performance(status2, dest_station_code, prev_delay2)

        # Destination metadata
        dest_meta = get_station_metadata(dest_station_code)

        # Leader determination (Earliest arrival wins; NOT geographical distance alone!)
        eta_gap = abs(t1_eta_min - t2_eta_min)
        is_tie = (eta_gap == 0)

        if t1_eta_min < t2_eta_min:
            leader_num = perf1.train_number
            leader_name = perf1.train_name
            trailing_num = perf2.train_number
            trailing_name = perf2.train_name
            summary = f"Train {leader_num} ({leader_name}) is currently predicted to arrive {eta_gap} minutes earlier."
        elif t2_eta_min < t1_eta_min:
            leader_num = perf2.train_number
            leader_name = perf2.train_name
            trailing_num = perf1.train_number
            trailing_name = perf1.train_name
            summary = f"Train {leader_num} ({leader_name}) is currently predicted to arrive {eta_gap} minutes earlier."
        else:
            leader_num = perf1.train_number
            leader_name = perf1.train_name
            trailing_num = perf2.train_number
            trailing_name = perf2.train_name
            summary = f"Dead heat! Both trains are currently predicted to arrive at {dest_meta.get('name', dest_station_code)} simultaneously."

        leader_info = RaceLeaderInfo(
            leader_train_number=leader_num,
            leader_train_name=leader_name,
            trailing_train_number=trailing_num,
            trailing_train_name=trailing_name,
            margin_minutes=eta_gap,
            summary_message=summary,
            is_tie=is_tie
        )

        # Detect Predicted Overtake Station
        overtake_raw = OvertakeAndCongestionEngine.detect_predicted_overtake(
            stops1=status1.all_stops,
            stops2=status2.all_stops,
            train1_number=status1.train_number,
            train2_number=status2.train_number,
            train1_speed=status1.speed_kmh,
            train2_speed=status2.speed_kmh,
            train1_delay=status1.delay_minutes,
            train2_delay=status2.delay_minutes
        )
        overtake_pred = OvertakePrediction(**overtake_raw) if overtake_raw else None

        # Calculate Outer Signal Clash Risk at Destination
        clash_raw = OvertakeAndCongestionEngine.calculate_outer_signal_clash_risk(
            eta1_minutes=t1_eta_min,
            eta2_minutes=t2_eta_min,
            destination_station_code=dest_station_code
        )
        clash_risk = OuterSignalClashRisk(**clash_raw)

        # Compute Station-by-Station Race Milestones
        stops2_by_code = {s.station_code: s for s in status2.all_stops}
        milestones: List[StationRaceMilestone] = []
        dest_upper = dest_station_code.upper()

        for s1 in status1.all_stops:
            if s1.station_code in stops2_by_code:
                s2 = stops2_by_code[s1.station_code]

                t1_status = "DEPARTED" if s1.has_departed else ("HALTED" if s1.is_current and status1.speed_kmh == 0 else ("PASSING" if s1.is_current else "UPCOMING"))
                t2_status = "DEPARTED" if s2.has_departed else ("HALTED" if s2.is_current and status2.speed_kmh == 0 else ("PASSING" if s2.is_current else "UPCOMING"))

                t1_arr_min = parse_time_to_minutes(s1.scheduled_arrival or s1.scheduled_departure, s1.day_count) or 0
                t1_proj_min = t1_arr_min + s1.delay_arrival_min
                t1_expected = minutes_to_time_str(t1_proj_min) if t1_arr_min > 0 else (s1.scheduled_arrival or "--")

                t2_arr_min = parse_time_to_minutes(s2.scheduled_arrival or s2.scheduled_departure, s2.day_count) or 0
                t2_proj_min = t2_arr_min + s2.delay_arrival_min
                t2_expected = minutes_to_time_str(t2_proj_min) if t2_arr_min > 0 else (s2.scheduled_arrival or "--")

                gap_at_stop = abs(t1_proj_min - t2_proj_min)
                if t1_proj_min < t2_proj_min:
                    earlier_train = status1.train_number
                elif t2_proj_min < t1_proj_min:
                    earlier_train = status2.train_number
                else:
                    earlier_train = "TIE"

                h1 = 2
                if s1.scheduled_departure and s1.scheduled_arrival:
                    d1 = parse_time_to_minutes(s1.scheduled_departure, s1.day_count) or 0
                    a1 = parse_time_to_minutes(s1.scheduled_arrival, s1.day_count) or 0
                    h1 = max(1, d1 - a1)

                h2 = 2
                if s2.scheduled_departure and s2.scheduled_arrival:
                    d2 = parse_time_to_minutes(s2.scheduled_departure, s2.day_count) or 0
                    a2 = parse_time_to_minutes(s2.scheduled_arrival, s2.day_count) or 0
                    h2 = max(1, d2 - a2)

                milestones.append(
                    StationRaceMilestone(
                        station_code=s1.station_code,
                        station_name=s1.station_name,
                        train1_expected_time=t1_expected,
                        train1_delay_min=s1.delay_arrival_min,
                        train1_status=t1_status,
                        train1_halt_min=h1,
                        train2_expected_time=t2_expected,
                        train2_delay_min=s2.delay_arrival_min,
                        train2_status=t2_status,
                        train2_halt_min=h2,
                        earlier_train_number=earlier_train,
                        time_gap_at_station_min=gap_at_stop,
                        is_destination=(s1.station_code == dest_upper)
                    )
                )

                if s1.station_code == dest_upper:
                    break

        return LiveRaceComparison(
            race_id=race_id,
            destination_station_code=dest_station_code.upper(),
            destination_station_name=dest_meta.get("name", dest_station_code.upper()),
            destination_lat=dest_meta.get("lat"),
            destination_lng=dest_meta.get("lng"),
            status="ACTIVE",
            is_demo=(status1.is_simulated or status2.is_simulated),
            train1=perf1,
            train2=perf2,
            leader=leader_info,
            eta_gap_minutes=eta_gap,
            predicted_overtake=overtake_pred,
            signal_clash_risk=clash_risk,
            station_milestones=milestones,
            recent_lead_changes=lead_changes or [],
            history=history or [],
            last_updated=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            next_refresh_in_sec=next_refresh_sec,
            provider_health_status=provider_health_status
        )
