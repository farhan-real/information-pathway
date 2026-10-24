import networkx as nx
from typing import Dict, Any, Optional, List
from engine.core.types import Psychometrics, GroupMembership, GroupGlobalStats


class NetworkGraphManager:
    def __init__(self):
        self.graph = nx.DiGraph()
        self.groups: Dict[str, GroupGlobalStats] = {}

    def add_group(self, group_id: str, name: str, density: float, psych_safety: float,
                  porosity: float, meeting_freq_hrs: float = 24.0, physical_space: bool = True):
        self.groups[group_id] = {
            "name": name,
            "density": float(density),
            "psych_safety": float(psych_safety),
            "porosity": float(porosity),
            "meeting_freq_hrs": float(meeting_freq_hrs),
            "physical_space": bool(physical_space)
        }

    def add_person(self, person_id: str, name: str, psychometrics: Psychometrics,
                   schedule: Dict[str, Any], group_memberships: Optional[Dict[str, GroupMembership]] = None,
                   gender: str = "Neutral", age: int = 22, types: Optional[List[str]] = None,
                   crushes: Optional[List[str]] = None, speed_vector: Optional[List[float]] = None,
                   prob_vector: Optional[List[float]] = None):
        self.graph.add_node(
            person_id,
            name=name,
            psychometrics=psychometrics,
            schedule=schedule,
            groups=group_memberships or {},
            hierarchy=schedule.get("tier", 1),
            gender=gender,
            age=age,
            types=types or [],
            crushes=crushes or [],
            speed_vector=speed_vector or [4.0, 16.0, 48.0],
            prob_vector=prob_vector or [0.99, 0.70, 0.20]
        )

    def add_connection(self, source_id: str, target_id: str, channels: Dict[str, Dict[str, Any]], flags: str = ""):
        self.graph.add_edge(source_id, target_id, channels=channels, flags=flags, is_inferred=False)