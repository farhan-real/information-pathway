"""
Predefined Scenario Presets: Independent sociological networks with distinct
people rosters, relationship channels, topics, and reverse inference incident presets.
"""


def get_corporate_preset():
    return {
        "id": "corporate",
        "name": "Corporate Office",
        "description": "Tech firm with leadership hierarchy, dev floor, and HR boundaries.",
        "topics": [
            {"id": "layoffs", "name": "Restructuring Layoffs", "valence": -0.75, "sensitivity": 0.85, "virality": 0.90, "tags": ["work", "leak", "layoffs"]},
            {"id": "acquisition", "name": "Acquisition Talks", "valence": 0.40, "sensitivity": 0.80, "virality": 0.75, "tags": ["work", "confidential"]},
            {"id": "office_romance", "name": "Executive Romance", "valence": -0.20, "sensitivity": 0.60, "virality": 0.95, "tags": ["romantic", "gossip"]},
            {"id": "bonus_pool", "name": "Bonus Pool Slashed", "valence": -0.60, "sensitivity": 0.50, "virality": 0.80, "tags": ["work", "salary"]}
        ],
        "incidents": [
            {
                "id": "contractor_leak", "name": "Observed: Contractor Overhearing",
                "observed": [
                    {"id": "contractor_leo", "time": 2.5, "note": "Overheard in Dev Bullpen"},
                    {"id": "pm_chloe", "time": 4.0, "note": "Heard in Breakroom"}
                ]
            },
            {
                "id": "hr_whistleblower", "name": "Observed: HR Direct Alert",
                "observed": [
                    {"id": "ops_kevin", "time": 3.0, "note": "Logged confidential Slack query"},
                    {"id": "dev_sam", "time": 5.5, "note": "Discussed in private DM"}
                ]
            }
        ],
        "groups": {
            "grp_leadership": {"name": "Executive C-Suite", "density": 0.90, "psych_safety": 0.30, "porosity": 0.15, "meeting_freq_hrs": 24, "physical_space": True},
            "grp_engineering": {"name": "Engineering Open Floor", "density": 0.85, "psych_safety": 0.85, "porosity": 0.65, "meeting_freq_hrs": 6, "physical_space": True},
            "grp_product": {"name": "Product & People Ops", "density": 0.80, "psych_safety": 0.70, "porosity": 0.70, "meeting_freq_hrs": 12, "physical_space": True}
        },
        "nodes": [
            {
                "id": "ceo_diana", "name": "Diana (VP Engineering)", "gender": "Female", "age": 39,
                "types": ["Social"], "crushes": [],
                "speed_vector": [3.0, 14.0, 0.0], "prob_vector": [0.99, 0.75, 0.0],
                "psychometrics": {"extraversion": 0.70, "discretion": 0.90, "skepticism": 0.95, "accuracy": 0.92, "retention": 0.95, "conformity": 0.20, "bravery": 0.85},
                "schedule": {"tier": 4}, "groups": {"grp_leadership": {"role": "vp", "status": 0.95, "loyalty": 0.90}}
            },
            {
                "id": "lead_marcus", "name": "Marcus (Staff Architect)", "gender": "Male", "age": 36,
                "types": [], "crushes": ["pm_chloe"],
                "speed_vector": [4.0, 16.0, 48.0], "prob_vector": [0.95, 0.70, 0.25],
                "psychometrics": {"extraversion": 0.65, "discretion": 0.75, "skepticism": 0.85, "accuracy": 0.90, "retention": 0.90, "conformity": 0.40, "bravery": 0.60},
                "schedule": {"tier": 3}, "groups": {"grp_leadership": {"role": "liaison", "status": 0.80, "loyalty": 0.75}, "grp_engineering": {"role": "lead", "status": 0.90, "loyalty": 0.85}}
            },
            {
                "id": "dev_elena", "name": "Elena (Senior Backend)", "gender": "Female", "age": 29,
                "types": ["Social"], "crushes": [],
                "speed_vector": [2.0, 10.0, 30.0], "prob_vector": [0.99, 0.85, 0.35],
                "psychometrics": {"extraversion": 0.88, "discretion": 0.35, "skepticism": 0.45, "accuracy": 0.75, "retention": 0.80, "conformity": 0.65, "bravery": 0.50},
                "schedule": {"tier": 2}, "groups": {"grp_engineering": {"role": "core", "status": 0.80, "loyalty": 0.65}}
            },
            {
                "id": "dev_sam", "name": "Sam (Junior Dev)", "gender": "Male", "age": 24,
                "types": ["Withdrawn"], "crushes": ["pm_chloe"],
                "speed_vector": [6.0, 40.0, 0.0], "prob_vector": [0.85, 0.45, 0.0],
                "psychometrics": {"extraversion": 0.40, "discretion": 0.80, "skepticism": 0.70, "accuracy": 0.85, "retention": 0.75, "conformity": 0.60, "bravery": 0.30},
                "schedule": {"tier": 1}, "groups": {"grp_engineering": {"role": "member", "status": 0.40, "loyalty": 0.80}}
            },
            {
                "id": "pm_chloe", "name": "Chloe (Senior PM)", "gender": "Female", "age": 27,
                "types": ["Social"], "crushes": ["lead_marcus"],
                "speed_vector": [1.5, 8.0, 20.0], "prob_vector": [0.99, 0.88, 0.55],
                "psychometrics": {"extraversion": 0.92, "discretion": 0.25, "skepticism": 0.35, "accuracy": 0.65, "retention": 0.70, "conformity": 0.80, "bravery": 0.65},
                "schedule": {"tier": 2}, "groups": {"grp_product": {"role": "core", "status": 0.85, "loyalty": 0.50}}
            },
            {
                "id": "ops_kevin", "name": "Kevin (HR Lead)", "gender": "Male", "age": 35,
                "types": ["Skeptic"], "crushes": [],
                "speed_vector": [6.0, 24.0, 72.0], "prob_vector": [0.90, 0.60, 0.15],
                "psychometrics": {"extraversion": 0.55, "discretion": 0.88, "skepticism": 0.92, "accuracy": 0.95, "retention": 0.92, "conformity": 0.30, "bravery": 0.75},
                "schedule": {"tier": 3}, "groups": {"grp_product": {"role": "hr", "status": 0.90, "loyalty": 0.95}}
            },
            {
                "id": "contractor_leo", "name": "Leo (Contractor - Quiet Observer)", "gender": "Male", "age": 25,
                "types": ["Observer"], "crushes": [],
                "speed_vector": [8.0, 36.0, 0.0], "prob_vector": [0.80, 0.45, 0.0],
                "psychometrics": {"extraversion": 0.30, "discretion": 0.70, "skepticism": 0.65, "accuracy": 0.85, "retention": 0.85, "conformity": 0.50, "bravery": 0.40},
                "schedule": {"tier": 1}, "groups": {"grp_engineering": {"role": "contractor", "status": 0.30, "loyalty": 0.40}}
            }
        ],
        "edges": [
            {"source": "ceo_diana", "target": "lead_marcus", "channels": {"WorkSlack": {"strength": 0.90, "level": "Good", "trust_stod": 0.80, "trust_dtos": 0.92, "active_hours": 9}}, "flags": "--ConfidentialPact"},
            {"source": "lead_marcus", "target": "ceo_diana", "channels": {"WorkSlack": {"strength": 0.90, "level": "Good", "trust_stod": 0.92, "trust_dtos": 0.80, "active_hours": 9}}, "flags": "--ConfidentialPact"},
            {"source": "lead_marcus", "target": "dev_elena", "channels": {"WorkSlack": {"strength": 0.85, "level": "Good", "trust_stod": 0.80, "trust_dtos": 0.75, "active_hours": 8}, "CoffeeBreak": {"strength": 0.90, "level": "Best", "trust_stod": 0.85, "trust_dtos": 0.80, "active_hours": 3}}, "flags": "--FastTrack"},
            {"source": "dev_elena", "target": "lead_marcus", "channels": {"WorkSlack": {"strength": 0.85, "level": "Good", "trust_stod": 0.75, "trust_dtos": 0.80, "active_hours": 8}, "CoffeeBreak": {"strength": 0.90, "level": "Best", "trust_stod": 0.80, "trust_dtos": 0.85, "active_hours": 3}}, "flags": "--FastTrack"},
            {"source": "dev_elena", "target": "dev_sam", "channels": {"WorkSlack": {"strength": 0.90, "level": "Good", "trust_stod": 0.90, "trust_dtos": 0.65, "active_hours": 8}}, "flags": ""},
            {"source": "dev_sam", "target": "dev_elena", "channels": {"WorkSlack": {"strength": 0.90, "level": "Good", "trust_stod": 0.65, "trust_dtos": 0.90, "active_hours": 8}}, "flags": ""},
            {"source": "dev_elena", "target": "pm_chloe", "channels": {"CoffeeBreak": {"strength": 0.85, "level": "Best", "trust_stod": 0.75, "trust_dtos": 0.85, "active_hours": 2}}, "flags": ""},
            {"source": "pm_chloe", "target": "dev_elena", "channels": {"CoffeeBreak": {"strength": 0.85, "level": "Best", "trust_stod": 0.85, "trust_dtos": 0.75, "active_hours": 2}}, "flags": ""},
            {"source": "pm_chloe", "target": "ops_kevin", "channels": {"WorkSlack": {"strength": 0.65, "level": "Good", "trust_stod": 0.55, "trust_dtos": 0.80, "active_hours": 7}}, "flags": "--StrictlyProfessional"},
            {"source": "ops_kevin", "target": "pm_chloe", "channels": {"WorkSlack": {"strength": 0.65, "level": "Good", "trust_stod": 0.80, "trust_dtos": 0.55, "active_hours": 7}}, "flags": "--StrictlyProfessional"}
        ]
    }


