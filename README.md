# Information Pathway

Information Pathway is an agent-based discrete-event network diffusion simulator and reverse cascade tomography engine. It models how verified news, leaks, and unverified rumors propagate across human social networks by simulating interpersonal hesitation, emotional bias, structural boundaries, and physical environmental overhearing.

The platform provides two operational modes:
- **Forward Spread Simulation**: Propagate an information payload from any originator node and observe arrival timestamps, narrative distortion, echo-chamber reinforcement, and multi-channel cascades.
- **Reverse Inference Tomography**: Given observed evidence of who knows the information and when they learned it, reverse-engineer the cascade to diagnose unrecorded links, out-of-band crush outreach, and shared-space overhearing.

---

## Machine Learning Architecture

Information Pathway decouples transmission decisions, credibility evaluation, transmission latency, and tomography into dedicated machine learning and statistical models.

### 1. Speaker Transmission Classifier (`clf_share`)
A calibrated Random Forest Classifier (`n_estimators=45, max_depth=6`) that predicts disclosure probability ($P_{share} \in [0, 1]$) across a 10-dimensional sociological feature vector:
- **Trust in Listener ($Trust_{StoD}$)**: Subjective confidence that the recipient keeps secrets.
- **Extraversion ($Ext_S$)**: Tendency to broadcast information broadly.
- **Discretion ($Disc_S$)**: Inhibitory control and secret-keeping capacity.
- **Payload Sensitivity ($Sens$)**: Risk and confidentiality stakes of the topic.
- **Payload Virality ($Viral$)**: Shock value and social currency of the news.
- **In-Group Affinity ($Affinity$)**: Structural density of shared affiliations.
- **Group Loyalty ($Loyalty_S$)**: Resistance to leaking outside in-group boundaries.
- **Signed Hierarchy Gap ($\Delta Tier$)**: Positional power difference ($Tier_S - Tier_L$).
- **Crush Motivation ($Crush_{S \to L}$)**: Romantic incentive to reach out across social boundaries.
- **Moral Bravery ($Bravery_S$)**: Willingness to leak despite hierarchical reprimand.

### 2. Listener Adoption Classifier (`clf_adopt`)
A calibrated Random Forest Classifier (`n_estimators=35, max_depth=5`) predicting narrative belief and adoption ($P_{adopt} \in [0, 1]$) based on a 7-dimensional feature vector:
- **Trust in Speaker Credibility ($Trust_{DtoS}$)**: Evaluated veracity of the source.
- **Listener Skepticism ($Skep_L$)**: Baseline demand for corroboration and evidence.
- **Speaker Accuracy Reputation ($Acc_S$)**: Perceived historical truthfulness of the speaker.
- **Empirical Verifiability ($Verif$)**: Presence of tangible proof or corroborating artifacts.
- **Listener Social Conformity ($Conf_L$)**: Susceptibility to consensus pressure.
- **Group Psychological Safety ($PsychSafety$)**: In-group freedom from judgment.
- **Crush Receptivity ($Crush_{L \to S}$)**: Willingness to accept claims from a romantic interest.

Single-hop transmission probability is computed as:
$$P_{hop} = P_{share} \times P_{adopt}$$

### 3. Dynamic Latency Regressor (`reg_latency`)
An L2-regularized Ridge Regressor estimating continuous arrival delay in decimal hours ($t \ge 0.1h$) over a 6-dimensional operational vector:
- **Tier Speed ($Speed_{Tier}$)**: Personal delivery speed for close, medium, or distant contacts.
- **Contact Frequency ($Strength$)**: Channel contact regularity ($0.1 - 1.0$).
- **Schedule Overlap ($SchedOverlap$)**: Mutual availability and active hours.
- **Urgency Factor ($Viral$)**: Topic virality compressing delay.
- **Co-Affiliation ($IsSameGroup$)**: Shared clique presence ($0$ or $1$).
- **Meeting Cadence ($MeetingFreqHrs$)**: Periodic group gathering frequency.

### 4. Bayesian Echo-Chamber Reinforcement
When an agent is exposed to identical information from multiple distinct sources, belief confidence updates iteratively:
$$P_{belief} = 1 - (1 - P_{prev}) \times (1 - P_{hop} \times (0.4 + 0.6 \times Conf_L))$$

### 5. Multi-Hop Narrative Distortion
Tracks story fidelity through two decoupled degradation metrics:
- **Story Accuracy (Truth vs Myth)**: Degrades based on source accuracy and payload verifiability:
$$Acc_{hop} = Acc_S \times (1.0 - (1.0 - Verif) \times 0.20)$$
- **Detail Retention (Nuance Volume)**: Contextual detail loss over successive hops:
$$Ret_{hop} = Ret_S \times (0.85 + 0.15 \times Strength)$$

---

## Gossip Engine and Motives

Transmission probability is modulated by the relationship between the speaker and the subject the rumor is *about*:
- **Schadenfreude Toward Rivals**: When damaging rumors ($\text{valence} < -0.2$) target an active rival, transmission probability increases by up to 180%, accelerating malicious propagation.
- **Protective Gatekeeping**: Damaging rumors concerning an ally are suppressed by up to 85%.
- **Crush Defense & Obsession**: Damaging rumors targeting a romantic crush are suppressed by 95%; romantic rumors involving a crush double virality and trigger investigative reach-out.
- **Supportive Advocacy**: Positive achievements ($\text{valence} > +0.2$) regarding allies receive a 140% amplification boost.

