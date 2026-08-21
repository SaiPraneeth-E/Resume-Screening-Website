import pytest
import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.parsers.skill_taxonomy import normalize_skill, extract_skills_from_text
from app.parsers.resume_parser import ResumeParser
from app.parsers.job_parser import JobParser
from app.ai.matcher import HybridMatcher


def test_skill_normalization():
    assert normalize_skill("js") == "JavaScript"
    assert normalize_skill("reactjs") == "React"
    assert normalize_skill("py") == "Python"
    assert normalize_skill("k8s") == "Kubernetes"
    assert normalize_skill("postgres") == "PostgreSQL"


def test_skill_extraction_from_text():
    sample_text = "Experienced in Python, ReactJS, FastAPI, Docker, and PostgreSQL databases."
    skills = extract_skills_from_text(sample_text)
    assert "Python" in skills
    assert "React" in skills
    assert "FastAPI" in skills
    assert "Docker" in skills
    assert "PostgreSQL" in skills


def test_resume_parser_contact_info():
    raw = """
    Sai Praneeth
    San Francisco, CA | saipraneeth@dev.io | linkedin.com/in/saipraneeth
    
    SKILLS:
    Python, FastAPI, React, Docker, Kubernetes.
    
    EXPERIENCE:
    Senior Engineer at Cognitive Cloud Inc (2022 - Present)
    - Developed AI screening engine with PyTorch and FastAPI.
    """
    parsed = ResumeParser.parse_resume_text(raw)
    assert parsed.candidate.name == "Sai Praneeth"
    assert parsed.candidate.email == "saipraneeth@dev.io"
    assert "Python" in parsed.skills
    assert "FastAPI" in parsed.skills


def test_job_parser():
    jd_text = """
    Senior Full Stack Engineer
    Company: Cognitive Cloud AI
    Required Skills: Python, FastAPI, React, PostgreSQL.
    Preferred Skills: Docker, AWS.
    Responsibilities:
    - Build scalable API services in Python.
    """
    parsed_jd = JobParser.parse_job_description(jd_text, default_title="Software Engineer")
    assert "Python" in parsed_jd["required_skills"]
    assert "FastAPI" in parsed_jd["required_skills"]


def test_hybrid_matching_score():
    raw_resume = """
    Sai Praneeth
    saipraneeth@dev.io
    
    SKILLS:
    Python, FastAPI, React, TypeScript, Docker, PostgreSQL, Machine Learning, PyTorch, AWS.
    
    EXPERIENCE:
    Senior AI Engineer at Cognitive Cloud Inc (2022 - Present)
    - Built scalable backend services with Python and FastAPI.
    Senior Developer at Tech Systems (2020 - 2022)
    - Engineered React frontend and PostgreSQL databases.
    Developer at Cloud Labs (2018 - 2020)
    - Managed Docker microservices.
    
    PROJECTS:
    AI Resume Screener Platform
    - Built platform with Python, FastAPI, React, and PostgreSQL.
    
    EDUCATION:
    Master of Science in Computer Science - Stanford University (2018)
    
    CERTIFICATIONS:
    AWS Certified Solutions Architect
    """
    parsed_res = ResumeParser.parse_resume_text(raw_resume)

    job_data = {
        "title": "Senior AI Engineer",
        "company": "Cognitive Cloud",
        "description": "Building AI backend services with Python, FastAPI and React",
        "required_skills": ["Python", "FastAPI", "React", "Docker", "PostgreSQL"],
        "preferred_skills": ["PyTorch", "AWS"],
        "responsibilities": ["Build backend services in Python and FastAPI"],
        "keywords": ["Python", "FastAPI", "React", "Docker", "PostgreSQL"]
    }

    breakdown, aux = HybridMatcher.calculate_match_score(parsed_res, job_data)
    assert breakdown.overall_score >= 80.0
    assert "Python" in aux["matched_skills"]
    assert breakdown.score_category in ["Exceptional Fit", "Strong Fit"]
