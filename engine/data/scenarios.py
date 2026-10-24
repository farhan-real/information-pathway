"""
Scenario Store: Dynamic manager for isolated scenarios.
Ensures people, connections, and incidents are strictly isolated per scenario.
"""

from typing import Dict, List, Any
from engine.data.presets import get_corporate_preset, get_highschool_preset


class ScenarioStore:
    def __init__(self):
        self.scenarios: Dict[str, Dict[str, Any]] = {}
        self._init_defaults()

    def _init_defaults(self):
        corp = get_corporate_preset()
        self.scenarios[corp["id"]] = corp
        hs = get_highschool_preset()
        self.scenarios[hs["id"]] = hs

    def list_all(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": s["id"],
                "name": s["name"],
                "description": s["description"],
                "nodes_count": len(s["nodes"]),
                "edges_count": len(s["edges"]),
                "topics": s.get("topics", []),
                "incidents": s.get("incidents", [])
            }
            for s in self.scenarios.values()
        ]

    def get(self, scenario_id: str) -> Dict[str, Any]:
        if scenario_id not in self.scenarios:
            raise KeyError(f"Scenario '{scenario_id}' was not found.")
        return self.scenarios[scenario_id]

    def create(self, scenario_id: str, name: str, description: str) -> Dict[str, Any]:
        if scenario_id in self.scenarios:
            raise ValueError(f"Scenario '{scenario_id}' already exists.")
        sc = {
            "id": scenario_id,
            "name": name,
            "description": description,
            "topics": [
                {"id": "general", "name": "General Update", "valence": 0.0, "sensitivity": 0.4, "virality": 0.7, "tags": ["general"]}
            ],
            "incidents": [],
            "groups": {},
            "nodes": [],
            "edges": []
        }
        self.scenarios[scenario_id] = sc
        return sc

    def delete(self, scenario_id: str) -> bool:
        if scenario_id not in self.scenarios:
            raise KeyError(f"Scenario '{scenario_id}' does not exist.")
        if len(self.scenarios) <= 1:
            raise ValueError("Cannot delete the only remaining scenario.")
        del self.scenarios[scenario_id]
        return True

    def add_node(self, scenario_id: str, person_data: Dict[str, Any]):
        sc = self.get(scenario_id)
        sc["nodes"] = [n for n in sc["nodes"] if n["id"] != person_data["id"]]
        sc["nodes"].append(person_data)

    def remove_node(self, scenario_id: str, person_id: str):
        sc = self.get(scenario_id)
        sc["nodes"] = [n for n in sc["nodes"] if n["id"] != person_id]
        sc["edges"] = [e for e in sc["edges"] if e["source"] != person_id and e["target"] != person_id]

    def add_edge(self, scenario_id: str, edge_data: Dict[str, Any]):
        sc = self.get(scenario_id)
        u, v = edge_data["source"], edge_data["target"]
        sc["edges"] = [e for e in sc["edges"] if not (e["source"] == u and e["target"] == v)]
        sc["edges"].append(edge_data)

    def remove_edge(self, scenario_id: str, source_id: str, target_id: str):
        sc = self.get(scenario_id)
        sc["edges"] = [e for e in sc["edges"] if not (e["source"] == source_id and e["target"] == target_id)]

    def load_into_graph(self, gm, scenario_id: str):
        sc = self.get(scenario_id)
        gm.graph.clear()
        gm.groups.clear()

        for gid, gdata in sc.get("groups", {}).items():
            gm.add_group(
                gid, gdata["name"], gdata["density"], gdata["psych_safety"],
                gdata["porosity"], gdata.get("meeting_freq_hrs", 24.0),
                gdata.get("physical_space", True)
            )

        for n in sc.get("nodes", []):
            gm.add_person(
                person_id=n["id"], name=n["name"], psychometrics=n.get("psychometrics", {}),
                schedule=n.get("schedule", {}), group_memberships=n.get("groups", {}),
                gender=n.get("gender", "Neutral"), age=n.get("age", 22),
                types=n.get("types", []), crushes=n.get("crushes", []),
                speed_vector=n.get("speed_vector", [4.0, 16.0, 48.0]),
                prob_vector=n.get("prob_vector", [0.99, 0.70, 0.20])
            )

        for e in sc.get("edges", []):
            gm.add_connection(e["source"], e["target"], e.get("channels", {}), flags=e.get("flags", ""))


GLOBAL_SCENARIO_STORE = ScenarioStore()