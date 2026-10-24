"""
Reverse Cascade Tomography Link Predictor:
Evaluates user-specified observed informed nodes to deduce suspected origins,
unrecorded direct crush reach-outs, and shared-space environmental overhearing.
"""

from typing import List, Dict, Any


class LinkPredictor:
    def __init__(self, graph_manager):
        self.gm = graph_manager

    def infer_from_observed_nodes(self, observed_list: List[Dict[str, Any]], threshold: float = 0.45) -> Dict[str, Any]:
        graph = self.gm.graph
        if not observed_list:
            return {"suspected_origin": None, "predicted_links": [], "observed_nodes": {}}

        observed_map = {}
        for item in observed_list:
            nid = item.get("id")
            if nid in graph.nodes:
                t = float(item.get("time", 2.0))
                observed_map[nid] = {
                    "node_id": nid,
                    "name": graph.nodes[nid]["name"],
                    "arrival_time": t,
                    "note": item.get("note", "Observed with information")
                }

        sorted_observed = sorted(observed_map.values(), key=lambda x: x["arrival_time"])
        if not sorted_observed:
            return {"suspected_origin": None, "predicted_links": [], "observed_nodes": {}}

        earliest = sorted_observed[0]
        suspected_origin = earliest["node_id"]
        predicted_links = []

        for rec in sorted_observed:
            rec_id = rec["node_id"]
            rec_t = rec["arrival_time"]
            rec_name = rec["name"]
            rec_groups = set(graph.nodes[rec_id].get("groups", {}).keys())

            known_preds = [p for p in graph.predecessors(rec_id) if p in observed_map and observed_map[p]["arrival_time"] < rec_t]

            candidates = []
            for send_id, sdata in graph.nodes(data=True):
                if send_id == rec_id or graph.has_edge(send_id, rec_id):
                    continue

                send_t = observed_map[send_id]["arrival_time"] if send_id in observed_map else 0.0
                if send_t >= rec_t:
                    continue

                delta_t = rec_t - send_t
                send_groups = set(sdata.get("groups", {}).keys())
                shared_groups = send_groups.intersection(rec_groups)
                is_crush = rec_id in sdata.get("crushes", []) or send_id in graph.nodes[rec_id].get("crushes", [])

                time_score = max(0.1, 1.0 - (delta_t / 14.0))
                space_bonus = 0.40 if shared_groups else 0.0
                crush_bonus = 0.50 if is_crush else 0.0
                talkative_bonus = sdata.get("psychometrics", {}).get("extraversion", 0.5) * 0.15

                prob = (time_score * 0.35) + space_bonus + crush_bonus + talkative_bonus
                if len(known_preds) == 0:
                    prob += 0.20

                prob = min(1.0, max(0.1, prob))
                if prob >= threshold:
                    candidates.append({
                        "source": send_id, "target": rec_id,
                        "source_name": sdata["name"], "target_name": rec_name,
                        "probability": round(prob, 3), "delta_t": delta_t,
                        "is_crush": is_crush, "shared_groups": list(shared_groups),
                        "rec_t": rec_t
                    })

            if candidates and len(known_preds) == 0:
                candidates.sort(key=lambda c: c["probability"], reverse=True)
                best = candidates[0]

                if best["is_crush"]:
                    reason = f"Romantic outreach: Hidden attraction prompted {best['source_name']} to reach out directly to {best['target_name']} at {best['rec_t']}h."
                elif best["shared_groups"]:
                    grp_name = self.gm.groups.get(best["shared_groups"][0], {}).get("name", "shared circle")
                    reason = f"Environmental overhearing: {best['target_name']} was co-located in {grp_name} when {best['source_name']} discussed the news ({best['rec_t']}h)."
                else:
                    reason = f"Unexplained reception: {best['target_name']} learned of info at {best['rec_t']}h with no recorded friendship lines."

                predicted_links.append({
                    "source": best["source"], "target": best["target"],
                    "source_name": best["source_name"], "target_name": best["target_name"],
                    "probability": best["probability"], "reason_text": reason
                })

        return {
            "suspected_origin": suspected_origin,
            "predicted_links": predicted_links,
            "observed_nodes": observed_map
        }