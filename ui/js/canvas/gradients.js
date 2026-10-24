import { getGroupColor, buildGroupGradientLegend } from '../state/palette.js';
import { store } from '../state/store.js';

export const GRADIENTS = {
  time: {
    title: "Spread Speed", bar: "linear-gradient(90deg, #10b981 0%, #3b82f6 50%, #6366f1 100%)", min: "0h", max: "24h+",
    getColor: (n, maxT) => n.data('arrival_time') === null ? '#334155' : lerp('#10b981', '#6366f1', Math.min(1.0, n.data('arrival_time') / (maxT || 24.0)))
  },
  probability: {
    title: "Belief & Confidence", bar: "linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%)", min: "0%", max: "100%",
    getColor: (n) => !n.data('informed') ? '#334155' : lerp('#ef4444', '#10b981', n.data('probability') || 0)
  },
  fidelity: {
    title: "Story Accuracy", bar: "linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%)", min: "Distorted", max: "Exact Truth",
    getColor: (n) => !n.data('informed') ? '#334155' : lerp('#ef4444', '#10b981', n.data('fidelity') || 0)
  },
  exposure: {
    title: "Echo Chamber Exposure", bar: "linear-gradient(90deg, #3b82f6 0%, #ec4899 100%)", min: "1x", max: "4x+ loop",
    getColor: (n) => !n.data('informed') ? '#334155' : lerp('#3b82f6', '#ec4899', Math.min(1.0, ((n.data('exposure_count')||1)-1)/3.0))
  },
  extraversion: {
    title: "Talkative (Extraversion)", bar: "linear-gradient(90deg, #475569 0%, #3b82f6 100%)", min: "0.0", max: "1.0",
    getColor: (n) => lerp('#475569', '#3b82f6', n.data('psychometrics')?.extraversion || 0.5)
  },
  discretion: {
    title: "Secret-Keeper (Discretion)", bar: "linear-gradient(90deg, #f59e0b 0%, #10b981 100%)", min: "Leaks", max: "Guarded",
    getColor: (n) => lerp('#f59e0b', '#10b981', n.data('psychometrics')?.discretion || 0.5)
  },
  groups: {
    title: "Affiliation Cliques",
    getLegend: () => buildGroupGradientLegend(store.get('currentGroups') || {}),
    getColor: (n) => {
      const g = n.data('groups') || [];
      if (g.length === 0) return '#64748b';
      if (g.length > 1) return '#facc15';
      return getGroupColor(g[0]);
    }
  }
};

function lerp(c1, c2, factor) {
  const i1 = parseInt(c1.slice(1), 16), i2 = parseInt(c2.slice(1), 16);
  const r = Math.round(((i1 >> 16) & 255) + factor * (((i2 >> 16) & 255) - ((i1 >> 16) & 255)));
  const g = Math.round(((i1 >> 8) & 255) + factor * (((i2 >> 8) & 255) - ((i1 >> 8) & 255)));
  const b = Math.round((i1 & 255) + factor * ((i2 & 255) - (i1 & 255)));
  return `rgb(${r}, ${g}, ${b})`;
}