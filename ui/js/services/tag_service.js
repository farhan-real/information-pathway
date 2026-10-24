export class TagService {
  constructor(containerId, inputId, onChange) {
    this.container = document.getElementById(containerId);
    this.input = document.getElementById(inputId);
    this.onChange = onChange;
    this.tags = [];
    this.currentPreset = null;

    // Fix unscrollable tags with mousewheel support
    this.container.addEventListener("wheel", (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        this.container.scrollLeft += e.deltaY;
      }
    });

    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && this.input.value.trim()) {
        const val = this.input.value.trim().toLowerCase();
        if (!this.tags.some(t => t.name === val)) {
          this.tags.push({ name: val, active: true, custom: true });
        }
        this.input.value = "";
        this.render();
        this.onChange();
      }
    });
  }

  loadScenarioTopics(topics) {
    this.tags = (topics || []).map((tp, idx) => ({
      id: tp.id,
      name: tp.name,
      valence: tp.valence !== undefined ? tp.valence : -0.3,
      sensitivity: tp.sensitivity !== undefined ? tp.sensitivity : 0.6,
      virality: tp.virality !== undefined ? tp.virality : 0.8,
      tags: tp.tags || [tp.id],
      active: idx === 0
    }));

    if (this.tags.length === 0) {
      this.tags.push({ id: "general", name: "General News", valence: 0.0, sensitivity: 0.4, virality: 0.7, tags: ["general"], active: true });
    }

    this.currentPreset = this.tags.find(t => t.active);
    this.render();
  }

  render() {
    this.container.innerHTML = "";
    this.tags.forEach(t => {
      const p = document.createElement("span");
      p.className = `tag-pill ${t.active ? 'active' : ''}`;
      p.textContent = t.name;
      p.onclick = () => {
        this.tags.forEach(x => { x.active = false; });
        t.active = true;
        this.currentPreset = t;
        this.render();
        this.onChange(t);
      };
      this.container.appendChild(p);
    });
  }

  getActivePreset() {
    return this.tags.find(t => t.active) || this.tags[0];
  }

  getActive() {
    const active = this.getActivePreset();
    return active ? (active.tags || [active.name.toLowerCase()]) : ["general"];
  }
}