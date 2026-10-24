import { store } from '../state/store.js';
import { scrubPlayback } from '../canvas/network.js';

let interval = null;

export function initTimeline() {
  const scrub = document.getElementById('timeline-scrubber');
  const count = document.getElementById('current-scrub-time');
  const playBtn = document.getElementById('btn-play');

  scrub.oninput = (e) => store.set('currentTime', parseFloat(e.target.value));

  playBtn.onclick = () => {
    const playing = store.get('isPlaying');
    store.set('isPlaying', !playing);
    playBtn.textContent = !playing ? "⏸ Pause" : "▶ Play";
    if (!playing) {
      interval = setInterval(() => {
        let next = store.get('currentTime') + 0.1;
        if (next > store.get('maxTime')) { next = store.get('maxTime'); playBtn.click(); }
        store.set('currentTime', next);
      }, 50);
    } else {
      clearInterval(interval);
    }
  };

  document.getElementById('btn-reset').onclick = () => {
    if (store.get('isPlaying')) playBtn.click();
    store.set('currentTime', 0.0);
  };

  store.sub('currentTime', (t) => {
    scrub.value = t;
    count.textContent = t.toFixed(1);
    scrubPlayback(t);
  });
}