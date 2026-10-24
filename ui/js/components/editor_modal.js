import {
  listScenariosIPC,
  changeScenarioIPC,
  createScenarioIPC,
  deleteScenarioIPC,
  deletePersonIPC,
  deleteConnectionIPC,
  getScenarioDetailsIPC
} from '../services/bridge.js';

let inspectedScenarioId = null;

export function initEditorModal(onNetworkChanged) {
  const modal = document.getElementById('editor-modal');
  const btnOpen = document.getElementById('btn-open-editor');
  const btnClose = document.getElementById('btn-close-editor');
  const innerTabs = document.querySelectorAll('.inner-tab');
  const innerPanes = document.querySelectorAll('.workspace-pane');
  const btnNewSc = document.getElementById('btn-new-scenario-mode');
  const btnCancelCreate = document.getElementById('btn-cancel-create-sc');

  btnOpen.onclick = async () => {
    inspectedScenarioId = document.getElementById('scenario-select').value;
    await refreshStudioView();
    modal.classList.remove('hidden');
  };
  btnClose.onclick = () => modal.classList.add('hidden');

  // Inner Sub-Tab Switching (Contained inside this scenario)
  innerTabs.forEach(tab => {
    tab.onclick = () => {
      innerTabs.forEach(t => t.classList.remove('active'));
      innerPanes.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const targetPane = document.getElementById(tab.dataset.tab);
      if (targetPane) targetPane.classList.add('active');
    };
  });

  // Switch between Scenario Workspace and Create Scenario Panel
  btnNewSc.onclick = () => {
    document.getElementById('scenario-workspace').classList.add('hidden');
    document.getElementById('create-scenario-panel').classList.remove('hidden');
  };
  btnCancelCreate.onclick = () => {
    document.getElementById('create-scenario-panel').classList.add('hidden');
    document.getElementById('scenario-workspace').classList.remove('hidden');
  };

  syncSlider('studio-p-ext', 'val-p-ext');
  syncSlider('studio-p-disc', 'val-p-disc');
  syncSlider('studio-p-skep', 'val-p-skep');
  syncSlider('studio-p-conf', 'val-p-conf');
  syncSlider('studio-conn-strength', 'val-c-freq');
  syncSlider('studio-conn-trust-s', 'val-c-trust-s');
  syncSlider('studio-conn-trust-d', 'val-c-trust-d');

  // Activate Scenario from Studio into Main Canvas
  document.getElementById('btn-activate-scenario').onclick = async () => {
    if (inspectedScenarioId) {
      document.getElementById('scenario-select').value = inspectedScenarioId;
      document.getElementById('scenario-select').dispatchEvent(new Event('change'));
      await refreshStudioView();
      if (onNetworkChanged) onNetworkChanged(inspectedScenarioId);
    }
  };

  // Create Scenario
  document.getElementById('btn-create-scenario').onclick = async () => {
    const id = document.getElementById('new-scenario-id').value.trim();
    const name = document.getElementById('new-scenario-name').value.trim();
    const desc = document.getElementById('new-scenario-desc').value.trim();
    if (!id || !name) return alert("Please enter both an ID and Name.");

    await createScenarioIPC({ id, name, description: desc });
    inspectedScenarioId = id;
    document.getElementById('new-scenario-id').value = "";
    document.getElementById('new-scenario-name').value = "";
    document.getElementById('new-scenario-desc').value = "";

    document.getElementById('create-scenario-panel').classList.add('hidden');
    document.getElementById('scenario-workspace').classList.remove('hidden');
    await refreshStudioView();
    if (onNetworkChanged) onNetworkChanged(id);
  };

  // Add Person to THIS Scenario
  document.getElementById('btn-studio-save-person').onclick = async () => {
    const id = document.getElementById('studio-person-id').value.trim();
    const name = document.getElementById('studio-person-name').value.trim();
    const gender = document.getElementById('studio-person-gender').value;
    const age = parseInt(document.getElementById('studio-person-age').value) || 22;
    const types = document.getElementById('studio-person-types').value.split(',').map(t => t.trim()).filter(Boolean);
    const crushes = document.getElementById('studio-person-crush').value.split(',').map(c => c.trim()).filter(Boolean);

    if (!id || !name) return alert("Please enter both an ID and Name.");

    const person = {
      id, name, gender, age, types, crushes,
      psychometrics: {
        extraversion: parseFloat(document.getElementById('studio-p-ext').value),
        discretion: parseFloat(document.getElementById('studio-p-disc').value),
        skepticism: parseFloat(document.getElementById('studio-p-skep').value),
        accuracy: 0.85, retention: 0.85,
        conformity: parseFloat(document.getElementById('studio-p-conf').value)
      },
      schedule: { tier: 1 }, groups: {}
    };

    if (window.pywebview?.api) {
      await window.pywebview.api.add_person(JSON.stringify(person));
      document.getElementById('studio-person-id').value = "";
      document.getElementById('studio-person-name').value = "";
      await refreshStudioView();
      if (onNetworkChanged) onNetworkChanged(inspectedScenarioId);
    }
  };

  // Add Connection to THIS Scenario
  document.getElementById('btn-studio-save-conn').onclick = async () => {
    const source = document.getElementById('studio-conn-from').value;
    const target = document.getElementById('studio-conn-to').value;
    if (source === target) return alert("Source and Target cannot be the same person.");

    const chName = document.getElementById('studio-conn-ch').value.trim() || "InPerson";
    const strength = parseFloat(document.getElementById('studio-conn-strength').value);
    const trustS = parseFloat(document.getElementById('studio-conn-trust-s').value);
    const trustD = parseFloat(document.getElementById('studio-conn-trust-d').value);
    const flags = document.getElementById('studio-conn-flags').value.trim();

    const conn = {
      source, target,
      channels: { [chName]: { strength, level: "Best", trust_stod: trustS, trust_dtos: trustD, active_hours: 8 } },
      flags
    };

    if (window.pywebview?.api) {
      await window.pywebview.api.add_connection(JSON.stringify(conn));
      await refreshStudioView();
      if (onNetworkChanged) onNetworkChanged(inspectedScenarioId);
    }
  };

  // JSON Management
  document.getElementById('btn-studio-export-json').onclick = async () => {
    if (window.pywebview?.api) {
      const jsonStr = await window.pywebview.api.export_config();
      document.getElementById('studio-io-area').value = jsonStr;
    }
  };
  document.getElementById('btn-studio-copy-json').onclick = () => {
    const area = document.getElementById('studio-io-area');
    area.select();
    navigator.clipboard.writeText(area.value);
    alert("Scenario JSON copied to clipboard!");
  };
  document.getElementById('btn-studio-import-json').onclick = async () => {
    const jsonStr = document.getElementById('studio-io-area').value.trim();
    if (!jsonStr) return alert("Please paste valid scenario JSON first.");
    if (window.pywebview?.api) {
      await window.pywebview.api.import_config(jsonStr);
      await refreshStudioView();
      if (onNetworkChanged) onNetworkChanged();
    }
  };
}

