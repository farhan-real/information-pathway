export const CANVAS_STYLES = [
  {
    selector: 'node',
    style: {
      'shape': 'ellipse',
      'width': 54,
      'height': 54,
      'background-color': '#1f2227',
      'border-width': 2.5,
      'border-color': '#334155',
      'label': 'data(label)',
      'color': '#f1f2f4',
      'font-family': 'Inter, sans-serif',
      'font-size': '11px',
      'text-valign': 'bottom',
      'text-margin-y': 5
    }
  },
  { selector: 'node[?is_origin]', style: { 'border-color': '#3b82f6', 'border-width': 4 } },
  {
    selector: 'edge',
    style: {
      'width': 1.6,
      'line-color': '#282d37',
      'curve-style': 'bezier',
      'target-arrow-shape': 'triangle',
      'target-arrow-color': '#282d37',
      'arrow-scale': 0.8
    }
  },
  // PREDICTED CONNECTIONS (DASHED PURPLE)
  {
    selector: 'edge[?is_predicted]',
    style: {
      'line-style': 'dashed',
      'line-dash-pattern': [5, 4],
      'line-color': '#8b5cf6',
      'target-arrow-color': '#8b5cf6',
      'width': 1.8
    }
  },
  // ACTIVE TRANSMISSION FLOW (GLOWING GREEN)
  {
    selector: 'edge.flow-active',
    style: {
      'line-color': '#10b981',
      'target-arrow-color': '#10b981',
      'width': 2.8,
      'z-index': 10
    }
  },
  { selector: ':selected', style: { 'border-color': '#f59e0b', 'border-width': 4 } }
];