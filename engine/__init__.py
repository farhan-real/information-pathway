from typing import Optional, List, Dict, Any, Set
import json
from engine.core.graph import NetworkGraphManager
from engine.models.behavior_ml import BehavioralMLModels
from engine.models.link_predictor import LinkPredictor
from engine.simulation.hop_evaluator import HopEvaluator
from engine.simulation.diffusion import NetworkDiffusionSimulator
from engine.simulation.gossip_engine import GossipEngine
from engine.data.scenarios import GLOBAL_SCENARIO_STORE


class SimulationService:
    def __init__(self):
        self.gm = NetworkGraphManager()
        self.ml = BehavioralMLModels()
        self.predictor = LinkPredictor(self.gm)
        self.evaluator = HopEvaluator(self.gm, self.ml)
        self.simulator = NetworkDiffusionSimulator(self.gm, self.evaluator)
        self.gossip = GossipEngine(self.gm)
        self.store = GLOBAL_SCENARIO_STORE

        self.current_scenario_id = "corporate"
        self.store.load_into_graph(self.gm, self.current_scenario_id)

    def list_scenarios(self) -> List[Dict[str, Any]]:
        return self.store.list_all()

    def get_scenario_metadata(self, scenario_id: Optional[str] = None) -> Dict[str, Any]:
        sid = scenario_id or self.current_scenario_id
        sc = self.store.get(sid)
        return {
            "id": sc["id"], "name": sc["name"], "description": sc["description"],
            "topics": sc.get("topics", []), "incidents": sc.get("incidents", []),
            "groups": self.gm.groups,
            "nodes": [{"id": nid, "name": d["name"]} for nid, d in self.gm.graph.nodes(data=True)],
            "edges": [{"source": u, "target": v, "channels": d.get("channels", {})} for u, v, d in self.gm.graph.edges(data=True)]
        }

    def change_scenario(self, scenario_id: str) -> Dict[str, Any]:
        self.current_scenario_id = scenario_id
        self.store.load_into_graph(self.gm, scenario_id)
        return self.get_scenario_metadata(scenario_id)

    def create_scenario(self, scenario_id: str, name: str, description: str) -> Dict[str, Any]:
        sc = self.store.create(scenario_id, name, description)
        self.change_scenario(scenario_id)
        return sc

    def delete_scenario(self, scenario_id: str) -> bool:
        if self.store.delete(scenario_id):
            first_id = list(self.store.scenarios.keys())[0]
            self.change_scenario(first_id)
            return True
        return False

    def add_custom_person(self, person_data: dict):
        self.store.add_node(self.current_scenario_id, person_data)
        self.gm.add_person(
            person_id=person_data["id"], name=person_data["name"],
            psychometrics=person_data.get("psychometrics", {}),
            schedule=person_data.get("schedule", {"tier": 1}),
            group_memberships=person_data.get("groups", {}),
            gender=person_data.get("gender", "Neutral"),
            age=int(person_data.get("age", 22)),
            types=person_data.get("types", []),
            crushes=person_data.get("crushes", []),
            speed_vector=person_data.get("speed_vector", [4.0, 16.0, 48.0]),
            prob_vector=person_data.get("prob_vector", [0.99, 0.70, 0.20])
        )

    def delete_person(self, person_id: str) -> bool:
        self.store.remove_node(self.current_scenario_id, person_id)
        if self.gm.graph.has_node(person_id):
            self.gm.graph.remove_node(person_id)
            return True
        return False

    def add_custom_connection(self, conn_data: dict):
        self.store.add_edge(self.current_scenario_id, conn_data)
        self.gm.add_connection(
            source_id=conn_data["source"], target_id=conn_data["target"],
            channels=conn_data.get("channels", {}), flags=conn_data.get("flags", "")
        )

    def delete_connection(self, source_id: str, target_id: str) -> bool:
        self.store.remove_edge(self.current_scenario_id, source_id, target_id)
        if self.gm.graph.has_edge(source_id, target_id):
            self.gm.graph.remove_edge(source_id, target_id)
            return True
        return False

    def export_full_config(self) -> str:
        sc = self.store.get(self.current_scenario_id)
        return json.dumps(sc, indent=2)

    def import_full_config(self, json_str: str):
        data = json.loads(json_str)
        sid = data.get("id", "imported_scenario")
        self.store.scenarios[sid] = data
        self.change_scenario(sid)

    def _format_elements(
        self,
        nodes_state: Dict[str, Any],
        predicted_links: Optional[List[Dict[str, Any]]] = None,
        observed_ids: Optional[Set[str]] = None
    ) -> Dict[str, Any]:
        predicted_links = predicted_links or []
        obs_set = observed_ids or set()
        nodes = []

        for nid, data in self.gm.graph.nodes(data=True):
            st = nodes_state.get(nid, {})
            friends = []
            for neighbor in self.gm.graph.successors(nid):
                if neighbor == nid:
                    continue
                edata = self.gm.graph[nid][neighbor]
                friends.append({
                    "id": neighbor, "name": self.gm.graph.nodes[neighbor]["name"],
                    "channels": edata.get("channels", {}), "is_predicted": False,
                    "flags": edata.get("flags", "")
                })

            for pl in predicted_links:
                if pl["source"] == nid:
                    friends.append({
                        "id": pl["target"], "name": pl["target_name"],
                        "channels": {"Deduced Leak": {"strength": pl["probability"], "level": "Occasional", "trust_stod": pl["probability"] * 0.7, "trust_dtos": pl["probability"] * 0.7}},
                        "is_predicted": True, "prediction_reason": pl["reason_text"], "flags": "--Predicted"
                    })

            is_informed = st.get("informed", False) or (nid in obs_set)
            nodes.append({
                "data": {
                    "id": nid, "label": data["name"],
                    "gender": data.get("gender", "Neutral"), "age": data.get("age", 22),
                    "types": data.get("types", []), "crushes": data.get("crushes", []),
                    "informed": is_informed, "is_observed": nid in obs_set,
                    "arrival_time": st.get("arrival_time"),
                    "probability": st.get("belief_probability", 1.0 if nid in obs_set else 0.0),
                    "fidelity": st.get("fidelity", 1.0 if nid in obs_set else 0.0),
                    "exposure_count": st.get("exposure_count", 1 if nid in obs_set else 0),
                    "heard_from": st.get("heard_from", []),
                    "psychometrics": data.get("psychometrics", {}), "groups": list(data.get("groups", {}).keys()),
                    "group_details": data.get("groups", {}), "friends": friends
                }
            })

        edges = []
        for u, v, edata in self.gm.graph.edges(data=True):
            edges.append({
                "data": {
                    "id": f"{u}->{v}", "source": u, "target": v,
                    "source_name": self.gm.graph.nodes[u]["name"], "target_name": self.gm.graph.nodes[v]["name"],
                    "channel": list(edata.get("channels", {}).keys())[0] if edata.get("channels") else "Direct",
                    "channels": edata.get("channels", {}), "is_predicted": False, "flags": edata.get("flags", "")
                }
            })

        for pl in predicted_links:
            edges.append({
                "data": {
                    "id": f"pred_{pl['source']}->{pl['target']}", "source": pl["source"], "target": pl["target"],
                    "source_name": pl["source_name"], "target_name": pl["target_name"], "channel": "Deduced Leak",
                    "channels": {"Deduced Leak": {"strength": pl["probability"], "level": "Occasional", "trust_stod": pl["probability"] * 0.7, "trust_dtos": pl["probability"] * 0.7}},
                    "is_predicted": True, "prediction_reason": pl["reason_text"], "flags": "--Predicted"
                }
            })

        return {"nodes": nodes, "edges": edges}

    def run_forward(self, origin_id: str, payload: dict, target_id: str = "") -> Dict[str, Any]:
        sim = self.simulator.run(origin_id, payload)
        elements = self._format_elements(sim["nodes"])
        meta = self.get_scenario_metadata()
        return {
            "mode": "forward", "elements": elements, "transmissions": sim["transmissions"],
            "groups": self.gm.groups, "topics": meta["topics"], "incidents": meta["incidents"],
            "available_nodes": meta["nodes"]
        }

    def run_reverse(
        self,
        origin_id: str,
        payload: dict,
        link_threshold: float = 0.45,
        target_id: str = "",
        observed_nodes: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        observed_list = observed_nodes or []
        res = self.predictor.infer_from_observed_nodes(observed_list, threshold=link_threshold)
        observed_map = res.get("observed_nodes", {})
        observed_ids = set(observed_map.keys())

        nodes_state = {}
        for nid, obs in observed_map.items():
            nodes_state[nid] = {
                "informed": True, "arrival_time": obs["arrival_time"],
                "belief_probability": 0.95, "fidelity": 0.90, "exposure_count": 1,
                "heard_from": [{"from_name": "Observed Investigation", "time": obs["arrival_time"], "channel": "Observation", "motive": obs["note"]}]
            }

        predicted_links = res.get("predicted_links", [])
        elements = self._format_elements(nodes_state, predicted_links, observed_ids)
        meta = self.get_scenario_metadata()
        return {
            "mode": "reverse", "elements": elements, "predicted_links": predicted_links,
            "suspected_origin": res.get("suspected_origin"), "groups": self.gm.groups,
            "topics": meta["topics"], "incidents": meta["incidents"], "available_nodes": meta["nodes"]
        }