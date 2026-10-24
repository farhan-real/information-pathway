# Information Pathway

Information Pathway is a high-fidelity discrete-event information diffusion simulator and reverse cascade tomography engine. It models how information, rumors, and leaks propagate through complex interpersonal networks, accounting for multi-channel communication, directional trust, demographic archetypes, romantic crushes, and physical environmental overhearing.

The platform provides two primary modes:
1. **Forward Spread Simulation**: Propagate an information payload from any originator and observe real-time arrival times, echo-chamber reinforcement, and story distortion across confirmed friendships and backchannels.
2. **Reverse Inference Tomography**: Given observed evidence of who knows the information and when they learned it, reverse-engineer the cascade to deduce hidden links, secret crush reach-outs, and shared-space overhearing without prior friendship records.

---

## Key Capabilities

### 1. Sociologically Calibrated Diffusion Engine
- **Directional Trust**: Edges model asymmetrical relationships where speaker trust (willingness to share secrets) and listener trust (source credibility) are evaluated independently.
- **Directional & Latent Crushes**: Models romantic motivation where excitement or romantic topics prompt out-of-band direct outreach across social circles, while damaging rumors about a crush trigger protective gatekeeping.
- **Shared-Space Environmental Overhearing**: Extraverted speakers or viral topics discussed in shared physical rooms (open-floor offices, libraries, cafeterias) can be overheard by co-located observers without a direct friendship edge.
- **Archetype Modifiers**: Personal archetypes (`Social`, `Observer`, `Skeptic`, `Withdrawn`) modulate broadcasting frequency, evidence thresholds, and detail retention.
- **Story Fidelity & Detail Retention**: Tracks truth degradation and detail preservation independently across every hop based on verification evidence and listener skepticism.

### 2. Reverse Cascade Network Tomography
- **Interactive Observation Deck**: Flag observed recipients directly on the canvas, add specific people, or select preconfigured incident observation scenarios.
- **Anomaly Detection**: Pinpoints recipients who acquired information faster than confirmed predecessors explain, or who possess information with zero incoming edges.
- **Causal Attribution**: Deduces whether transmission occurred via unrecorded romantic outreach, physical co-location, or confidential backchannels, accompanied by formal sociological diagnostic explanations.

### 3. Scenario-Centric Network Studio
- **Containerized Scenarios**: Scenarios strictly encapsulate their own people rosters, relationship channels, group structures, and incident presets.
- **Inline Attribute Editor**: Click any person or connection to edit psychometrics, tier speed arrays, contact frequency, directional trust, and flags.
- **Complete Serialization**: Full JSON import and export preserving demographic profiles, group dynamics, and custom behavioral flags.

---

## Directory Structure

```
.
+---engine
|   +---core
|   |   +---graph.py              # NetworkX graph manager and group index
|   |   \---types.py              # Strict TypedDict schemas
|   +---data
|   |   +---presets.py            # Isolated presets (Corporate, High School)
|   |   \---scenarios.py          # Scenario store with per-scenario isolation
|   +---models
|   |   +---behavior_ml.py        # Calibrated ML classifiers for sharing and adoption
|   |   \---link_predictor.py     # Reverse cascade tomography algorithm
|   \---simulation
|       +---diffusion.py          # Discrete-event priority queue simulator
|       +---gossip_engine.py      # Gossip bias, schadenfreude, and gatekeeping
|       \---hop_evaluator.py      # Multi-channel hop evaluation and crush inference
+---ui
|   +---css
|   |   +---modules
|   |   |   +---editor.css        # Studio modal and scenario workspace styles
|   |   |   +---inspector.css     # Detail drawer and friendship card styles
|   |   |   +---timeline.css      # Playback scrubber and gradient legend styles
|   |   |   \---toolbar.css       # Two-tier toolbar and observation deck styles
|   |   +---base.css
|   |   \---layout.css
|   +---js
|   |   +---canvas
|   |   |   +---gradients.js      # Color interpolation and metric modes
|   |   |   +---network.js        # Cytoscape lifecycle and physics layouts
|   |   |   \---styling.js        # Node, active edge, and deduced leak styles
|   |   +---components
|   |   |   +---app.js            # Main application coordinator and mode controller
|   |   |   +---editor_modal.js   # Scenario studio controller with inline editing
|   |   |   +---inspector.js      # Entity inspection drawer controller
|   |   |   +---timeline.js       # Fixed 20 TPS playback scrubber
|   |   |   \---toolbar.js        # Sliders and scenario selection handlers
|   |   +---services
|   |   |   +---bridge.js         # PyWebView IPC communication layer
|   |   |   \---tag_service.js    # Scenario-adaptive topic presets and mousewheel track
|   |   \---state
|   |       +---palette.js        # Dynamic HSL hash palette generator for groups
|   |       \---store.js          # Reactive frontend state manager
|   \---index.html
\---app.py                        # Desktop application entrypoint and IPC bridge
```

---

## Installation & Setup

### Prerequisites
- Python 3.9 or higher (3.12 Recommended)
- Modern Chromium / WebKit runtime (Edge WebView2 on Windows, WebKitGTK on Linux, WebKit on macOS). already installed most oof the time

### 1. Clone Repository
```bash
git clone https://github.com/your-username/information-pathway.git
cd information-pathway
```

### 2. Install Dependencies
```bash
pip install networkx scikit-learn pywebview numpy
```

### 3. Launch the Application
```bash
python app.py
```

---

## Behavioral Flags Glossary

When configuring relationship channels in the Scenario Studio, you can attach space-separated behavioral flags to alter transmission rules:

| Flag | Sociological Effect |
| :--- | :--- |
| `--NoRelationship` | Hard block on romantic, crush, and dating information. |
| `--StrictlyProfessional` | Suppresses personal rumors; restricts topics to work or study memos. |
| `--FastTrack` or `-f` | Instant transmission; bypasses delay and adoption hesitation. |
| `--EncryptedOnly` | Restricts transmission to secure personal channels (e.g. In-Person, Coffee Break). |
| `--ConfidentialPact` | Mutual secrecy agreement; suppresses sensitive leaks unless loyalty is breached. |
| `--ActiveRivalry` | Accelerates damaging rumors about a target; suppresses praise. |
| `--GatekeeperFilter` | Suppresses rumors lacking empirical verification proof. |
| `--FamilyTie` | Sets directional trust to 95%; eliminates hierarchy barriers. |
| `--Predicted` | Automatically attached to deduced links in reverse inference mode. |

---

## Technical Specifications

- **Simulation Clock**: Discrete-event priority queue evaluated in hours ($t \in [0.0, 72.0]$).
- **UI Animation Clock**: Fixed 20 TPS (50ms interval) scrubber decoupled from high-FPS Cytoscape.js rendering.
- **Machine Learning Classifiers**: Calibrated Random Forest estimators for speaker willingness to share and listener adoption, combined with Ridge latency regression.
- **Group Color Indexing**: Deterministic HSL hashing ensures every scenario clique receives a distinct visual identity without hardcoded color tables.
- **Cross-Platform Compatibility**: Supports touch and mouse viewports across desktop operating systems and mobile aspect ratios.

---

## License

This project is licensed under the MIT License. See `LICENSE` for details.