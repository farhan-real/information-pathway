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
let currentScenarioData = null;
let editingPersonId = null;
let editingConnIndex = null;

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
    resetPersonForm();
    resetConnectionForm();
    await refreshStudioView();
    modal.classList.remove('hidden');
  };
  btnClose.onclick = () => modal.classList.add('hidden');

  innerTabs.forEach(tab => {
    tab.onclick = () => {
      innerTabs.forEach(t => t.classList.remove('active'));
      innerPanes.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const targetPane = document.getElementById(tab.dataset.tab);
      if (targetPane) targetPane.classList.add('active');
    };
  });

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

  document.getElementById('btn-activate-scenario').onclick = async () => {
    if (inspectedScenarioId) {
      document.getElementById('scenario-select').value = inspectedScenarioId;
      document.getElementById('scenario-select').dispatchEvent(new Event('change'));
      await refreshStudioView();
      if (onNetworkChanged) onNetworkChanged(inspectedScenarioId);
    }
  };

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

  // Add or Edit Person
  document.getElementById('btn-studio-save-person').onclick = async () => {
    const idInput = document.getElementById('studio-person-id');
    const id = idInput.value.trim();
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
      resetPersonForm();
      await refreshStudioView();
      if (onNetworkChanged) onNetworkChanged(inspectedScenarioId);
    }
  };

  document.getElementById('btn-cancel-person-edit').onclick = resetPersonForm;

  // Add or Edit Connection
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
      resetConnectionForm();
      await refreshStudioView();
      if (onNetworkChanged) onNetworkChanged(inspectedScenarioId);
    }
  };

  document.getElementById('btn-cancel-conn-edit').onclick = resetConnectionForm;

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

function selectPersonForEditing(person) {
  editingPersonId = person.id;
  const idInput = document.getElementById('studio-person-id');
  idInput.value = person.id;
  idInput.disabled = true;
  document.getElementById('studio-person-name').value = person.name || "";
  document.getElementById('studio-person-gender').value = person.gender || "Female";
  document.getElementById('studio-person-age').value = person.age || 22;
  document.getElementById('studio-person-types').value = (person.types || []).join(", ");
  document.getElementById('studio-person-crush').value = (person.crushes || []).join(", ");

  const psych = person.psychometrics || {};
  setSlider('studio-p-ext', 'val-p-ext', psych.extraversion ?? 0.75);
  setSlider('studio-p-disc', 'val-p-disc', psych.discretion ?? 0.50);
  setSlider('studio-p-skep', 'val-p-skep', psych.skepticism ?? 0.70);
  setSlider('studio-p-conf', 'val-p-conf', psych.conformity ?? 0.60);

  document.getElementById('people-form-title').textContent = `Editing: ${person.name}`;
  document.getElementById('btn-studio-save-person').textContent = "Save Changes";
  document.getElementById('btn-cancel-person-edit').classList.remove('hidden');
}

function resetPersonForm() {
  editingPersonId = null;
  const idInput = document.getElementById('studio-person-id');
  idInput.value = "";
  idInput.disabled = false;
  document.getElementById('studio-person-name').value = "";
  document.getElementById('studio-person-gender').value = "Female";
  document.getElementById('studio-person-age').value = "22";
  document.getElementById('studio-person-types').value = "";
  document.getElementById('studio-person-crush').value = "";

  setSlider('studio-p-ext', 'val-p-ext', 0.75);
  setSlider('studio-p-disc', 'val-p-disc', 0.50);
  setSlider('studio-p-skep', 'val-p-skep', 0.70);
  setSlider('studio-p-conf', 'val-p-conf', 0.60);

  document.getElementById('people-form-title').textContent = "+ Add Person to this Scenario";
  document.getElementById('btn-studio-save-person').textContent = "Add Person";
  document.getElementById('btn-cancel-person-edit').classList.add('hidden');
}

function selectConnectionForEditing(conn, index) {
  editingConnIndex = index;
  document.getElementById('studio-conn-from').value = conn.source;
  document.getElementById('studio-conn-to').value = conn.target;

  const channels = conn.channels || {};
  const firstChName = Object.keys(channels)[0] || "InPerson";
  const chData = channels[firstChName] || {};

  document.getElementById('studio-conn-ch').value = firstChName;
  setSlider('studio-conn-strength', 'val-c-freq', chData.strength ?? 0.80);
  setSlider('studio-conn-trust-s', 'val-c-trust-s', chData.trust_stod ?? 0.80);
  setSlider('studio-conn-trust-d', 'val-c-trust-d', chData.trust_dtos ?? 0.85);
  document.getElementById('studio-conn-flags').value = conn.flags || "";

  document.getElementById('conn-form-title').textContent = `Editing: ${conn.source} → ${conn.target}`;
  document.getElementById('btn-studio-save-conn').textContent = "Save Connection";
  document.getElementById('btn-cancel-conn-edit').classList.remove('hidden');
}

function resetConnectionForm() {
  editingConnIndex = null;
  document.getElementById('studio-conn-ch').value = "InPerson";
  setSlider('studio-conn-strength', 'val-c-freq', 0.80);
  setSlider('studio-conn-trust-s', 'val-c-trust-s', 0.80);
  setSlider('studio-conn-trust-d', 'val-c-trust-d', 0.85);
  document.getElementById('studio-conn-flags').value = "";

  document.getElementById('conn-form-title').textContent = "+ Add Relationship Channel";
  document.getElementById('btn-studio-save-conn').textContent = "Add Connection";
  document.getElementById('btn-cancel-conn-edit').classList.add('hidden');
}

