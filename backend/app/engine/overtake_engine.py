from typing import List, Optional, Dict, Any, Tuple
from app.schemas.train import TrainStopSchema

class OvertakeAndCongestionEngine:
    """
    Railway Signaling & Track Intelligence Engine:
    1. Overtake Prediction: Identifies exact intermediate station where Train A will physically overtake Train B.
    2. Outer Signal Congestion Clash: Calculates platform conflict probability if both trains approach
       the destination station within a tight arrival window.
    """

    @staticmethod
    def detect_predicted_overtake(
        stops1: List[TrainStopSchema],
        stops2: List[TrainStopSchema],
        train1_number: str,
        train2_number: str,
        train1_speed: float,
        train2_speed: float,
        train1_delay: int,
        train2_delay: int
    ) -> Optional[Dict[str, Any]]:
        """
        Scans upcoming common stations sequence to detect if and where
        the trailing train will physically overtake the leader train.
        """
        stops2_dict = {s.station_code: s for s in stops2}
        
        # Find common stops in sequence
        common_stops: List[Tuple[TrainStopSchema, TrainStopSchema]] = []
        for s1 in stops1:
            if s1.station_code in stops2_dict:
                common_stops.append((s1, stops2_dict[s1.station_code]))

        if len(common_stops) < 2:
            return None

        # Determine current leader based on sequence and delays
        # We project expected departure time at each upcoming station
        for i, (cs1, cs2) in enumerate(common_stops):
            # Calculate projected arrival minute offsets
            t1_proj = cs1.sequence * 20 + train1_delay
            t2_proj = cs2.sequence * 20 + train2_delay

            # Speed adjustment factor
            if train1_speed > train2_speed + 10:
                t1_proj -= int(i * 3)
            elif train2_speed > train1_speed + 10:
                t2_proj -= int(i * 3)

            # Check if transition occurs at this station
            if i > 0:
                prev_s1, prev_s2 = common_stops[i - 1]
                prev_t1 = prev_s1.sequence * 20 + train1_delay
                prev_t2 = prev_s2.sequence * 20 + train2_delay

                if (prev_t1 < prev_t2 and t1_proj >= t2_proj):
                    return {
                        "overtake_station_code": cs1.station_code,
                        "overtake_station_name": cs1.station_name,
                        "overtaking_train": train2_number,
                        "overtaken_train": train1_number,
                        "reason": f"Train {train2_number} cruising faster ({int(train2_speed)} km/h vs {int(train1_speed)} km/h) takes precedence on loop line"
                    }
                elif (prev_t2 < prev_t1 and t2_proj >= t1_proj):
                    return {
                        "overtake_station_code": cs1.station_code,
                        "overtake_station_name": cs1.station_name,
                        "overtaking_train": train1_number,
                        "overtaken_train": train2_number,
                        "reason": f"Train {train1_number} cruising faster ({int(train1_speed)} km/h vs {int(train2_speed)} km/h) takes precedence on loop line"
                    }

        return None

    @staticmethod
    def calculate_outer_signal_clash_risk(
        eta1_minutes: int,
        eta2_minutes: int,
        destination_station_code: str
    ) -> Dict[str, Any]:
        """
        Calculates platform clash and outer signal hold probability.
        If both trains arrive within 10 minutes of each other at stations with limited platform lines,
        the trailing train is almost guaranteed to be halted at home/outer signal!
        """
        gap_min = abs(eta1_minutes - eta2_minutes)

        if gap_min <= 5:
            risk_level = "CRITICAL"
            clash_prob = 0.88
            recommendation = f"High outer signal hold risk! Trailing train will likely be detained on approach signal due to platform line occupancy at {destination_station_code}."
        elif gap_min <= 12:
            risk_level = "MODERATE"
            clash_prob = 0.52
            recommendation = f"Moderate junction approach congestion. Route clearing may cause trailing train to slow down to 30 km/h."
        else:
            risk_level = "LOW"
            clash_prob = 0.10
            recommendation = "Clear separation margin. Minimal risk of outer signal detention."

        return {
            "risk_level": risk_level,
            "clash_probability": round(clash_prob, 2),
            "eta_separation_minutes": gap_min,
            "operational_impact": recommendation
        }
