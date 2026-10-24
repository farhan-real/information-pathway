import {
  listScenariosIPC,
  changeScenarioIPC,
  createScenarioIPC,
  deleteScenarioIPC,
  deletePersonIPC,
  deleteConnectionIPC
} from '../services/bridge.js';

export function initEditorModal(onNetworkChanged) {
  const modal = document.getElementById('editor-modal');
  const btnOpen = document.getElementById('btn-open-editor');
  const btnClose = document.getElementById('btn-close-editor');
  const tabs = document.querySelectorAll('.studio-tab');
  const panes = document.querySelectorAll('.studio-pane');

  btnOpen.onclick = async () => {
    await refreshStudioData();
    modal.classList.remove('hidden');
  };
  btnClose.onclick = () => modal.classList.add('hidden');

  tabs.forEach(tab => {
    tab.onclick = () => {
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    };
  });

  syncSlider('studio-p-ext', 'val-p-ext');
  syncSlider('studio-p-disc', 'val-p-disc');
  syncSlider('studio-p-skep', 'val-p-skep');
  syncSlider('studio-p-conf', 'val-p-conf');
  syncSlider('studio-conn-strength', 'val-c-freq');
  syncSlider('studio-conn-trust-s', 'val-c-trust-s');
  syncSlider('studio-conn-trust-d', 'val-c-trust-d');

  document.getElementById('btn-create-scenario').onclick = async () => {
    const id = document.getElementById('new-scenario-id').value.trim();
    const name = document.getElementById('new-scenario-name').value.trim();
    const desc = document.getElementById('new-scenario-desc').value.trim();
    if (!id || !name) return alert("Please enter both an ID and Name.");

    await createScenarioIPC({ id, name, description: desc });
    document.getElementById('new-scenario-id').value = "";
    document.getElementById('new-scenario-name').value = "";
    document.getElementById('new-scenario-desc').value = "";
    await refreshStudioData();
    if (onNetworkChanged) onNetworkChanged(id);
  };

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
      schedule: { tier: 1 },
      groups: {}
    };

    if (window.pywebview?.api) {
      await window.pywebview.api.add_person(JSON.stringify(person));
      document.getElementById('studio-person-id').value = "";
      document.getElementById('studio-person-name').value = "";
      await refreshStudioData();
      if (onNetworkChanged) onNetworkChanged();
    }
  };

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
      channels: {
        [chName]: { strength, level: "Best", trust_stod: trustS, trust_dtos: trustD, active_hours: 8 }
      },
      flags
    };

    if (window.pywebview?.api) {
      await window.pywebview.api.add_connection(JSON.stringify(conn));
      await refreshStudioData();
      if (onNetworkChanged) onNetworkChanged();
    }
  };

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
    alert("Network JSON copied to clipboard!");
  };

  document.getElementById('btn-studio-import-json').onclick = async () => {
    const jsonStr = document.getElementById('studio-io-area').value.trim();
    if (!jsonStr) return alert("Please paste valid network JSON first.");

    if (window.pywebview?.api) {
      try {
        await window.pywebview.api.import_config(jsonStr);
        await refreshStudioData();
        modal.classList.add('hidden');
        if (onNetworkChanged) onNetworkChanged();
      } catch (err) {
        alert("Failed to import network JSON: " + err);
      }
    }
  };
}

async function refreshStudioData() {
  const currentScenarioId = document.getElementById('scenario-select').value;
  const meta = await changeScenarioIPC(currentScenarioId);

  // 1. Scenarios List
  const scenarios = await listScenariosIPC();
  const scenariosList = document.getElementById('studio-scenarios-list');
  document.getElementById('badge-scenario-count').textContent = scenarios.length;

  scenariosList.innerHTML = scenarios.map(s => `
    <div class="entity-item-card ${s.id === currentScenarioId ? 'current' : ''}">
      <div class="entity-info" style="cursor: pointer;" onclick="document.getElementById('scenario-select').value='${s.id}'; document.getElementById('scenario-select').dispatchEvent(new Event('change'));">
        <span class="entity-title">${s.name}</span>
        <span class="entity-sub">${s.nodes_count} nodes • ${s.edges_count} links</span>
      </div>
      <div class="entity-actions">
        ${s.id !== currentScenarioId ? `<button class="btn-studio-action select-sc" data-id="${s.id}" title="Activate">Select</button>` : '<span class="badge active-badge">Active</span>'}
        ${scenarios.length > 1 ? `<button class="btn-studio-action delete del-sc" data-id="${s.id}" title="Delete">✕</button>` : ''}
      </div>
    </div>
  `).join("");

  document.querySelectorAll('.select-sc').forEach(btn => {
    btn.onclick = async () => {
      document.getElementById('scenario-select').value = btn.dataset.id;
      document.getElementById('scenario-select').dispatchEvent(new Event('change'));
      await refreshStudioData();
    };
  });

  document.querySelectorAll('.del-sc').forEach(btn => {
    btn.onclick = async () => {
      if (confirm(`Delete scenario "${btn.dataset.id}"?`)) {
        await deleteScenarioIPC(btn.dataset.id);
        document.getElementById('scenario-select').dispatchEvent(new Event('change'));
        await refreshStudioData();
      }
    };
  });

  // 2. People List
  const people = meta.nodes || [];
  const peopleList = document.getElementById('studio-people-list');
  document.getElementById('badge-people-count').textContent = people.length;

  peopleList.innerHTML = people.map(p => `
    <div class="entity-item-card">
      <div class="entity-info">
        <span class="entity-title">${p.name}</span>
        <span class="entity-sub">ID: ${p.id}</span>
      </div>
      <button class="btn-studio-action delete del-p" data-id="${p.id}" title="Delete Person">✕</button>
    </div>
  `).join("");

  document.querySelectorAll('.del-p').forEach(btn => {
    btn.onclick = async () => {
      if (confirm(`Delete ${btn.dataset.id} from network?`)) {
        await deletePersonIPC(btn.dataset.id);
        await refreshStudioData();
      }
    };
  });

  // 3. Connections List
  const connections = meta.edges || [];
  const connList = document.getElementById('studio-conn-list');
  document.getElementById('badge-conn-count').textContent = connections.length;

  connList.innerHTML = connections.map(c => `
    <div class="entity-item-card">
      <div class="entity-info">
        <span class="entity-title">${c.source} → ${c.target}</span>
        <span class="entity-sub">Channel: ${Object.keys(c.channels)[0] || 'Direct'}</span>
      </div>
      <button class="btn-studio-action delete del-conn" data-u="${c.source}" data-v="${c.target}" title="Delete Connection">✕</button>
    </div>
  `).join("") || `<div style="color:#64748b; font-size:11px; padding:12px;">No connections in this scenario.</div>`;

  document.querySelectorAll('.del-conn').forEach(btn => {
    btn.onclick = async () => {
      await deleteConnectionIPC(btn.dataset.u, btn.dataset.v);
      await refreshStudioData();
    };
  });

  // Dropdowns for connection modal
  const fromSel = document.getElementById('studio-conn-from');
  const toSel = document.getElementById('studio-conn-to');
  fromSel.innerHTML = people.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
  toSel.innerHTML = people.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
}

function syncSlider(sliderId, labelId) {
  const s = document.getElementById(sliderId);
  const l = document.getElementById(labelId);
  s.oninput = (e) => {
    l.textContent = parseFloat(e.target.value).toFixed(2);
  };
}