"""
Discrete-Event Network Diffusion Simulator: Propagates information through
confirmed links, direct crush outreach, and shared space environmental overhearing.
"""

import heapq
from typing import Dict, Any


class NetworkDiffusionSimulator:
    def __init__(self, graph_manager, hop_evaluator):
        self.gm = graph_manager
        self.evaluator = hop_evaluator

    def run(self, origin_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        graph = self.gm.graph
        nodes_state = {
            nid: {
                "node_id": nid,
                "name": graph.nodes[nid]["name"],
                "informed": False,
                "arrival_time": None,
                "belief_probability": 0.0,
                "fidelity": 0.0,
                "exposure_count": 0,
                "heard_from": []
            }
            for nid in graph.nodes
        }

        # Initialize Originator
        nodes_state[origin_id]["informed"] = True
        nodes_state[origin_id]["arrival_time"] = 0.0
        nodes_state[origin_id]["belief_probability"] = 1.0
        nodes_state[origin_id]["fidelity"] = payload.get("initial_fidelity", 1.0)
        nodes_state[origin_id]["exposure_count"] = 1

        pq = []
        self._enqueue_node_transmissions(origin_id, 0.0, 1.0, 1.0, payload, pq, nodes_state)

        edge_transmissions = []
        max_horizon = 72.0

        while pq:
            t, sender, receiver, fid, prob, ch, motive = heapq.heappop(pq)
            if t > max_horizon or sender == receiver:
                continue

            rec = nodes_state[receiver]
            sender_name = graph.nodes[sender]["name"]
            receiver_name = graph.nodes[receiver]["name"]
            conformity = graph.nodes[receiver]["psychometrics"].get("conformity", 0.5)

            edge_transmissions.append({
                "source": sender, "source_name": sender_name,
                "target": receiver, "target_name": receiver_name,
                "time": round(t, 2), "channel": ch,
                "fidelity": round(fid, 3), "probability": round(prob, 3),
                "motive": motive
            })

            reception = {
                "from_id": sender, "from_name": sender_name,
                "time": round(t, 2), "channel": ch,
                "fidelity": round(fid, 3), "motive": motive
            }

            if not rec["informed"]:
                rec["informed"] = True
                rec["arrival_time"] = round(t, 2)
                rec["belief_probability"] = round(prob, 3)
                rec["fidelity"] = round(fid, 3)
                rec["exposure_count"] = 1
                rec["heard_from"].append(reception)

                self._enqueue_node_transmissions(receiver, t, fid, prob, payload, pq, nodes_state)
            else:
                rec["exposure_count"] += 1
                rec["heard_from"].append(reception)
                boost = 1.0 - (1.0 - rec["belief_probability"]) * (1.0 - (prob * (0.4 + 0.6 * conformity)))
                rec["belief_probability"] = round(min(1.0, boost), 3)

        return {"origin": origin_id, "nodes": nodes_state, "transmissions": edge_transmissions}

    def _enqueue_node_transmissions(self, sender, current_t, sender_fid, sender_prob, payload, pq, nodes_state):
        graph = self.gm.graph
        sender_data = graph.nodes[sender]
        sender_crushes = sender_data.get("crushes", [])
        virality = float(payload.get("virality", 0.5))
        extraversion = sender_data.get("psychometrics", {}).get("extraversion", 0.5)
        discretion = sender_data.get("psychometrics", {}).get("discretion", 0.5)

        # 1. Confirmed Direct Graph Hops
        for nbr in graph.successors(sender):
            if nbr == sender:
                continue
            hop = self.evaluator.evaluate(sender, nbr, payload)
            if hop.get("transmits"):
                motive = "Direct crush reach-out" if hop.get("is_crush_outreach") else "Standard friendship sharing"
                heapq.heappush(pq, (
                    current_t + hop["latency_hours"], sender, nbr,
                    sender_fid * hop["fidelity"], sender_prob * hop["probability"],
                    hop["channel"], motive
                ))

        # 2. Direct Crush Reach-Out (Across Network Boundaries)
        for crush_id in sender_crushes:
            if crush_id in graph.nodes and not graph.has_edge(sender, crush_id):
                crush_delay = max(0.5, 4.0 * (1.0 - virality))
                heapq.heappush(pq, (
                    current_t + crush_delay, sender, crush_id,
                    sender_fid * 0.95, sender_prob * 0.88,
                    "Private DM / Crush Outreach",
                    f"Spontaneous direct outreach to crush ({graph.nodes[crush_id]['name']})"
                ))

        # 3. Environmental Overhearing in Shared Physical Spaces
        sender_groups = sender_data.get("groups", {})
        if extraversion >= 0.55 or discretion <= 0.45 or virality >= 0.70:
            for gid in sender_groups.keys():
                grp_info = self.gm.groups.get(gid, {})
                if not grp_info.get("physical_space", True):
                    continue

                for candidate_id, cdata in graph.nodes(data=True):
                    if candidate_id == sender or graph.has_edge(sender, candidate_id):
                        continue
                    if gid in cdata.get("groups", {}):
                        c_types = cdata.get("types", [])
                        overhear_delay = 0.3 if "Observer" in c_types else 0.8
                        heapq.heappush(pq, (
                            current_t + overhear_delay, sender, candidate_id,
                            sender_fid * 0.88, sender_prob * 0.75,
                            f"Overheard in {grp_info['name']}",
                            f"Overheard discussion in shared physical space ({grp_info['name']})"
                        ))