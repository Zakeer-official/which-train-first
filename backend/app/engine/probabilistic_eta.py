import math
from typing import Dict, Any, List, Optional, Tuple
from app.schemas.train import TrainStopSchema

class ProbabilisticETAEngine:
    """
    Advanced Probabilistic Railway ETA Engine.
    Incorporates:
    - Train Type Priority Hierarchy (Rajdhani/Vande Bharat > Superfast > Express > Passenger)
    - Slack Time Recovery (Superfast trains can recover up to 10-15% delay on clear sections)
    - Delay Propagation Dynamics (Delays > 30 min tend to compound due to signal clearance loss)
    - P10 (optimistic), P50 (median / most likely), P90 (pessimistic) arrival distributions
    """

    # Priority weighting for track clearance
    TRAIN_PRIORITY: Dict[str, float] = {
        "VANDE_BHARAT": 1.25,
        "RAJDHANI": 1.20,
        "SHATABDI": 1.15,
        "SUPERFAST": 1.05,
        "MAIL_EXPRESS": 1.00,
        "PASSENGER": 0.85
    }

    @classmethod
    def calculate_probabilistic_arrival(
        cls,
        base_eta_minutes: int,
        current_delay_min: int,
        remaining_distance_km: float,
        train_type: str = "SUPERFAST",
        remaining_stops_count: int = 5
    ) -> Dict[str, Any]:
        """
        Calculates P10, P50, P90 confidence intervals for arrival minutes.
        """
        priority_factor = cls.TRAIN_PRIORITY.get(train_type.upper(), 1.0)
        
        # Uncertainty variance grows with distance and number of upcoming halts
        variance_factor = math.sqrt(max(10.0, remaining_distance_km)) * 0.4 + (remaining_stops_count * 1.2)

        # Potential delay recovery (slack time in Indian Railway timetables)
        # Higher priority trains have higher section recovery margins
        max_recovery_min = min(current_delay_min, int(remaining_distance_km * 0.04 * (priority_factor - 0.7)))

        # Potential compound delay (if train is stuck in non-priority section)
        compounding_risk_min = int((current_delay_min / 15.0) * (2.0 - priority_factor) * 3.5)

        # P50 (Median forecast)
        p50_minutes = base_eta_minutes - int(max_recovery_min * 0.4) + int(compounding_risk_min * 0.3)
        
        # P10 (Optimistic: green corridor, full speed, minimal halt times)
        p10_minutes = max(base_eta_minutes - max_recovery_min, int(p50_minutes - variance_factor))
        
        # P90 (Pessimistic: loop-line waiting, signal clearance delays)
        p90_minutes = int(p50_minutes + variance_factor * 1.5 + compounding_risk_min)

        return {
            "p10_minutes": p10_minutes,
            "p50_minutes": p50_minutes,
            "p90_minutes": p90_minutes,
            "slack_recovery_potential_min": max_recovery_min,
            "compounding_risk_min": compounding_risk_min,
            "priority_tier": "HIGH_PRIORITY" if priority_factor > 1.1 else ("STANDARD" if priority_factor >= 1.0 else "LOW_PRIORITY")
        }