def get_highschool_preset():
    return {
        "id": "highschool",
        "name": "High School Hallway",
        "description": "Cliques, secret crushes, Instagram DMs, and hallway overhearing.",
        "topics": [
            {"id": "secret_crush", "name": "Secret Crush Revealed", "valence": 0.30, "sensitivity": 0.50, "virality": 0.98, "tags": ["romantic", "crush", "gossip"]},
            {"id": "exam_leak", "name": "Midterm Exam Leaked", "valence": -0.65, "sensitivity": 0.85, "virality": 0.95, "tags": ["studies", "leak"]},
            {"id": "party_scandal", "name": "Weekend Party Video", "valence": -0.50, "sensitivity": 0.70, "virality": 0.92, "tags": ["gossip", "party"]},
            {"id": "drama_club", "name": "Lead Role Replaced", "valence": -0.30, "sensitivity": 0.40, "virality": 0.70, "tags": ["school", "arts"]}
        ],
        "incidents": [
            {
                "id": "hallway_overhear", "name": "Observed: Zoe in Library & Lucas in Discord",
                "observed": [
                    {"id": "student_zoe", "time": 2.1, "note": "Overheard in Library quiet section"},
                    {"id": "student_lucas", "time": 3.8, "note": "Posted on private server"}
                ]
            },
            {
                "id": "art_club_leak", "name": "Observed: Sam Alerted Early",
                "observed": [
                    {"id": "student_sam", "time": 2.8, "note": "Received direct text message"}
                ]
            }
        ],
        "groups": {
            "grp_popular": {"name": "Varsity & Core Circle", "density": 0.90, "psych_safety": 0.65, "porosity": 0.70, "meeting_freq_hrs": 3, "physical_space": True},
            "grp_arts": {"name": "Theater & Art Circle", "density": 0.80, "psych_safety": 0.85, "porosity": 0.50, "meeting_freq_hrs": 6, "physical_space": True},
            "grp_gamers": {"name": "Esports & Tech Club", "density": 0.75, "psych_safety": 0.90, "porosity": 0.80, "meeting_freq_hrs": 8, "physical_space": True}
        },
        "nodes": [
            {
                "id": "student_maya", "name": "Maya (Popular Lead)", "gender": "Female", "age": 16,
                "types": ["Social"], "crushes": ["student_jordan"],
                "speed_vector": [1.0, 5.0, 20.0], "prob_vector": [0.99, 0.85, 0.45],
                "psychometrics": {"extraversion": 0.95, "discretion": 0.25, "skepticism": 0.35, "accuracy": 0.65, "retention": 0.75, "conformity": 0.85, "bravery": 0.60},
                "schedule": {"tier": 2}, "groups": {"grp_popular": {"role": "lead", "status": 0.95, "loyalty": 0.80}}
            },
            {
                "id": "student_jordan", "name": "Jordan (Athlete)", "gender": "Male", "age": 16,
                "types": ["Social"], "crushes": ["student_maya"],
                "speed_vector": [1.5, 6.0, 24.0], "prob_vector": [0.95, 0.80, 0.35],
                "psychometrics": {"extraversion": 0.85, "discretion": 0.40, "skepticism": 0.50, "accuracy": 0.75, "retention": 0.80, "conformity": 0.70, "bravery": 0.70},
                "schedule": {"tier": 2}, "groups": {"grp_popular": {"role": "member", "status": 0.85, "loyalty": 0.75}}
            },
            {
                "id": "student_sam", "name": "Sam (Art President)", "gender": "Male", "age": 17,
                "types": ["Skeptic"], "crushes": ["student_alex"],
                "speed_vector": [3.0, 14.0, 0.0], "prob_vector": [0.90, 0.65, 0.0],
                "psychometrics": {"extraversion": 0.68, "discretion": 0.70, "skepticism": 0.75, "accuracy": 0.88, "retention": 0.85, "conformity": 0.35, "bravery": 0.80},
                "schedule": {"tier": 1}, "groups": {"grp_arts": {"role": "president", "status": 0.90, "loyalty": 0.85}}
            },
            {
                "id": "student_alex", "name": "Alex (Bridge Broker)", "gender": "Neutral", "age": 16,
                "types": ["Social"], "crushes": [],
                "speed_vector": [2.0, 8.0, 22.0], "prob_vector": [0.96, 0.75, 0.30],
                "psychometrics": {"extraversion": 0.85, "discretion": 0.30, "skepticism": 0.45, "accuracy": 0.70, "retention": 0.80, "conformity": 0.60, "bravery": 0.55},
                "schedule": {"tier": 2}, "groups": {"grp_popular": {"role": "member", "status": 0.70, "loyalty": 0.60}, "grp_arts": {"role": "member", "status": 0.70, "loyalty": 0.70}}
            },
            {
                "id": "student_lucas", "name": "Lucas (Discord Host)", "gender": "Male", "age": 16,
                "types": [], "crushes": ["student_maya"],
                "speed_vector": [1.0, 6.0, 16.0], "prob_vector": [0.99, 0.85, 0.40],
                "psychometrics": {"extraversion": 0.78, "discretion": 0.35, "skepticism": 0.60, "accuracy": 0.70, "retention": 0.75, "conformity": 0.65, "bravery": 0.50},
                "schedule": {"tier": 1}, "groups": {"grp_gamers": {"role": "lead", "status": 0.90, "loyalty": 0.90}}
            },
            {
                "id": "student_zoe", "name": "Zoe (Library Observer - Unlinked)", "gender": "Female", "age": 16,
                "types": ["Observer"], "crushes": [],
                "speed_vector": [8.0, 48.0, 0.0], "prob_vector": [0.85, 0.30, 0.0],
                "psychometrics": {"extraversion": 0.25, "discretion": 0.90, "skepticism": 0.90, "accuracy": 0.95, "retention": 0.92, "conformity": 0.20, "bravery": 0.40},
                "schedule": {"tier": 1}, "groups": {"grp_popular": {"role": "observer", "status": 0.30, "loyalty": 0.40}}
            }
        ],
        "edges": [
            {"source": "student_maya", "target": "student_jordan", "channels": {"InPerson": {"strength": 0.95, "level": "Best", "trust_stod": 0.90, "trust_dtos": 0.85, "active_hours": 7}, "Instagram": {"strength": 0.95, "level": "Best", "trust_stod": 0.92, "trust_dtos": 0.88}}, "flags": "--FastTrack"},
            {"source": "student_jordan", "target": "student_maya", "channels": {"InPerson": {"strength": 0.95, "level": "Best", "trust_stod": 0.85, "trust_dtos": 0.90, "active_hours": 7}, "Instagram": {"strength": 0.95, "level": "Best", "trust_stod": 0.88, "trust_dtos": 0.92}}, "flags": "--FastTrack"},
            {"source": "student_jordan", "target": "student_alex", "channels": {"InPerson": {"strength": 0.90, "level": "Best", "trust_stod": 0.95, "trust_dtos": 0.90, "active_hours": 6}}, "flags": "--FamilyTie"},
            {"source": "student_alex", "target": "student_jordan", "channels": {"InPerson": {"strength": 0.90, "level": "Best", "trust_stod": 0.90, "trust_dtos": 0.95, "active_hours": 6}}, "flags": "--FamilyTie"},
            {"source": "student_maya", "target": "student_alex", "channels": {"InPerson": {"strength": 0.85, "level": "Good", "trust_stod": 0.80, "trust_dtos": 0.65, "active_hours": 5}}, "flags": ""},
            {"source": "student_alex", "target": "student_maya", "channels": {"InPerson": {"strength": 0.85, "level": "Good", "trust_stod": 0.65, "trust_dtos": 0.80, "active_hours": 5}}, "flags": ""},
            {"source": "student_alex", "target": "student_sam", "channels": {"InPerson": {"strength": 0.80, "level": "Good", "trust_stod": 0.85, "trust_dtos": 0.78, "active_hours": 5}}, "flags": ""},
            {"source": "student_sam", "target": "student_alex", "channels": {"InPerson": {"strength": 0.80, "level": "Good", "trust_stod": 0.78, "trust_dtos": 0.85, "active_hours": 5}}, "flags": ""}
        ]
    }