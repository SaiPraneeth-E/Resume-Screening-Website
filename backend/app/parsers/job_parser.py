import re
from typing import Dict, List, Any
from app.parsers.skill_taxonomy import extract_skills_from_text, normalize_skill


class JobParser:

    @classmethod
    def parse_job_description(cls, text: str, default_title: str = "Software Engineer", company: str = "Acme Corp") -> Dict[str, Any]:
        """Parse raw job description text into structured requirement dictionary."""
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        
        # Title heuristic
        title = default_title
        for line in lines[:3]:
            if any(term in line.lower() for term in ["engineer", "developer", "architect", "lead", "scientist", "manager", "analyst"]):
                title = line.strip()
                break

        # Segment required vs preferred skills
        required_skills = []
        preferred_skills = []

        req_section = ""
        pref_section = ""

        req_match = re.search(r"(required|must have|requirements|qualifications):?(.*?)(preferred|nice to have|bonus|plus|$)", text, re.IGNORECASE | re.DOTALL)
        if req_match:
            req_section = req_match.group(2)

        pref_match = re.search(r"(preferred|nice to have|bonus|plus):?(.*?)$", text, re.IGNORECASE | re.DOTALL)
        if pref_match:
            pref_section = pref_match.group(2)

        if req_section:
            required_skills = extract_skills_from_text(req_section)
        
        if pref_section:
            preferred_skills = extract_skills_from_text(pref_section)

        # Fallback if no specific section splitting found
        all_skills = extract_skills_from_text(text)
        if not required_skills:
            required_skills = all_skills[:int(len(all_skills) * 0.7)] or all_skills
        if not preferred_skills:
            preferred_skills = [s for s in all_skills if s not in required_skills]

        # Extract Responsibilities
        responsibilities = []
        resp_match = re.search(r"(responsibilities|duties|what you will do|key responsibilities):?(.*?)(requirements|qualifications|skills|$)", text, re.IGNORECASE | re.DOTALL)
        if resp_match:
            resp_block = resp_match.group(2)
            responsibilities = [line.strip().strip("•-* ") for line in resp_block.split("\n") if len(line.strip()) > 10][:6]

        if not responsibilities:
            responsibilities = [
                "Design, develop, and deploy scalable software features.",
                "Collaborate with team members to enforce architectural best practices.",
                "Optimize performance, write comprehensive unit tests, and maintain codebase health."
            ]

        # Extract Education & Experience requirements
        education_requirements = []
        exp_requirements = []

        if re.search(r"\b(bachelor|master|degree|computer science|bs|ms)\b", text, re.IGNORECASE):
            education_requirements.append("Bachelor's degree in Computer Science, Software Engineering, or related technical field.")

        exp_years = re.findall(r"\b(\d{1,2}\+?\s*(?:years?|yrs?))\b", text, re.IGNORECASE)
        if exp_years:
            exp_requirements.append(f"Minimum {exp_years[0]} of relevant software engineering experience.")
        else:
            exp_requirements.append("2+ years of professional software engineering experience.")

        keywords = sorted(list(set(required_skills + preferred_skills)))

        return {
            "title": title,
            "company": company,
            "department": "Engineering",
            "description": text,
            "required_skills": required_skills,
            "preferred_skills": preferred_skills,
            "responsibilities": responsibilities,
            "education_requirements": education_requirements,
            "experience_requirements": exp_requirements,
            "keywords": keywords
        }