async function refreshStudioView() {
  const activeScenarioId = document.getElementById('scenario-select').value;
  if (!inspectedScenarioId) inspectedScenarioId = activeScenarioId;

  const scenarios = await listScenariosIPC();
  document.getElementById('studio-scenarios-list').innerHTML = scenarios.map(s => `
    <div class="scenario-nav-card ${s.id === inspectedScenarioId ? 'active-card' : ''}" data-id="${s.id}">
      <span class="scenario-nav-title">${s.name} ${s.id === activeScenarioId ? '<span style="color:#60a5fa; font-size:9px;">(Live)</span>' : ''}</span>
      <span class="scenario-nav-sub">${s.nodes_count} people · ${s.edges_count} links</span>
    </div>
  `).join("");

  document.querySelectorAll('.scenario-nav-card').forEach(card => {
    card.onclick = async () => {
      inspectedScenarioId = card.dataset.id;
      resetPersonForm();
      resetConnectionForm();
      document.getElementById('create-scenario-panel').classList.add('hidden');
      document.getElementById('scenario-workspace').classList.remove('hidden');
      await refreshStudioView();
    };
  });

  const meta = await getScenarioDetailsIPC(inspectedScenarioId);
  currentScenarioData = meta;
  document.getElementById('current-scenario-title').textContent = meta.name;
  document.getElementById('current-scenario-desc').textContent = meta.description || "Scenario configuration and members.";

  const btnActivate = document.getElementById('btn-activate-scenario');
  btnActivate.textContent = (inspectedScenarioId === activeScenarioId) ? "Loaded in Canvas" : "Load into Canvas";
  btnActivate.style.opacity = (inspectedScenarioId === activeScenarioId) ? "0.6" : "1.0";

  // People List with Edit Trigger
  const people = meta.nodes || [];
  document.getElementById('badge-people-count').textContent = people.length;
  document.getElementById('studio-people-list').innerHTML = people.map(p => `
    <div class="entity-item-card ${editingPersonId === p.id ? 'selected-card' : ''}" data-id="${p.id}" style="cursor: pointer;">
      <div class="entity-info">
        <span class="entity-title">${p.name}</span>
        <span class="entity-sub">ID: ${p.id} · ${p.gender || 'Neutral'} (${p.age || 22})</span>
      </div>
      <div class="entity-actions">
        <button class="btn-studio-action edit-p" data-id="${p.id}" title="Edit Person">✎</button>
        <button class="btn-studio-action delete del-p" data-id="${p.id}" title="Delete">✕</button>
      </div>
    </div>
  `).join("") || `<div style="color:#64748b; font-size:10px; padding:10px;">No people in this scenario.</div>`;

  document.querySelectorAll('.edit-p').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const p = people.find(item => item.id === btn.dataset.id);
      if (p) selectPersonForEditing(p);
      refreshStudioView();
    };
  });

  document.querySelectorAll('#studio-people-list .entity-item-card').forEach(card => {
    card.onclick = () => {
      const p = people.find(item => item.id === card.dataset.id);
      if (p) selectPersonForEditing(p);
      refreshStudioView();
    };
  });

  document.querySelectorAll('.del-p').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      await deletePersonIPC(btn.dataset.id);
      if (editingPersonId === btn.dataset.id) resetPersonForm();
      await refreshStudioView();
    };
  });

  // Connections List with Edit Trigger
  const connections = meta.edges || [];
  document.getElementById('badge-conn-count').textContent = connections.length;
  document.getElementById('studio-conn-list').innerHTML = connections.map((c, idx) => {
    const chName = Object.keys(c.channels || {})[0] || 'Direct';
    return `
      <div class="entity-item-card ${editingConnIndex === idx ? 'selected-card' : ''}" data-idx="${idx}" style="cursor: pointer;">
        <div class="entity-info">
          <span class="entity-title">${c.source} → ${c.target}</span>
          <span class="entity-sub">Via: ${chName}</span>
        </div>
        <div class="entity-actions">
          <button class="btn-studio-action edit-conn" data-idx="${idx}" title="Edit Connection">✎</button>
          <button class="btn-studio-action delete del-conn" data-u="${c.source}" data-v="${c.target}" title="Delete">✕</button>
        </div>
      </div>
    `;
  }).join("") || `<div style="color:#64748b; font-size:10px; padding:10px;">No connections in this scenario.</div>`;

  document.querySelectorAll('.edit-conn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx);
      const c = connections[idx];
      if (c) selectConnectionForEditing(c, idx);
      refreshStudioView();
    };
  });

  document.querySelectorAll('#studio-conn-list .entity-item-card').forEach(card => {
    card.onclick = () => {
      const idx = parseInt(card.dataset.idx);
      const c = connections[idx];
      if (c) selectConnectionForEditing(c, idx);
      refreshStudioView();
    };
  });

  document.querySelectorAll('.del-conn').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      await deleteConnectionIPC(btn.dataset.u, btn.dataset.v);
      resetConnectionForm();
      await refreshStudioView();
    };
  });

  const fromSel = document.getElementById('studio-conn-from');
  const toSel = document.getElementById('studio-conn-to');
  fromSel.innerHTML = people.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
  toSel.innerHTML = people.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
}

function syncSlider(sliderId, labelId) {
  const s = document.getElementById(sliderId), l = document.getElementById(labelId);
  s.oninput = (e) => { l.textContent = parseFloat(e.target.value).toFixed(2); };
}

function setSlider(sliderId, labelId, val) {
  const s = document.getElementById(sliderId), l = document.getElementById(labelId);
  if (s && l) {
    s.value = val;
    l.textContent = parseFloat(val).toFixed(2);
  }
}