async function refreshStudioView() {
  const activeScenarioId = document.getElementById('scenario-select').value;
  if (!inspectedScenarioId) inspectedScenarioId = activeScenarioId;

  // 1. Render Scenarios Sidebar
  const scenarios = await listScenariosIPC();
  const scenariosList = document.getElementById('studio-scenarios-list');
  scenariosList.innerHTML = scenarios.map(s => {
    const isInspected = s.id === inspectedScenarioId;
    const isLive = s.id === activeScenarioId;
    return `
      <div class="scenario-nav-card ${isInspected ? 'active-card' : ''}" data-id="${s.id}">
        <span class="scenario-nav-title">${s.name} ${isLive ? '<span style="color:#60a5fa; font-size:9px;">(Live)</span>' : ''}</span>
        <span class="scenario-nav-sub">${s.nodes_count} people · ${s.edges_count} links</span>
      </div>
    `;
  }).join("");

  document.querySelectorAll('.scenario-nav-card').forEach(card => {
    card.onclick = async () => {
      inspectedScenarioId = card.dataset.id;
      document.getElementById('create-scenario-panel').classList.add('hidden');
      document.getElementById('scenario-workspace').classList.remove('hidden');
      await refreshStudioView();
    };
  });

  // 2. Fetch Inspected Scenario's Metadata
  const meta = await getScenarioDetailsIPC(inspectedScenarioId);
  document.getElementById('current-scenario-title').textContent = meta.name;
  document.getElementById('current-scenario-desc').textContent = meta.description || "Scenario configuration and members.";

  const btnActivate = document.getElementById('btn-activate-scenario');
  if (inspectedScenarioId === activeScenarioId) {
    btnActivate.textContent = "Loaded in Canvas";
    btnActivate.style.opacity = "0.6";
  } else {
    btnActivate.textContent = "Load into Canvas";
    btnActivate.style.opacity = "1.0";
  }

  // 3. Render People Inside This Scenario
  const people = meta.nodes || [];
  document.getElementById('badge-people-count').textContent = people.length;
  document.getElementById('studio-people-list').innerHTML = people.map(p => `
    <div class="entity-item-card">
      <div class="entity-info"><span class="entity-title">${p.name}</span><span class="entity-sub">ID: ${p.id}</span></div>
      <button class="btn-studio-action delete del-p" data-id="${p.id}" title="Delete">✕</button>
    </div>
  `).join("") || `<div style="color:#64748b; font-size:10px; padding:10px;">No people in this scenario.</div>`;

  document.querySelectorAll('.del-p').forEach(btn => {
    btn.onclick = async () => {
      await deletePersonIPC(btn.dataset.id);
      await refreshStudioView();
    };
  });

  // 4. Render Connections Inside This Scenario
  const connections = meta.edges || [];
  document.getElementById('badge-conn-count').textContent = connections.length;
  document.getElementById('studio-conn-list').innerHTML = connections.map(c => `
    <div class="entity-item-card">
      <div class="entity-info"><span class="entity-title">${c.source} → ${c.target}</span><span class="entity-sub">Via: ${Object.keys(c.channels || {})[0] || 'Direct'}</span></div>
      <button class="btn-studio-action delete del-conn" data-u="${c.source}" data-v="${c.target}" title="Delete">✕</button>
    </div>
  `).join("") || `<div style="color:#64748b; font-size:10px; padding:10px;">No connections in this scenario.</div>`;

  document.querySelectorAll('.del-conn').forEach(btn => {
    btn.onclick = async () => {
      await deleteConnectionIPC(btn.dataset.u, btn.dataset.v);
      await refreshStudioView();
    };
  });

  // Dropdowns for connection form
  const fromSel = document.getElementById('studio-conn-from');
  const toSel = document.getElementById('studio-conn-to');
  fromSel.innerHTML = people.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
  toSel.innerHTML = people.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
}

function syncSlider(sliderId, labelId) {
  const s = document.getElementById(sliderId), l = document.getElementById(labelId);
  s.oninput = (e) => { l.textContent = parseFloat(e.target.value).toFixed(2); };
}