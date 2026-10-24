import { store } from '../state/store.js';

const FLAG_GLOSSARY = {
  "--NoRelationship": "Blocks romantic rumors",
  "--StrictlyProfessional": "Restricts communication to work/studies only",
  "--FastTrack": "Accelerated channel; bypasses delay and hesitation",
  "--EncryptedOnly": "Avoids corporate/public channels; uses private chat",
  "--ConfidentialPact": "Mutual secrecy pact; suppresses sensitive leaks",
  "--ActiveRivalry": "Accelerates damaging rumors; suppresses praise",
  "--GatekeeperFilter": "Kills rumors lacking solid proof",
  "--FamilyTie": "Unbreakable high trust; bypasses hierarchy gap",
  "--Predicted": "Reverse algorithm: hidden transmission leak explaining arrival anomaly"
};

export function initInspector() {
  const container = document.getElementById('inspector-body');
  const title = document.getElementById('inspector-title');
  const badge = document.getElementById('inspector-badge');

  store.sub('selectedElement', (elem) => {
    const isReverseMode = store.get('appMode') === 'reverse';

    if (!elem) {
      title.textContent = isReverseMode ? 'Reverse Diagnosis' : 'Details';
      badge.textContent = isReverseMode ? 'REVERSE MODE' : 'FORWARD MODE';
      container.innerHTML = `<p style="color: #64748b; text-align: center; margin-top: 30px;">
        ${isReverseMode 
          ? 'Click nodes on the network canvas to toggle them as observed with info, or select an incident preset to infer leaks.' 
          : 'Select any person or connection line to inspect transmission flows and behavioral traits.'}
      </p>`;
      return;
    }

    if (elem.type === 'node') {
      const d = elem.data;
      title.textContent = d.label;
      badge.textContent = d.is_observed ? "Observed Informed" : (d.is_origin ? "Source" : (d.informed ? "Informed" : "Unreached"));

      const psych = d.psychometrics || {};
      const groups = d.group_details || {};
      const crushes = d.crushes || [];
      const types = d.types || [];
      const friends = d.friends || [];

      const typesBadges = types.map(t =>
        `<span class="group-tag" style="background: rgba(59,130,246,0.18); color: #93c5fd; border: 1px solid currentColor;">${t}</span>`
      ).join("") || `<span style="color: #64748b; font-size: 10px;">None</span>`;

      const crushesBadges = crushes.map(c =>
        `<span class="group-tag" style="background: rgba(236,72,153,0.18); color: #f472b6; border: 1px solid currentColor;">♥ ${c}</span>`
      ).join("") || `<span style="color: #64748b; font-size: 10px;">None recorded</span>`;

      const groupPills = Object.keys(groups).map(g =>
        `<span class="group-tag" style="background:#1e2227; border:1px solid #334155;">${groups[g].name || g} (${groups[g].role || 'member'})</span>`
      ).join("") || `<span style="color: #64748b; font-size: 10px;">Unaffiliated</span>`;

      const toggleBtnHtml = isReverseMode ? `
        <div style="margin: 8px 0 12px 0;">
          <button id="btn-toggle-inspector-obs" class="btn-studio-primary" style="width: 100%; font-size: 11px; padding: 6px 10px; background: ${d.is_observed ? '#ef4444' : '#9333ea'};">
            ${d.is_observed ? '✕ Remove Observed Flag' : '+ Flag as Observed with Info'}
          </button>
        </div>
      ` : '';

      let friendsHtml = "";
      const displayFriends = isReverseMode ? friends : friends.filter(f => !f.is_predicted);
      if (displayFriends.length > 0) {
        friendsHtml = displayFriends.map(f => {
          const channels = f.channels || {};
          const chSummary = Object.keys(channels).map(chName => {
            const ch = channels[chName];
            return `
              <div class="channel-block">
                <div class="channel-row">
                  <span>${chName} <span class="ch-level">(${ch.level || 'Good'})</span></span>
                  <span class="val" style="font-family:monospace; color:#cbd5e1;">Contact: ${(ch.strength * 100).toFixed(0)}%</span>
                </div>
              </div>
            `;
          }).join("");

          const reasonBox = f.is_predicted && f.prediction_reason ? `
            <div class="prediction-reason-box">
              <strong>Reverse Deduction:</strong> ${f.prediction_reason}
            </div>
          ` : '';

          return `
            <div class="friend-card ${f.is_predicted ? 'predicted-card' : ''}">
              <div class="friend-card-head">
                <span class="friend-name">${f.name}</span>
                <span class="friend-status-badge ${f.is_predicted ? 'predicted' : ''}">
                  ${f.is_predicted ? 'Predicted Hidden Leak' : 'Confirmed Connection'}
                </span>
              </div>
              ${reasonBox}
              ${chSummary}
            </div>
          `;
        }).join("");
      } else {
        friendsHtml = `<div style="color:#64748b; font-size:11px;">No recorded friends (Isolated / Latent Observer).</div>`;
      }

      let logHtml = "";
      if (d.is_observed) {
        logHtml = `<div class="log-box" style="color: #f59e0b;">Flagged as Observed with Information in Reverse Investigation.</div>`;
      } else if (d.is_origin) {
        logHtml = `<div class="log-box" style="color: var(--accent-blue);">Cascade Originator (0.0h).</div>`;
      } else if (!d.informed) {
        logHtml = `<div class="log-box" style="color: #64748b;">Has not received information.</div>`;
      } else {
        logHtml = (d.heard_from || []).map(h => `
          <div class="log-box" style="margin-bottom:6px; border-left:3px solid var(--accent-green);">
            <div style="font-size:10px; color:#f0f1f3; font-weight:600;">Heard from <strong>${h.from_name}</strong></div>
            <div style="display:flex; justify-content:space-between; font-size:9px; color:#8b9098; margin-top:2px;">
              <span>Via: ${h.channel}</span>
              <span>Time: ${h.time}h</span>
            </div>
            <div style="font-size:9px; color:#f59e0b; margin-top:2px;">Motive: ${h.motive || 'Direct transmission'}</div>
          </div>
        `).join("");
      }

      container.innerHTML = `
        ${toggleBtnHtml}
        <div style="margin-bottom:12px;">
          <div class="detail-stat"><span class="lbl">First reached</span><span class="val">${d.arrival_time !== null && d.arrival_time !== undefined ? d.arrival_time + ' hrs' : 'Never'}</span></div>
          <div class="detail-stat"><span class="lbl">Belief Probability</span><span class="val">${(d.probability * 100).toFixed(0)}%</span></div>
          <div class="detail-stat"><span class="lbl">Story Accuracy</span><span class="val">${(d.fidelity * 100).toFixed(0)}%</span></div>
          <div class="detail-stat"><span class="lbl">Times Heard (Exposure)</span><span class="val">${d.exposure_count}x</span></div>
        </div>

        <h3 style="font-size:10px; color:#8b9098; margin:8px 0 4px;">DEMOGRAPHICS & CRUSHES:</h3>
        <div style="margin-bottom:8px;">
          <span class="group-tag" style="background:#1e2227; border:1px solid #334155;">Gender: ${d.gender}</span>
          <span class="group-tag" style="background:#1e2227; border:1px solid #334155;">Age: ${d.age}</span>
        </div>
        <div style="margin-bottom:6px; font-size:10px; color:#cbd5e1;"><strong>Archetypes:</strong> ${typesBadges}</div>
        <div style="margin-bottom:8px; font-size:10px; color:#cbd5e1;"><strong>Crush / Romantic Interest:</strong> ${crushesBadges}</div>

        <h3 style="font-size:10px; color:#8b9098; margin:10px 0 4px;">
          ${isReverseMode ? 'CONFIRMED & DEDUCED CONNECTIONS:' : 'FRIENDSHIPS & CONNECTIONS:'}
        </h3>
        <div>${friendsHtml}</div>

        <h3 style="font-size:10px; color:#8b9098; margin:12px 0 4px;">AFFILIATION GROUPS:</h3>
        <div>${groupPills}</div>

        <h3 style="font-size:10px; color:#8b9098; margin:12px 0 4px;">TRANSMISSION EVIDENCE:</h3>
        <div>${logHtml}</div>

        <h3 style="font-size:10px; color:#8b9098; margin:12px 0 4px;">PSYCHOMETRICS:</h3>
        <div class="detail-stat"><span class="lbl">Extraversion (Talkative)</span><span class="val">${((psych.extraversion || 0.5) * 100).toFixed(0)}%</span></div>
        <div class="detail-stat"><span class="lbl">Discretion (Keeps Secrets)</span><span class="val">${((psych.discretion || 0.5) * 100).toFixed(0)}%</span></div>
        <div class="detail-stat"><span class="lbl">Skepticism (Needs Proof)</span><span class="val">${((psych.skepticism || 0.5) * 100).toFixed(0)}%</span></div>
        <div class="detail-stat"><span class="lbl">Conformity (Fits In)</span><span class="val">${((psych.conformity || 0.5) * 100).toFixed(0)}%</span></div>
      `;

      const obsBtn = document.getElementById('btn-toggle-inspector-obs');
      if (obsBtn) {
        obsBtn.onclick = () => {
          if (window.toggleObservedNode) {
            window.toggleObservedNode(d.id);
          }
        };
      }
    } else {
      const d = elem.data;
      const sName = d.source_name || d.source;
      const tName = d.target_name || d.target;

      title.textContent = `${sName} → ${tName}`;
      badge.textContent = d.is_predicted ? "Reverse Deduction Link" : "Confirmed Connection";

      const channels = d.channels || {};
      const chDetails = Object.keys(channels).map(chName => {
        const ch = channels[chName];
        return `
          <div class="detail-stat" style="margin-top: 6px;">
            <span class="lbl" style="font-weight: 600; color: #e2e8f0;">${chName} Channel</span>
            <span class="val">Contact: ${(ch.strength * 100).toFixed(0)}%</span>
          </div>
          <div class="detail-stat" style="padding-left: 8px; border: none;">
            <span class="lbl">↳ ${sName} trusts ${tName}:</span>
            <span class="val">${((ch.trust_stod || 0.5) * 100).toFixed(0)}%</span>
          </div>
          <div class="detail-stat" style="padding-left: 8px;">
            <span class="lbl">↳ ${tName} believes ${sName}:</span>
            <span class="val">${((ch.trust_dtos || 0.5) * 100).toFixed(0)}%</span>
          </div>
        `;
      }).join("");

      const edgeReasonBox = d.is_predicted && d.prediction_reason ? `
        <div class="prediction-reason-box" style="margin-top:8px;">
          <strong>Reverse Tomography Proof:</strong><br>${d.prediction_reason}
        </div>
      ` : '';

      const rawFlags = (d.flags || "").split(" ").filter(fl => fl.startsWith("--"));
      const flagsHtml = rawFlags.map(fl => `
        <div class="detail-stat">
          <span class="lbl" style="color:#fbbf24;">${fl}</span>
          <span class="val" style="font-size:10px; color:#cbd5e1;">${FLAG_GLOSSARY[fl] || 'Custom modifier'}</span>
        </div>
      `).join("");

      container.innerHTML = `
        <div class="detail-stat"><span class="lbl">Primary Channel</span><span class="val">${d.channel}</span></div>
        <div class="detail-stat"><span class="lbl">Classification</span><span class="val">${d.is_predicted ? 'Deduced Hidden Leak' : 'Confirmed Connection'}</span></div>
        ${edgeReasonBox}
        ${chDetails}
        <h3 style="font-size:10px; color:#8b9098; margin:12px 0 4px;">ACTIVE RULE FLAGS:</h3>
        ${flagsHtml || '<div style="color:#64748b; font-size:10px;">No special flags.</div>'}
      `;
    }
  });
}