---

## Affiliation Groups and Environmental Overhearing

Cliques are governed by structural parameters that determine communication friction and physical presence:
- **Clique Density**: Internal connectivity determining how rapidly news recirculates.
- **Psychological Safety**: In-group comfort with discussing unverified news without fear of penalty.
- **Group Porosity**: Boundary permeability determining outward leakage rates.
- **Meeting Frequency**: Scheduled cycles creating synchronized information handoffs.
- **Shared-Space Overhearing**: In groups marked with physical presence (open dev bullpens, study halls, cafeterias), loud discussions by extraverted or careless agents are overheard in real time ($+0.2h$ to $+0.8h$) by co-located observers without recorded friendships.

---

## Information Categories and Topic Payloads

Each cascade propagates a structured payload with explicit social properties:
- **Emotional Valence ($-1.0$ to $+1.0$)**: Categorizes hostile leaks, neutral updates, and positive milestones.
- **Risk and Sensitivity ($0.0$ to $1.0$)**: Confidentiality stakes; high risk stops spread across low-trust bonds.
- **Virality ($0.0$ to $1.0$)**: Novelty and interest; high virality overcomes hierarchy and social friction.
- **Empirical Verifiability ($0.0$ to $1.0$)**: Hard evidence; low proof accelerates telephone-game distortion.

### Presets
- **Corporate Office**: Restructuring layoffs, acquisition talks, executive romances, and slashed bonus pools across executive leadership, engineering, and HR.
- **High School Hallway**: Secret crushes, leaked exams, party recordings, and club cast drama across varsity cliques, art clubs, and esports teams.

---

## Scenario Studio

- **Scenario Isolation**: Scenarios strictly contain their own people rosters, relationship channels, group structures, and incident presets.
- **Inline Editing**: Inspect and edit personal demographics, age, archetypes, crushes, personal tier speeds, channel strength, and directional trust.
- **Observation Deck**: Flag observed recipients directly on the canvas or load incident presets for reverse tomography analysis.

---

## Behavioral Flags Glossary

| Flag | Sociological Effect |
| :--- | :--- |
| `--NoRelationship` | Hard block on romantic, crush, and dating information. |
| `--StrictlyProfessional` | Suppresses personal rumors; restricts topics to professional memos. |
| `--FastTrack` or `-f` | Instant transmission; bypasses delay and hesitation. |
| `--EncryptedOnly` | Restricts transmission to secure personal channels (e.g. In-Person). |
| `--ConfidentialPact` | Mutual secrecy pact; suppresses sensitive leaks unless loyalty is breached. |
| `--ActiveRivalry` | Accelerates damaging rumors; suppresses praise. |
| `--GatekeeperFilter` | Suppresses rumors lacking empirical verification proof. |
| `--FamilyTie` | Sets directional trust to 95%; eliminates hierarchy barriers. |
| `--Predicted` | Attached to deduced links in reverse inference mode. |

---

## Project Structure

```text
.
+---engine
|   +---core
|   |   +---graph.py              # NetworkX graph manager and group index
|   |   \---types.py              # TypedDict schemas for nodes, channels, groups
|   +---data
|   |   +---presets.py            # Isolated scenario presets and incident cases
|   |   \---scenarios.py          # Scenario store with per-scenario mutation persistence
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
|   |   |   +---app.js            # Coordinator, mode controller, observation state
|   |   |   +---editor_modal.js   # Scenario studio controller with inline editing
|   |   |   +---inspector.js      # Entity inspection drawer controller
|   |   |   +---timeline.js       # Fixed 20 TPS playback scrubber
|   |   |   \---toolbar.js        # Sliders and scenario selection handlers
|   |   +---services
|   |   |   +---bridge.js         # PyWebView IPC communication layer
|   |   |   \---tag_service.js    # Topic presets and wheel-scrollable track
|   |   \---state
|   |       +---palette.js        # Dynamic HSL hash palette generator for groups
|   |       \---store.js          # Reactive frontend state manager
|   \---index.html
\---app.py                        # Desktop application entrypoint and IPC bridge
```

---

## Installation & Setup

```bash
git clone https://github.com/your-username/information-pathway.git
cd information-pathway
pip install networkx scikit-learn pywebview numpy
python app.py
```

---

## Technical Specifications

- **Simulation Clock**: Discrete-event priority queue evaluated in hours ($t \in [0.0, 72.0]$).
- **UI Animation Clock**: Fixed 20 TPS (50ms interval) scrubber decoupled from high-FPS Cytoscape.js rendering.
- **Group Color Indexing**: Deterministic HSL hashing ensures every scenario clique receives a distinct visual identity without hardcoded tables.
- **Cross-Platform Compatibility**: Touch and mouse support across desktop and mobile aspect ratios.

---

## License

This project is licensed under the MIT License. See `LICENSE` for details.