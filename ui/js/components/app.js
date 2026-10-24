import { store } from '../state/store.js';
import { TagService } from '../services/tag_service.js';
import { runForwardIPC, runReverseIPC, changeScenarioIPC, listScenariosIPC } from '../services/bridge.js';
import { initCanvas, drawNetwork } from '../canvas/network.js';
import { initToolbar } from './toolbar.js';
import { initInspector } from './inspector.js';
import { initTimeline } from './timeline.js';
import { initEditorModal } from './editor_modal.js';

let tagService;
let observedNodes = [];

export function displaySystemError(error) {
  const banner = document.getElementById('error-banner');
  const msgEl = document.getElementById('error-message');
  const traceBox = document.getElementById('error-trace-container');
  const tracePre = document.getElementById('error-trace');

  msgEl.textContent = error.message || String(error);
  if (error.traceback) {
    tracePre.textContent = error.traceback;
    traceBox.classList.remove('hidden');
  } else {
    traceBox.classList.add('hidden');
  }
  banner.classList.remove('hidden');
}

export function toggleObservedNode(nodeId) {
  const idx = observedNodes.findIndex(o => o.id === nodeId);
  if (idx >= 0) {
    observedNodes.splice(idx, 1);
  } else {
    observedNodes.push({ id: nodeId, time: 2.0, note: "Manually flagged observation" });
  }
  renderObservedDeck();
  triggerExecution().catch(displaySystemError);
}
window.toggleObservedNode = toggleObservedNode;

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('btn-dismiss-error').onclick = () => {
    document.getElementById('error-banner').classList.add('hidden');
  };

  window.addEventListener('error', (e) => displaySystemError(e.error || e.message));
  window.addEventListener('unhandledrejection', (e) => displaySystemError(e.reason));

  try {
    initCanvas((nodeId) => toggleObservedNode(nodeId));
    initInspector();
    initTimeline();

    tagService = new TagService('tag-pills-list', 'custom-tag-input', (selectedTopic) => {
      if (selectedTopic) {
        if (selectedTopic.sensitivity !== undefined) {
          document.getElementById('sensitivity-slider').value = selectedTopic.sensitivity;
          document.getElementById('val-sensitivity').textContent = selectedTopic.sensitivity.toFixed(2);
        }
        if (selectedTopic.virality !== undefined) {
          document.getElementById('virality-slider').value = selectedTopic.virality;
          document.getElementById('val-virality').textContent = selectedTopic.virality.toFixed(2);
        }
      }
      triggerExecution().catch(displaySystemError);
    });

    initToolbar(() => triggerExecution().catch(displaySystemError));

    initEditorModal(async (activatedScenarioId) => {
      try {
        await reloadScenarioDropdown(activatedScenarioId);
        const meta = await changeScenarioIPC(activatedScenarioId);
        applyScenarioMetadata(meta);
        await triggerExecution();
      } catch (err) {
        displaySystemError(err);
      }
    });

    await reloadScenarioDropdown();

    const btnForward = document.getElementById('btn-mode-forward');
    const btnReverse = document.getElementById('btn-mode-reverse');
    const unitThreshold = document.getElementById('unit-threshold');
    const btnExec = document.getElementById('btn-run-sim');
    const btnExecLabel = document.getElementById('btn-exec-label');
    const btnExecIcon = document.getElementById('btn-exec-icon');
    const chipPredicted = document.getElementById('chip-predicted');
    const observationBar = document.getElementById('inference-observation-deck');

    btnForward.onclick = () => {
      store.set('appMode', 'forward');
      btnForward.classList.add('active');
      btnReverse.classList.remove('active');
      unitThreshold.classList.add('dimmed');
      observationBar.classList.add('hidden');
      btnExec.classList.remove('reverse-mode');
      btnExecLabel.textContent = "Simulate Spread";
      btnExecIcon.textContent = "▶";
      chipPredicted.style.display = 'none';
      triggerExecution().catch(displaySystemError);
    };

    btnReverse.onclick = () => {
      store.set('appMode', 'reverse');
      btnReverse.classList.add('active');
      btnForward.classList.remove('active');
      unitThreshold.classList.remove('dimmed');
      observationBar.classList.remove('hidden');
      btnExec.classList.add('reverse-mode');
      btnExecLabel.textContent = "Infer Hidden Pathway";
      btnExecIcon.textContent = "⟲";
      chipPredicted.style.display = 'inline-flex';

      const incidentSelect = document.getElementById('incident-preset-select');
      if (observedNodes.length === 0 && incidentSelect && incidentSelect.options.length > 1) {
        incidentSelect.selectedIndex = 1;
        incidentSelect.dispatchEvent(new Event('change'));
      } else {
        renderObservedDeck();
        triggerExecution().catch(displaySystemError);
      }
    };

    unitThreshold.classList.add('dimmed');
    chipPredicted.style.display = 'none';

    const scenarioSelect = document.getElementById('scenario-select');
    scenarioSelect.addEventListener('change', async (e) => {
      try {
        const meta = await changeScenarioIPC(e.target.value);
        applyScenarioMetadata(meta);
        await triggerExecution();
      } catch (err) {
        displaySystemError(err);
      }
    });

    const targetSelect = document.getElementById('target-select');
    targetSelect.addEventListener('change', () => triggerExecution().catch(displaySystemError));

    const initialRes = await changeScenarioIPC(scenarioSelect.value);
    applyScenarioMetadata(initialRes);
    await triggerExecution();
  } catch (err) {
    displaySystemError(err);
  }
});

