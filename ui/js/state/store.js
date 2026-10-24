class StateManager {
  constructor() {
    this.state = {
      appMode: 'forward', // 'forward' (Spread) vs 'reverse' (Inference)
      currentTime: 0.0,
      maxTime: 24.0,
      isPlaying: false,
      selectedElement: null,
      graphData: null,
      gradientMode: 'time'
    };
    this.listeners = new Map();
  }
  get(k) { return this.state[k]; }
  set(k, v) { this.state[k] = v; this.pub(k, v); }
  sub(k, fn) { if (!this.listeners.has(k)) this.listeners.set(k, []); this.listeners.get(k).push(fn); }
  pub(k, v) { if (this.listeners.has(k)) this.listeners.get(k).forEach(fn => fn(v, this.state)); }
}
export const store = new StateManager();