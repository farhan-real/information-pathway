import json
import traceback
import webview
from engine import SimulationService


class AppBridge:
    def __init__(self):
        self.service = SimulationService()

    def _handle_error(self, err: Exception) -> str:
        return json.dumps({
            "error": f"{type(err).__name__}: {str(err)}",
            "traceback": traceback.format_exc()
        })

    def list_scenarios(self):
        try:
            return json.dumps(self.service.list_scenarios())
        except Exception as e:
            return self._handle_error(e)

    def change_scenario(self, scenario_id: str):
        try:
            meta = self.service.change_scenario(scenario_id)
            return json.dumps(meta)
        except Exception as e:
            return self._handle_error(e)

    def get_scenario_details(self, scenario_id: str):
        try:
            meta = self.service.get_scenario_metadata(scenario_id)
            return json.dumps(meta)
        except Exception as e:
            return self._handle_error(e)

    def create_scenario(self, scenario_json: str):
        try:
            data = json.loads(scenario_json)
            self.service.create_scenario(data["id"], data["name"], data.get("description", ""))
            return self.list_scenarios()
        except Exception as e:
            return self._handle_error(e)

    def delete_scenario(self, scenario_id: str):
        try:
            self.service.delete_scenario(scenario_id)
            return self.list_scenarios()
        except Exception as e:
            return self._handle_error(e)

    def run_forward(self, origin_id: str, payload_json: str, target_id: str = ""):
        try:
            payload = json.loads(payload_json)
            result = self.service.run_forward(origin_id, payload, target_id=target_id)
            return json.dumps(result)
        except Exception as e:
            return self._handle_error(e)

    def run_reverse(self, origin_id: str, payload_json: str, link_threshold: float = 0.45, target_id: str = "", observed_json: str = "[]"):
        try:
            payload = json.loads(payload_json)
            observed_nodes = json.loads(observed_json) if observed_json else []
            result = self.service.run_reverse(origin_id, payload, float(link_threshold), target_id=target_id, observed_nodes=observed_nodes)
            return json.dumps(result)
        except Exception as e:
            return self._handle_error(e)

    def export_config(self):
        try:
            return self.service.export_full_config()
        except Exception as e:
            return self._handle_error(e)

    def import_config(self, json_str: str):
        try:
            self.service.import_full_config(json_str)
            meta = self.service.get_scenario_metadata()
            return json.dumps(meta)
        except Exception as e:
            return self._handle_error(e)

    def add_person(self, person_json: str):
        try:
            person = json.loads(person_json)
            self.service.add_custom_person(person)
            meta = self.service.get_scenario_metadata()
            return json.dumps(meta)
        except Exception as e:
            return self._handle_error(e)

    def delete_person(self, person_id: str):
        try:
            self.service.delete_person(person_id)
            meta = self.service.get_scenario_metadata()
            return json.dumps(meta)
        except Exception as e:
            return self._handle_error(e)

    def add_connection(self, conn_json: str):
        try:
            conn = json.loads(conn_json)
            self.service.add_custom_connection(conn)
            meta = self.service.get_scenario_metadata()
            return json.dumps(meta)
        except Exception as e:
            return self._handle_error(e)

    def delete_connection(self, source_id: str, target_id: str):
        try:
            self.service.delete_connection(source_id, target_id)
            meta = self.service.get_scenario_metadata()
            return json.dumps(meta)
        except Exception as e:
            return self._handle_error(e)


if __name__ == "__main__":
    bridge = AppBridge()

    window = webview.create_window(
        title="Information Pathway",
        url="ui/index.html",
        js_api=bridge,
        width=1440,
        height=940,
        min_size=(1080, 700)
    )

    webview.start(debug=False)