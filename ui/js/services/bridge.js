/**
 * PyWebView IPC Bridge.
 */

function ensureBridgeReady() {
  return new Promise((resolve, reject) => {
    if (window.pywebview && window.pywebview.api) {
      resolve();
      return;
    }
    const onReady = () => {
      window.removeEventListener('pywebviewready', onReady);
      resolve();
    };
    window.addEventListener('pywebviewready', onReady);

    setTimeout(() => {
      if (!window.pywebview?.api) {
        reject(new Error("Desktop application bridge connection timed out."));
      }
    }, 1200);
  });
}

function parseResponse(raw) {
  if (typeof raw !== 'string') {
    throw new Error(`Unexpected response format from engine: ${raw}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON payload: ${err.message}\nRaw data: ${raw}`);
  }
  if (parsed && parsed.error) {
    const err = new Error(parsed.error);
    err.traceback = parsed.traceback || "No traceback provided.";
    throw err;
  }
  return parsed;
}

export async function listScenariosIPC() {
  await ensureBridgeReady();
  const raw = await window.pywebview.api.list_scenarios();
  return parseResponse(raw);
}

export async function changeScenarioIPC(scenarioId) {
  await ensureBridgeReady();
  const raw = await window.pywebview.api.change_scenario(scenarioId);
  return parseResponse(raw);
}

export async function getScenarioDetailsIPC(scenarioId) {
  await ensureBridgeReady();
  const raw = await window.pywebview.api.get_scenario_details(scenarioId);
  return parseResponse(raw);
}

export async function createScenarioIPC(scenarioData) {
  await ensureBridgeReady();
  const raw = await window.pywebview.api.create_scenario(JSON.stringify(scenarioData));
  return parseResponse(raw);
}

export async function deleteScenarioIPC(scenarioId) {
  await ensureBridgeReady();
  const raw = await window.pywebview.api.delete_scenario(scenarioId);
  return parseResponse(raw);
}

export async function deletePersonIPC(personId) {
  await ensureBridgeReady();
  const raw = await window.pywebview.api.delete_person(personId);
  return parseResponse(raw);
}

export async function deleteConnectionIPC(sourceId, targetId) {
  await ensureBridgeReady();
  const raw = await window.pywebview.api.delete_connection(sourceId, targetId);
  return parseResponse(raw);
}

export async function runForwardIPC(originId, payload, targetId = "") {
  await ensureBridgeReady();
  const raw = await window.pywebview.api.run_forward(originId, JSON.stringify(payload), targetId || "");
  return parseResponse(raw);
}

export async function runReverseIPC(originId, payload, linkThreshold, targetId = "", observedNodes = []) {
  await ensureBridgeReady();
  const raw = await window.pywebview.api.run_reverse(
    originId, JSON.stringify(payload), parseFloat(linkThreshold), targetId || "", JSON.stringify(observedNodes)
  );
  return parseResponse(raw);
}