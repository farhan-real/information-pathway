import { CANVAS_STYLES } from './styling.js';
import { GRADIENTS } from './gradients.js';
import { store } from '../state/store.js';

let cy = null;

export function initCanvas(onNodeToggled) {
  cy = cytoscape({
    container: document.getElementById('cy-canvas'),
    minZoom: 0.45, maxZoom: 2.5, wheelSensitivity: 0.18,
    style: CANVAS_STYLES
  });

  cy.on('tap', 'node', e => {
    const isReverse = store.get('appMode') === 'reverse';
    if (isReverse && onNodeToggled) {
      onNodeToggled(e.target.data('id'), e.target.data());
    }
    store.set('selectedElement', { type: 'node', data: e.target.data() });
  });

  cy.on('tap', 'edge', e => store.set('selectedElement', { type: 'edge', data: e.target.data() }));
  cy.on('tap', e => { if (e.target === cy) store.set('selectedElement', null); });

  return cy;
}

export function drawNetwork(graphData, originId) {
  if (!cy) return;
  cy.elements().remove();
  const nodes = graphData.elements.nodes.map(n => ({ data: { ...n.data, is_origin: n.data.id === originId } }));
  cy.add({ nodes, edges: graphData.elements.edges });
  reheatPhysics();
  updateColors();
}

export function reheatPhysics() {
  if (!cy) return;
  cy.layout({ name: 'cose', animate: true, animationDuration: 400, nodeRepulsion: 7500, idealEdgeLength: 85, padding: 50 }).run();
}

export function updateColors() {
  if (!cy) return;
  const isReverse = store.get('appMode') === 'reverse';
  const mode = store.get('gradientMode') || 'time';
  const cfg = GRADIENTS[mode];
  const maxT = store.get('maxTime') || 24.0;

  cy.batch(() => {
    cy.nodes().forEach(n => {
      if (isReverse && n.data('is_observed')) {
        n.style('background-color', '#f59e0b');
        n.style('border-color', '#fbbf24');
        n.style('border-width', 4);
      } else {
        n.style('background-color', cfg.getColor(n, maxT));
        if (n.data('is_origin')) {
          n.style('border-color', '#3b82f6');
          n.style('border-width', 4);
        } else {
          n.style('border-color', '#334155');
          n.style('border-width', 2.5);
        }
      }
    });
  });

  const legendInfo = cfg.getLegend ? cfg.getLegend() : cfg;
  document.getElementById('legend-mode-title').textContent = legendInfo.title;
  document.getElementById('legend-gradient-bar').style.background = legendInfo.bar;
  document.getElementById('legend-min').textContent = legendInfo.min;
  document.getElementById('legend-max').textContent = legendInfo.max;
}

export function scrubPlayback(t) {
  if (!cy) return;
  const transmissions = store.get('transmissions') || [];
  cy.batch(() => {
    cy.nodes().forEach(n => {
      const arr = n.data('arrival_time');
      n.style('opacity', (arr !== null && arr <= t) ? 1.0 : 0.35);
    });
    cy.edges().forEach(e => {
      const active = transmissions.some(tr => tr.source === e.data('source') && tr.target === e.data('target') && tr.time <= t);
      if (active) e.addClass('flow-active'); else e.removeClass('flow-active');
    });
  });
}