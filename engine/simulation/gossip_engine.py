"""
Gossip Engine: Social bias, crush advocacy, rival schadenfreude,
and protective filtering dynamics.
"""

from typing import Tuple, List


class GossipEngine:
    def __init__(self, graph_manager):
        self.gm = graph_manager

    def calculate_gossip_bias(self, speaker_id: str, subject_id: str, valence: float, tags: List[str]) -> Tuple[float, str]:
        if not subject_id or speaker_id == subject_id:
            return 1.0, "Standard transmission"

        graph = self.gm.graph
        if not graph.has_node(speaker_id) or not graph.has_node(subject_id):
            return 1.0, "Standard transmission"

        speaker = graph.nodes[speaker_id]
        is_crush = subject_id in speaker.get("crushes", [])

        # 1. Subject is Speaker's Crush
        if is_crush:
            if valence < -0.2:
                return 0.05, "Suppressed (Protective defense of crush)"
            elif any(t in ["romantic", "crush", "dating"] for t in tags):
                return 2.0, "Obsessive transmission (Topic involves crush)"
            else:
                return 1.5, "Promoted (Affectionate advocacy for crush)"

        # 2. Check Graph Relationship
        edge_data = graph.get_edge_data(speaker_id, subject_id)
        affinity = 0.0
        if edge_data:
            flags = edge_data.get("flags", "")
            if "--ActiveRivalry" in flags:
                affinity = -0.8
            else:
                channels = edge_data.get("channels", {})
                first_ch = list(channels.values())[0] if channels else {}
                affinity = (first_ch.get("trust_stod", 0.5) * 2.0) - 1.0

        if valence < -0.2 and affinity > 0.4:
            return 0.15, "Suppressed (Protective gatekeeping for ally)"

        if valence < -0.2 and affinity < -0.3:
            spite_boost = 1.0 + abs(affinity) * 0.9
            return spite_boost, "Accelerated (Schadenfreude toward rival)"

        if valence > 0.2 and affinity > 0.3:
            return 1.4, "Promoted (Supportive advocacy for ally)"

        return 1.0, "Standard transmission"