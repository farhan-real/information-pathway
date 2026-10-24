"""
Core Type Schemas: Formalizes node metadata including personal tier arrays,
gender dynamics, archetypes, explicit crushes, and separate retention vs accuracy.
"""

from typing import TypedDict, List, Dict, Any, Optional


class Psychometrics(TypedDict, total=False):
    extraversion: float
    discretion: float
    skepticism: float
    accuracy: float
    retention: float
    conformity: float
    bravery: float


class ChannelConfig(TypedDict, total=False):
    strength: float
    level: str
    trust_stod: float
    trust_dtos: float
    active_hours: float
    stories_shared: bool


class GroupGlobalStats(TypedDict):
    name: str
    density: float
    psych_safety: float
    porosity: float
    meeting_freq_hrs: float
    physical_space: bool


class GroupMembership(TypedDict):
    role: str
    status: float
    loyalty: float


class PersonMetadata(TypedDict, total=False):
    id: str
    name: str
    gender: str
    age: int
    types: List[str]
    crushes: List[str]
    speed_vector: List[float]
    prob_vector: List[float]
    psychometrics: Psychometrics
    schedule: Dict[str, Any]
    groups: Dict[str, GroupMembership]