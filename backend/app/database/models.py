import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base


def generate_uuid():
    return str(uuid.uuid4())


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False, index=True)
    company = Column(String(255), nullable=True)
    department = Column(String(255), nullable=True)
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, default=list)
    preferred_skills = Column(JSON, default=list)
    responsibilities = Column(JSON, default=list)
    education_requirements = Column(JSON, default=list)
    experience_requirements = Column(JSON, default=list)
    keywords = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    screening_sessions = relationship("ScreeningSession", back_populates="job", cascade="all, delete-orphan")


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)
    linkedin = Column(String(500), nullable=True)
    github = Column(String(500), nullable=True)
    portfolio = Column(String(500), nullable=True)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    resumes = relationship("Resume", back_populates="candidate", cascade="all, delete-orphan")
    screening_results = relationship("ScreeningResult", back_populates="candidate", cascade="all, delete-orphan")
    shortlists = relationship("Shortlist", back_populates="candidate", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidates.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=True)
    raw_text = Column(Text, nullable=False)
    parsed_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="resumes")


class ScreeningSession(Base):
    __tablename__ = "screening_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    job_id = Column(String(36), ForeignKey("jobs.id"), nullable=False)
    total_resumes = Column(Integer, default=0)
    avg_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("Job", back_populates="screening_sessions")
    results = relationship("ScreeningResult", back_populates="session", cascade="all, delete-orphan")


class ScreeningResult(Base):
    __tablename__ = "screening_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("screening_sessions.id"), nullable=False)
    candidate_id = Column(String(36), ForeignKey("candidates.id"), nullable=False)
    job_id = Column(String(36), ForeignKey("jobs.id"), nullable=False)
    overall_score = Column(Float, nullable=False)
    score_category = Column(String(50), nullable=False)  # Exceptional Fit, Strong Fit, etc.
    recommendation = Column(String(50), nullable=False) # Strongly Recommended, Recommended, Consider, Not Recommended
    
    # Sub-scores
    skill_match_score = Column(Float, default=0.0)
    semantic_fit_score = Column(Float, default=0.0)
    experience_score = Column(Float, default=0.0)
    project_score = Column(Float, default=0.0)
    education_score = Column(Float, default=0.0)
    certification_score = Column(Float, default=0.0)
    keyword_score = Column(Float, default=0.0)

    # Detailed Explainable AI Analysis
    matched_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    additional_skills = Column(JSON, default=list)
    strengths = Column(JSON, default=list)
    gaps = Column(JSON, default=list)
    missing_in_resume = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    explanation = Column(Text, nullable=True)
    experience_alignment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ScreeningSession", back_populates="results")
    candidate = relationship("Candidate", back_populates="screening_results")


class Shortlist(Base):
    __tablename__ = "shortlists"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidates.id"), nullable=False)
    job_id = Column(String(36), ForeignKey("jobs.id"), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="shortlists")
