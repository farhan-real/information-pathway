import { store } from '../state/store.js';
import { updateColors, reheatPhysics } from '../canvas/network.js';

export function initToolbar(onSimulate) {
  document.getElementById('btn-run-sim').onclick = onSimulate;
  document.getElementById('btn-fit').onclick = reheatPhysics;
  document.getElementById('btn-reheat').onclick = reheatPhysics;

  document.getElementById('gradient-select').onchange = (e) => {
    store.set('gradientMode', e.target.value);
    updateColors();
  };

  sync('sensitivity-slider', 'val-sensitivity');
  sync('virality-slider', 'val-virality');
  sync('verifiability-slider', 'val-verifiability');
  sync('threshold-slider', 'val-threshold', onSimulate);
}

function sync(sliderId, labelId, callback) {
  const s = document.getElementById(sliderId), l = document.getElementById(labelId);
  s.oninput = (e) => {
    l.textContent = parseFloat(e.target.value).toFixed(2);
    if (callback) callback();
  };
}