function applyScenarioMetadata(meta) {
  if (!meta) return;
  if (meta.nodes) updateNodeDropdowns(meta.nodes);
  if (meta.topics) tagService.loadScenarioTopics(meta.topics);
  if (meta.groups) store.set('currentGroups', meta.groups);
  if (meta.incidents) loadIncidentPresets(meta.incidents);
  observedNodes = [];
}

async function reloadScenarioDropdown(selectedId = null) {
  const scenarioSelect = document.getElementById('scenario-select');
  const scenarios = await listScenariosIPC();
  const current = selectedId || scenarioSelect.value || (scenarios[0] ? scenarios[0].id : "");

  scenarioSelect.innerHTML = scenarios.map(s =>
    `<option value="${s.id}" ${s.id === current ? 'selected' : ''}>${s.name}</option>`
  ).join("");
}

function updateNodeDropdowns(nodes) {
  const originSel = document.getElementById('origin-select');
  const targetSel = document.getElementById('target-select');
  const obsPersonSel = document.getElementById('obs-add-person-select');

  originSel.innerHTML = "";
  targetSel.innerHTML = '<option value="">Nobody (General)</option>';
  if (obsPersonSel) {
    obsPersonSel.innerHTML = '<option value="">+ Add Person Observed...</option>';
  }

  nodes.forEach((n, idx) => {
    originSel.innerHTML += `<option value="${n.id}" ${idx === 0 ? 'selected' : ''}>${n.name}</option>`;
    targetSel.innerHTML += `<option value="${n.id}">${n.name}</option>`;
    if (obsPersonSel) {
      obsPersonSel.innerHTML += `<option value="${n.id}">${n.name}</option>`;
    }
  });

  if (obsPersonSel) {
    obsPersonSel.onchange = (e) => {
      if (e.target.value) {
        toggleObservedNode(e.target.value);
        e.target.value = "";
      }
    };
  }
}

function loadIncidentPresets(incidents) {
  const select = document.getElementById('incident-preset-select');
  if (!select) return;
  select.innerHTML = '<option value="">Pick Incident Observation Preset...</option>';
  incidents.forEach(inc => {
    select.innerHTML += `<option value="${inc.id}">${inc.name}</option>`;
  });

  select.onchange = (e) => {
    const found = incidents.find(i => i.id === e.target.value);
    if (found && found.observed) {
      observedNodes = [...found.observed];
      renderObservedDeck();
      triggerExecution().catch(displaySystemError);
    }
  };
}

function renderObservedDeck() {
  const list = document.getElementById('observed-chips-list');
  if (!list) return;
  list.innerHTML = observedNodes.map(o => `
    <span class="observed-pill">
      <span>${o.id} (${o.time}h)</span>
      <button class="btn-remove-obs" data-id="${o.id}">✕</button>
    </span>
  `).join("") || `<span class="empty-obs-hint">Click nodes on graph or pick preset above to mark people who have information.</span>`;

  document.querySelectorAll('.btn-remove-obs').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      toggleObservedNode(btn.dataset.id);
    };
  });
}

async function triggerExecution() {
  const origin = document.getElementById('origin-select').value;
  if (!origin) return;

  const targetId = document.getElementById('target-select').value;
  const activeMode = store.get('appMode') || 'forward';
  const threshold = parseFloat(document.getElementById('threshold-slider').value);

  const activePreset = tagService.getActivePreset();
  const payload = {
    topic: activePreset ? activePreset.name : "General",
    tags: tagService.getActive(),
    valence: activePreset ? activePreset.valence : -0.3,
    sensitivity: parseFloat(document.getElementById('sensitivity-slider').value),
    virality: parseFloat(document.getElementById('virality-slider').value),
    verifiability: parseFloat(document.getElementById('verifiability-slider').value),
    initial_fidelity: 1.0
  };

  let result = null;
  if (activeMode === 'forward') {
    result = await runForwardIPC(origin, payload, targetId);
  } else {
    result = await runReverseIPC(origin, payload, threshold, targetId, observedNodes);
  }

  if (!result) return;

  store.set('graphData', result);
  store.set('transmissions', result.transmissions || []);
  store.set('currentGroups', result.groups || {});
  store.set('maxTime', 36.0);

  drawNetwork(result, origin);

  const nodes = result.elements.nodes;
  const reached = nodes.filter(n => n.data.informed).length;
  const avgAccuracy = nodes.filter(n => n.data.informed).reduce((a, n) => a + n.data.fidelity, 0) / (reached || 1);

  document.getElementById('stat-reached').textContent = `${reached} / ${nodes.length}`;
  document.getElementById('hud-stat2-lbl').textContent = activeMode === 'forward' ? 'Active Mode' : 'Hidden Leaks';
  document.getElementById('stat-links').textContent = activeMode === 'forward' ? 'Forward' : `${(result.predicted_links || []).length} Deduced`;
  document.getElementById('stat-fidelity').textContent = `${(avgAccuracy * 100).toFixed(0)}%`;

  store.set('currentTime', 0.0);
}