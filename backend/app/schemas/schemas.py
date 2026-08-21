from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


# --- Candidate Schemas ---
class ContactInfo(BaseModel):
    name: str = Field(default="Candidate")
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None


class EducationItem(BaseModel):
    degree: Optional[str] = None
    institution: Optional[str] = None
    year: Optional[str] = None
    gpa: Optional[str] = None


class ExperienceItem(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    duration: Optional[str] = None
    responsibilities: List[str] = Field(default_factory=list)


class ProjectItem(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)


class ParsedResume(BaseModel):
    candidate: ContactInfo
    summary: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    education: List[EducationItem] = Field(default_factory=list)
    experience: List[ExperienceItem] = Field(default_factory=list)
    projects: List[ProjectItem] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)
    raw_text: Optional[str] = None


# --- Job Schemas ---
class JobCreate(BaseModel):
    title: str
    company: Optional[str] = "Acme Corp"
    department: Optional[str] = "Engineering"
    description: str
    required_skills: Optional[List[str]] = Field(default_factory=list)
    preferred_skills: Optional[List[str]] = Field(default_factory=list)


class JobResponse(BaseModel):
    id: str
    title: str
    company: Optional[str]
    department: Optional[str]
    description: str
    required_skills: List[str]
    preferred_skills: List[str]
    responsibilities: List[str]
    education_requirements: List[str]
    experience_requirements: List[str]
    keywords: List[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Screening & Match Schemas ---
class ScoreBreakdown(BaseModel):
    overall_score: float
    score_category: str
    recommendation: str
    skill_match_score: float
    semantic_fit_score: float
    experience_score: float
    project_score: float
    education_score: float
    certification_score: float
    keyword_score: float


class CandidateMatchReport(BaseModel):
    candidate_id: str
    candidate_name: str
    email: Optional[str]
    match_scores: ScoreBreakdown
    matched_skills: List[str]
    missing_skills: List[str]
    additional_skills: List[str]
    strengths: List[str]
    gaps: List[str]
    missing_in_resume: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    explanation: str
    experience_alignment: str
    is_shortlisted: bool = False


class ScreeningSessionResponse(BaseModel):
    session_id: str
    job_id: str
    job_title: str
    total_resumes: int
    avg_score: float
    created_at: datetime
    results: List[CandidateMatchReport]


class ShortlistToggleRequest(BaseModel):
    candidate_id: str
    job_id: Optional[str] = None
    notes: Optional[str] = None


# --- Dashboard Stats Schemas ---
class DashboardStats(BaseModel):
    total_resumes_screened: int
    avg_match_score: float
    top_candidate_name: Optional[str]
    top_candidate_score: Optional[float]
    shortlisted_count: int
    total_jobs_analyzed: int
    score_distribution: Dict[str, int]
    top_matched_skills: List[Dict[str, Any]]
    common_skill_gaps: List[Dict[str, Any]]
    recent_sessions: List[Dict[str, Any]]
