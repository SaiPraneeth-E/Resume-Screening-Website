import os
import json
import httpx
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from app.core.config import settings
from app.schemas.schemas import ParsedResume, ScoreBreakdown


class BaseAIProvider(ABC):

    @abstractmethod
    async def generate_explanation(
        self,
        resume: ParsedResume,
        job_data: Dict[str, Any],
        scores: ScoreBreakdown,
        aux_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        pass


class LocalFallbackAIProvider(BaseAIProvider):

    async def generate_explanation(
        self,
        resume: ParsedResume,
        job_data: Dict[str, Any],
        scores: ScoreBreakdown,
        aux_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        matched_skills = aux_data.get("matched_skills", [])
        missing_skills = aux_data.get("missing_skills", [])
        candidate_name = resume.candidate.name or "The candidate"

        strengths = []
        if matched_skills:
            strengths.append(f"Demonstrated proficiency in core required skills: {', '.join(matched_skills[:4])}.")
        if scores.experience_score >= 70:
            exp_count = len(resume.experience)
            strengths.append(f"Recorded {exp_count} relevant role(s) aligning with software development requirements.")
        if scores.project_score >= 70:
            strengths.append(f"Project experience documented with {len(resume.projects)} key technical portfolio project(s).")
        if resume.education:
            deg = resume.education[0].degree or "Higher Education"
            strengths.append(f"Educational background verified ({deg}).")

        if not strengths:
            strengths.append("Found basic contact profile and resume content.")

        gaps = []
        if missing_skills:
            gaps.append(f"Missing explicit evidence for required skills: {', '.join(missing_skills[:4])}.")
        else:
            gaps.append("No critical required skill gaps identified against job description.")

        if scores.experience_score == 0:
            gaps.append("No formal employment experience section extracted from resume text.")
        elif scores.experience_score < 70:
            gaps.append("Limited documented work history for the target position level.")

        if not resume.projects:
            gaps.append("No dedicated technical project portfolio section identified.")

        missing_in_resume = []
        if missing_skills:
            missing_in_resume.append(f"Required technical skills missing: {', '.join(missing_skills[:3])}.")
        if not resume.certifications:
            missing_in_resume.append("No industry certifications or specialized course badges listed.")
        if not resume.projects:
            missing_in_resume.append("Missing detailed project breakdowns with metric impacts.")
        if not missing_in_resume:
            missing_in_resume.append("All primary expected candidate sections were identified.")

        recommendations = []
        if missing_skills:
            recommendations.append(f"Incorporate project work or bullet points highlighting {missing_skills[0]}.")
        if not resume.projects:
            recommendations.append("Add a 'Projects' section featuring 2-3 key technical applications.")
        if scores.semantic_fit_score < 60:
            recommendations.append("Tailor summary and bullet points to include exact terminology from the job description.")
        if not recommendations:
            recommendations.append("Ensure online links (GitHub, LinkedIn, Portfolio) are verified and accessible.")

        explanation = (
            f"{candidate_name} achieved an overall match score of {scores.overall_score}% ({scores.score_category}). "
            f"Key strengths: {', '.join(matched_skills[:3]) if matched_skills else 'general technical exposure'}. "
            f"Recommendation: {scores.recommendation}."
        )

        exp_alignment = (
            f"Candidate has {len(resume.experience)} experience entry(ies) and {len(matched_skills)} matched skill(s) "
            f"relative to {job_data.get('title', 'the role')} requirements."
        )

        return {
            "fit_rating": max(1, min(10, round(scores.overall_score / 10))),
            "strengths": strengths,
            "gaps": gaps,
            "missing_in_resume": missing_in_resume,
            "recommendations_to_add": recommendations,
            "explanation": explanation,
            "experience_alignment": exp_alignment
        }


class OpenAIProvider(BaseAIProvider):

    def __init__(self, api_key: str):
        self.api_key = api_key

    async def generate_explanation(
        self,
        resume: ParsedResume,
        job_data: Dict[str, Any],
        scores: ScoreBreakdown,
        aux_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        if not self.api_key:
            return await LocalFallbackAIProvider().generate_explanation(resume, job_data, scores, aux_data)

        prompt_path = os.path.join(os.path.dirname(__file__), "prompts", "explanation.txt")
        try:
            with open(prompt_path, "r", encoding="utf-8") as f:
                template = f.read()

            prompt = template.format(
                job_title=job_data.get("title", "Software Role"),
                required_skills=", ".join(job_data.get("required_skills", [])),
                preferred_skills=", ".join(job_data.get("preferred_skills", [])),
                candidate_name=resume.candidate.name,
                candidate_skills=", ".join(resume.skills),
                experience_summary="; ".join([f"{e.role} at {e.company}" for e in resume.experience]),
                education_summary="; ".join([f"{e.degree} from {e.institution}" for e in resume.education]),
                overall_score=scores.overall_score,
                matched_skills=", ".join(aux_data.get("matched_skills", [])),
                missing_skills=", ".join(aux_data.get("missing_skills", []))
            )

            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "gpt-3.5-turbo",
                        "messages": [
                            {"role": "system", "content": "You are a professional technical recruiter. Return JSON output only."},
                            {"role": "user", "content": prompt}
                        ],
                        "response_format": {"type": "json_object"},
                        "temperature": 0.3
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"]["content"]
                    parsed = json.loads(content)
                    
                    if "justification" in parsed and "explanation" not in parsed:
                        parsed["explanation"] = parsed["justification"]
                        
                    parsed["is_llm"] = True
                    return parsed
        except Exception:
            pass

        return await LocalFallbackAIProvider().generate_explanation(resume, job_data, scores, aux_data)


def get_ai_provider() -> BaseAIProvider:
    provider_name = settings.AI_PROVIDER.lower()
    api_key = settings.AI_API_KEY

    if provider_name == "openai" and api_key:
        return OpenAIProvider(api_key=api_key)
    return LocalFallbackAIProvider()
