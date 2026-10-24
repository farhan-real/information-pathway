"""
Hop Evaluator: Evaluates transmission decisions across multi-channel edges.
Integrates directional crushes, archetypes, signed hierarchy, and tier vectors.
"""

import math
import numpy as np
from typing import Dict, Any


class HopEvaluator:
    def __init__(self, graph_manager, ml_models):
        self.gm = graph_manager
        self.ml = ml_models

    def evaluate(self, source_id: str, target_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        u = self.gm.graph.nodes[source_id]
        v = self.gm.graph.nodes[target_id]
        edge = self.gm.graph[source_id][target_id]
        flags = edge.get("flags", "")
        tags = payload.get("tags", [])
        sensitivity = float(payload.get("sensitivity", 0.5))
        virality = float(payload.get("virality", 0.5))
        verifiability = float(payload.get("verifiability", 0.5))
        valence = float(payload.get("valence", -0.2))

        # Directional Crush Check
        u_crushes = u.get("crushes", [])
        v_crushes = v.get("crushes", [])
        u_crushes_v = target_id in u_crushes
        v_crushes_u = source_id in v_crushes
        is_mutual_crush = u_crushes_v and v_crushes_u
        crush_motiv = 1.0 if (u_crushes_v or is_mutual_crush) else 0.0
        crush_recept = 1.0 if (v_crushes_u or is_mutual_crush) else 0.0

        is_romantic = any(t in ["romantic", "crush", "dating", "love"] for t in tags)
        if "--NoRelationship" in flags and is_romantic:
            return {"transmits": False, "reason": "Blocked by --NoRelationship flag"}

        if u_crushes_v or is_mutual_crush:
            virality = min(1.0, virality * 1.30)
            sensitivity = max(0.15, sensitivity * 0.70)

        # Archetype Modifiers
        u_types = [t.lower() for t in u.get("types", [])]
        v_types = [t.lower() for t in v.get("types", [])]
        archetype_p_mult = 1.0
        archetype_lat_mult = 1.0

        if "social" in u_types:
            archetype_p_mult *= 1.25
            archetype_lat_mult *= 0.75

        if "withdrawn" in u_types:
            archetype_p_mult *= 0.50
            archetype_lat_mult *= 1.80

        if "skeptic" in v_types and verifiability < 0.60:
            archetype_p_mult *= 0.40

        # Group Dynamics
        u_groups = u.get("groups", {})
        v_groups = v.get("groups", {})
        common_groups = set(u_groups.keys()).intersection(set(v_groups.keys()))
        is_same_group = 1.0 if common_groups else 0.0

        if common_groups:
            grp_id = list(common_groups)[0]
            grp_meta = self.gm.groups.get(grp_id, {})
            psych_safety = grp_meta.get("psych_safety", 0.70)
            in_group_affinity = grp_meta.get("density", 0.80)
            meeting_freq = grp_meta.get("meeting_freq_hrs", 12.0)
            speaker_loyalty = u_groups[grp_id].get("loyalty", 0.80)
            boundary_leak_penalty = 1.0
        else:
            primary_grp = list(u_groups.keys())[0] if u_groups else None
            grp_meta = self.gm.groups.get(primary_grp, {}) if primary_grp else {}
            psych_safety = 0.40
            in_group_affinity = 0.20
            meeting_freq = 36.0
            speaker_loyalty = u_groups[primary_grp].get("loyalty", 0.80) if primary_grp else 0.50
            porosity = grp_meta.get("porosity", 0.50)
            boundary_leak_penalty = (1.0 - speaker_loyalty) * porosity + 0.20 if sensitivity > 0.40 else 0.85

        # Hierarchy & Flags
        u_tier = u.get("hierarchy", 1)
        v_tier = v.get("hierarchy", 1)
        signed_hier = float(u_tier - v_tier)
        if "--FamilyTie" in flags:
            signed_hier = 0.0

        if "--StrictlyProfessional" in flags:
            if any(t in ["romantic", "crush", "dating", "personal"] for t in tags):
                return {"transmits": False, "reason": "Blocked by --StrictlyProfessional flag"}

        if "--GatekeeperFilter" in flags and verifiability < 0.65:
            return {"transmits": False, "reason": "Killed by --GatekeeperFilter (No proof)"}

        confidential_mult = 0.15 if ("--ConfidentialPact" in flags and sensitivity > 0.40) else 1.0
        rivalry_mult = 1.80 if ("--ActiveRivalry" in flags and valence < -0.20) else (0.30 if "--ActiveRivalry" in flags else 1.0)

        # Multi-Channel Evaluation
        channels = edge.get("channels", {})
        best_channel, min_lat, max_p, best_accuracy, best_retention = None, math.inf, 0.0, 1.0, 1.0
        personal_speeds = u.get("speed_vector", [4.0, 16.0, 48.0])
        personal_probs = u.get("prob_vector", [0.99, 0.70, 0.20])

        for ch_name, ch in channels.items():
            level_str = ch.get("level", "Good")
            tier_idx = {"Best": 0, "Good": 1, "Occasional": 2}.get(level_str, 1)
            tier_speed = personal_speeds[min(tier_idx, len(personal_speeds) - 1)]
            tier_prob = personal_probs[min(tier_idx, len(personal_probs) - 1)]

            if tier_speed == 0 or tier_prob == 0:
                continue

            trust_stod = 0.95 if "--FamilyTie" in flags else ch.get("trust_stod", 0.50)
            trust_dtos = 0.95 if "--FamilyTie" in flags else ch.get("trust_dtos", 0.50)
            contact_freq = ch.get("strength", 0.70)
            sched_overlap = ch.get("active_hours", 8.0) / 16.0

            # Speaker ML
            feat_share = np.array([[
                trust_stod, u["psychometrics"].get("extraversion", 0.5), u["psychometrics"].get("discretion", 0.5),
                sensitivity, virality, in_group_affinity, speaker_loyalty, signed_hier, crush_motiv,
                u["psychometrics"].get("bravery", 0.5)
            ]])
            p_share = self.ml.predict_share_probability(feat_share) * tier_prob * boundary_leak_penalty * confidential_mult * rivalry_mult * archetype_p_mult

            # Listener ML
            feat_adopt = np.array([[
                trust_dtos, v["psychometrics"].get("skepticism", 0.5), u["psychometrics"].get("accuracy", 0.8),
                verifiability, v["psychometrics"].get("conformity", 0.5), psych_safety, crush_recept
            ]])
            p_adopt = self.ml.predict_adoption_probability(feat_adopt)
            p_hop = p_share * p_adopt

            if "--FastTrack" in flags or "-f" in flags:
                p_hop = 1.0

            if p_hop < 0.10:
                continue

            # Latency ML
            feat_lat = np.array([[tier_speed, contact_freq, sched_overlap, virality, is_same_group, meeting_freq]])
            latency = self.ml.predict_latency(feat_lat) * archetype_lat_mult
            if u_crushes_v or is_mutual_crush:
                latency = max(0.2, latency * 0.60)
            if "--FastTrack" in flags or "-f" in flags:
                latency = 0.10

            if latency < min_lat:
                min_lat = latency
                max_p = p_hop
                best_channel = ch_name
                best_accuracy = u["psychometrics"].get("accuracy", 0.75) * (1.0 - (1.0 - verifiability) * 0.20)
                best_retention = u["psychometrics"].get("retention", 0.80) * (0.85 + 0.15 * contact_freq)

        if best_channel is None:
            return {"transmits": False}

        return {
            "transmits": True,
            "channel": best_channel,
            "latency_hours": round(min_lat, 2),
            "probability": round(min(1.0, max_p), 3),
            "fidelity": round(best_accuracy, 3),
            "retention": round(best_retention, 3),
            "is_crush_outreach": u_crushes_v or is_mutual_crush
        }