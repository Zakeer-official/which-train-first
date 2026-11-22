import pytest
from app.engine.probabilistic_eta import ProbabilisticETAEngine
from app.engine.overtake_engine import OvertakeAndCongestionEngine
from app.schemas.train import TrainStopSchema

def test_probabilistic_arrival_bounds():
    stats = ProbabilisticETAEngine.calculate_probabilistic_arrival(
        base_eta_minutes=150,
        current_delay_min=20,
        remaining_distance_km=120.0,
        train_type="SUPERFAST",
        remaining_stops_count=4
    )
    assert stats["p10_minutes"] <= stats["p50_minutes"]
    assert stats["p50_minutes"] <= stats["p90_minutes"]
    assert stats["slack_recovery_potential_min"] >= 0
    assert stats["priority_tier"] in ["HIGH_PRIORITY", "STANDARD", "LOW_PRIORITY"]

def test_outer_signal_clash_risk_critical():
    # If both trains arrive 3 minutes apart at destination
    clash = OvertakeAndCongestionEngine.calculate_outer_signal_clash_risk(
        eta1_minutes=120,
        eta2_minutes=123,
        destination_station_code="MABD"
    )
    assert clash["risk_level"] == "CRITICAL"
    assert clash["clash_probability"] >= 0.80
    assert "outer signal" in clash["operational_impact"].lower()

def test_outer_signal_clash_risk_low():
    # If trains are 30 minutes apart
    clash = OvertakeAndCongestionEngine.calculate_outer_signal_clash_risk(
        eta1_minutes=120,
        eta2_minutes=150,
        destination_station_code="MABD"
    )
    assert clash["risk_level"] == "LOW"
    assert clash["clash_probability"] <= 0.20

def test_overtake_prediction():
    stops1 = [
        TrainStopSchema(sequence=1, station_code="KZJ", station_name="Kazipet", distance_km=0.0, day_count=1),
        TrainStopSchema(sequence=2, station_code="WL", station_name="Warangal", distance_km=10.0, day_count=1),
        TrainStopSchema(sequence=3, station_code="MABD", station_name="Mahbubabad", distance_km=70.0, day_count=1),
    ]
    stops2 = [
        TrainStopSchema(sequence=1, station_code="KZJ", station_name="Kazipet", distance_km=0.0, day_count=1),
        TrainStopSchema(sequence=2, station_code="WL", station_name="Warangal", distance_km=10.0, day_count=1),
        TrainStopSchema(sequence=3, station_code="MABD", station_name="Mahbubabad", distance_km=70.0, day_count=1),
    ]

    # Train 2 is lagging behind at KZJ with high delay, but cruising at 110 km/h vs Train 1 at 45 km/h
    overtake = OvertakeAndCongestionEngine.detect_predicted_overtake(
        stops1=stops1,
        stops2=stops2,
        train1_number="12656",
        train2_number="12705",
        train1_speed=45.0,
        train2_speed=110.0,
        train1_delay=30,
        train2_delay=32
    )
    # Detection should execute without errors
    assert overtake is None or "overtake_station_code" in overtake
