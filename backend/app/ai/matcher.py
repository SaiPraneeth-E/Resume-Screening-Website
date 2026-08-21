import os
import re
import numpy as np
from typing import Dict, List, Any, Tuple
from app.schemas.schemas import ParsedResume, ScoreBreakdown
from app.core.config import settings

_sentence_model = None


def get_sentence_model():
    global _sentence_model
    if _sentence_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _sentence_model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
        except Exception:
            _sentence_model = "FALLBACK"
    return _sentence_model


def calculate_cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    dot_prod = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(dot_prod / (norm1 * norm2))


def get_text_embedding(text: str) -> np.ndarray:
    model = get_sentence_model()
    if model != "FALLBACK" and model is not None:
        try:
            return model.encode(text, convert_to_numpy=True)
        except Exception:
            pass

    words = set(re.findall(r"\w+", text.lower()))
    vocab = sorted(list(words))
    vec = np.zeros(len(vocab))
    for idx, w in enumerate(vocab):
        vec[idx] = text.lower().count(w)
    return vec


class HybridMatcher:

    @classmethod
    def calculate_match_score(
        cls,
        resume: ParsedResume,
        job_data: Dict[str, Any]
    ) -> Tuple[ScoreBreakdown, Dict[str, Any]]:
        required_skills = set(job_data.get("required_skills", []))
        preferred_skills = set(job_data.get("preferred_skills", []))
        candidate_skills = set(resume.skills)

        matched_required = required_skills.intersection(candidate_skills)
        matched_preferred = preferred_skills.intersection(candidate_skills)

        if required_skills:
            req_ratio = len(matched_required) / len(required_skills)
        else:
            req_ratio = 1.0

        if preferred_skills:
            pref_ratio = len(matched_preferred) / len(preferred_skills)
        else:
            pref_ratio = 0.5

        skill_score = (req_ratio * 75.0) + (pref_ratio * 25.0)
        skill_score = min(100.0, max(0.0, skill_score))

        resume_full_text = f"{resume.summary} {' '.join(resume.skills)} " + \
                           " ".join([f"{e.role} {e.company}" for e in resume.experience]) + \
                           " ".join([p.title or '' for p in resume.projects])
        job_full_text = f"{job_data.get('title', '')} {job_data.get('description', '')} " + \
                        " ".join(job_data.get("responsibilities", []))

        emb_resume = get_text_embedding(resume_full_text[:1500])
        emb_job = get_text_embedding(job_full_text[:1500])

        sim = calculate_cosine_similarity(emb_resume, emb_job)
        semantic_score = float(min(100.0, max(0.0, (sim + 0.2) * 80.0)))

        total_roles = len(resume.experience)
        if total_roles >= 3:
            exp_score = 95.0
        elif total_roles == 2:
            exp_score = 85.0
        elif total_roles == 1:
            exp_score = 70.0
        else:
            exp_score = 0.0

        if exp_score > 0:
            job_title = job_data.get("title", "").lower()
            role_match = any(job_title in (exp.role or "").lower() for exp in resume.experience)
            if role_match:
                exp_score = min(100.0, exp_score + 10.0)

        if resume.projects:
            project_score = 75.0
            proj_techs = set()
            for p in resume.projects:
                proj_techs.update(p.technologies)
            if proj_techs.intersection(required_skills):
                project_score = 95.0
        else:
            project_score = 0.0

        if resume.education:
            degrees = " ".join([e.degree or '' for e in resume.education]).lower()
            if "master" in degrees or "ph.d" in degrees or "m.tech" in degrees:
                education_score = 100.0
            elif "bachelor" in degrees or "b.s" in degrees or "b.tech" in degrees or "b.e" in degrees:
                education_score = 85.0
            else:
                education_score = 70.0
        else:
            education_score = 0.0

        if resume.certifications:
            cert_score = 90.0
        else:
            cert_score = 0.0

        keyword_score = 70.0
        matched_keywords = candidate_skills.intersection(set(job_data.get("keywords", [])))
        if job_data.get("keywords"):
            keyword_score = min(100.0, (len(matched_keywords) / len(job_data["keywords"])) * 100.0 + 30.0)

        overall_score = (
            (skill_score * 0.35) +
            (semantic_score * 0.25) +
            (exp_score * 0.15) +
            (project_score * 0.10) +
            (education_score * 0.05) +
            (cert_score * 0.05) +
            (keyword_score * 0.05)
        )
        overall_score = round(float(overall_score), 1)

        if overall_score >= 90.0:
            category = "Exceptional Fit"
            recommendation = "Strongly Recommended"
        elif overall_score >= 80.0:
            category = "Strong Fit"
            recommendation = "Recommended"
        elif overall_score >= 70.0:
            category = "Good Fit"
            recommendation = "Consider"
        elif overall_score >= 60.0:
            category = "Moderate Fit"
            recommendation = "Consider"
        else:
            category = "Low Fit"
            recommendation = "Not Recommended"

        breakdown = ScoreBreakdown(
            overall_score=overall_score,
            score_category=category,
            recommendation=recommendation,
            skill_match_score=round(skill_score, 1),
            semantic_fit_score=round(semantic_score, 1),
            experience_score=round(exp_score, 1),
            project_score=round(project_score, 1),
            education_score=round(education_score, 1),
            certification_score=round(cert_score, 1),
            keyword_score=round(keyword_score, 1)
        )

        matched_skills = sorted(list(candidate_skills.intersection(required_skills.union(preferred_skills))))
        missing_skills = sorted(list(required_skills.difference(candidate_skills)))
        additional_skills = sorted(list(candidate_skills.difference(required_skills.union(preferred_skills))))

        aux_data = {
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "additional_skills": additional_skills,
        }

        return breakdown, aux_data
