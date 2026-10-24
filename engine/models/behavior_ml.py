"""
Behavioral ML Engine: Calibrated classical machine learning models for
speaker transmission, listener adoption, and latency.
"""

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import Ridge


class BehavioralMLModels:
    def __init__(self):
        # 1. SPEAKER TRANSMISSION MODEL
        # Features: [Trust_StoD, Extr_S, Disc_S, Sens, Viral, Affinity, Loyalty_S, SignedHier, CrushMotiv, Bravery]
        self.clf_share = RandomForestClassifier(n_estimators=45, max_depth=6, random_state=42)

        # 2. LISTENER ADOPTION MODEL
        # Features: [Trust_DtoS, Skep_L, Speaker_Acc, Verif, Conf_L, PsychSafety, CrushRecept]
        self.clf_adopt = RandomForestClassifier(n_estimators=35, max_depth=5, random_state=42)

        # 3. LATENCY REGRESSOR (Hours)
        # Features: [BaseSpeedHrs, ContactFreq, SchedOverlap, Virality, IsSameGroup, MeetingFreq]
        self.reg_latency = Ridge(alpha=1.0)

        self._train_models()

    def _train_models(self):
        # Speaker Transmission Data
        X_share = np.array([
            [0.85, 0.80, 0.30, 0.30, 0.90, 0.85, 0.70,  0.0, 0.0, 0.50],
            [0.30, 0.40, 0.85, 0.90, 0.30, 0.20, 0.80,  0.0, 0.0, 0.40],
            [0.70, 0.60, 0.70, 0.50, 0.60, 0.80, 0.85,  2.0, 0.0, 0.60],
            [0.50, 0.50, 0.75, 0.80, 0.40, 0.50, 0.60, -2.0, 0.0, 0.30],
            [0.65, 0.90, 0.20, 0.60, 0.85, 0.10, 0.20,  0.0, 0.0, 0.50],
            [0.65, 0.60, 0.60, 0.70, 0.60, 0.10, 0.95,  0.0, 0.0, 0.40],
            [0.75, 0.85, 0.30, 0.95, 0.95, 0.40, 0.30, -2.0, 0.0, 0.90],
            [0.20, 0.40, 0.60, 0.70, 0.30, 0.10, 0.50,  0.0, 0.0, 0.30],
            [0.60, 0.75, 0.45, 0.40, 0.80, 0.20, 0.40,  0.0, 1.0, 0.80],
            [0.40, 0.50, 0.50, 0.80, 0.90, 0.10, 0.30,  0.0, 1.0, 0.70],
            [0.80, 0.50, 0.50, 0.10, 0.40, 0.90, 0.80,  1.0, 0.0, 0.50],
            [0.90, 0.85, 0.35, 0.40, 0.80, 0.90, 0.75,  0.0, 0.0, 0.60]
        ])
        y_share = np.array([1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1])
        self.clf_share.fit(X_share, y_share)

        # Listener Adoption Data
        X_adopt = np.array([
            [0.90, 0.50, 0.85, 0.90, 0.50, 0.80, 0.0],
            [0.40, 0.90, 0.40, 0.15, 0.20, 0.40, 0.0],
            [0.65, 0.40, 0.60, 0.30, 0.90, 0.85, 0.0],
            [0.60, 0.95, 0.70, 0.25, 0.15, 0.50, 0.0],
            [0.35, 0.75, 0.50, 0.35, 0.40, 0.20, 0.0],
            [0.85, 0.60, 0.90, 0.85, 0.60, 0.70, 0.0],
            [0.60, 0.60, 0.75, 0.50, 0.60, 0.60, 1.0],
            [0.25, 0.80, 0.50, 0.20, 0.30, 0.30, 0.0]
        ])
        y_adopt = np.array([1, 0, 1, 0, 0, 1, 1, 0])
        self.clf_adopt.fit(X_adopt, y_adopt)

        # Latency Data
        X_lat = np.array([
            [4.0,  0.95, 0.85, 0.90, 1.0,  6.0],
            [48.0, 0.30, 0.15, 0.30, 0.0, 48.0],
            [2.0,  0.90, 0.75, 0.85, 1.0, 12.0],
            [16.0, 0.60, 0.40, 0.50, 0.0, 24.0],
            [6.0,  0.85, 0.70, 0.70, 1.0,  8.0]
        ])
        y_lat = np.array([1.2, 48.0, 0.5, 16.0, 2.5])
        self.reg_latency.fit(X_lat, y_lat)

    def predict_share_probability(self, features: np.ndarray) -> float:
        return float(self.clf_share.predict_proba(features)[0][1])

    def predict_adoption_probability(self, features: np.ndarray) -> float:
        return float(self.clf_adopt.predict_proba(features)[0][1])

    def predict_latency(self, features: np.ndarray) -> float:
        return max(0.1, float(self.reg_latency.predict(features)[0]))