from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.database.session import get_db
from app.database.models import Candidate, ScreeningResult, Resume, Job, Shortlist
from app.schemas.schemas import ShortlistToggleRequest, ScoreBreakdown

router = APIRouter(prefix="/candidates", tags=["Candidates"])


@router.get("")
async def list_candidates(
    search: Optional[str] = Query(None),
    min_score: Optional[float] = Query(None),
    recommendation: Optional[str] = Query(None),
    shortlisted_only: Optional[bool] = Query(False),
    session_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Candidate)
    
    if session_id:
        stmt = stmt.join(ScreeningResult).where(ScreeningResult.session_id == session_id)
    
    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            (Candidate.name.ilike(pattern)) |
            (Candidate.email.ilike(pattern)) |
            (Candidate.location.ilike(pattern))
        )

    res = await db.execute(stmt)
    candidates = res.scalars().all()

    cand_list = []
    for cand in candidates:
        sr_res = await db.execute(
            select(ScreeningResult)
            .where(ScreeningResult.candidate_id == cand.id)
            .order_by(ScreeningResult.created_at.desc())
        )
        latest_sr = sr_res.scalars().first()

        sl_res = await db.execute(
            select(Shortlist).where(Shortlist.candidate_id == cand.id)
        )
        is_shortlisted = sl_res.scalars().first() is not None

        if shortlisted_only and not is_shortlisted:
            continue

        if min_score is not None and latest_sr:
            if latest_sr.overall_score < min_score:
                continue

        if recommendation and latest_sr:
            if latest_sr.recommendation.lower() != recommendation.lower():
                continue

        cand_dict = {
            "id": cand.id,
            "name": cand.name,
            "email": cand.email,
            "phone": cand.phone,
            "location": cand.location,
            "linkedin": cand.linkedin,
            "github": cand.github,
            "portfolio": cand.portfolio,
            "summary": cand.summary,
            "is_shortlisted": is_shortlisted,
            "created_at": cand.created_at,
            "latest_screening": {
                "overall_score": latest_sr.overall_score if latest_sr else 0.0,
                "score_category": latest_sr.score_category if latest_sr else "N/A",
                "recommendation": latest_sr.recommendation if latest_sr else "N/A",
                "matched_skills": latest_sr.matched_skills if latest_sr else [],
                "missing_skills": latest_sr.missing_skills if latest_sr else [],
                "job_id": latest_sr.job_id if latest_sr else None,
                "sub_scores": {
                    "skill_match": latest_sr.skill_match_score if latest_sr else 0,
                    "semantic_fit": latest_sr.semantic_fit_score if latest_sr else 0,
                    "experience": latest_sr.experience_score if latest_sr else 0,
                    "projects": latest_sr.project_score if latest_sr else 0
                } if latest_sr else {}
            } if latest_sr else None
        }
        cand_list.append(cand_dict)

    cand_list.sort(
        key=lambda c: (c["latest_screening"]["overall_score"] if c["latest_screening"] else 0),
        reverse=True
    )
    return cand_list


@router.get("/{candidate_id}")
async def get_candidate_detail(candidate_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Candidate).where(Candidate.id == candidate_id))
    cand = res.scalars().first()
    if not cand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found.")

    r_res = await db.execute(
        select(Resume).where(Resume.candidate_id == candidate_id).order_by(Resume.created_at.desc())
    )
    resume = r_res.scalars().first()

    sr_res = await db.execute(
        select(ScreeningResult)
        .where(ScreeningResult.candidate_id == candidate_id)
        .order_by(ScreeningResult.created_at.desc())
    )
    sr = sr_res.scalars().first()

    job_title = None
    if sr:
        j_res = await db.execute(select(Job).where(Job.id == sr.job_id))
        job = j_res.scalars().first()
        if job:
            job_title = job.title

    sl_res = await db.execute(select(Shortlist).where(Shortlist.candidate_id == candidate_id))
    is_shortlisted = sl_res.scalars().first() is not None

    return {
        "candidate": {
            "id": cand.id,
            "name": cand.name,
            "email": cand.email,
            "phone": cand.phone,
            "location": cand.location,
            "linkedin": cand.linkedin,
            "github": cand.github,
            "portfolio": cand.portfolio,
            "summary": cand.summary,
            "is_shortlisted": is_shortlisted,
            "created_at": cand.created_at
        },
        "parsed_resume": resume.parsed_json if resume else None,
        "raw_text": resume.raw_text if resume else None,
        "screening_analysis": {
            "job_id": sr.job_id if sr else None,
            "job_title": job_title or "Software Role",
            "overall_score": sr.overall_score if sr else 0.0,
            "score_category": sr.score_category if sr else "N/A",
            "recommendation": sr.recommendation if sr else "N/A",
            "sub_scores": {
                "skill_match": sr.skill_match_score if sr else 0,
                "semantic_fit": sr.semantic_fit_score if sr else 0,
                "experience": sr.experience_score if sr else 0,
                "projects": sr.project_score if sr else 0,
                "education": sr.education_score if sr else 0,
                "certifications": sr.certification_score if sr else 0,
                "keywords": sr.keyword_score if sr else 0
            },
            "matched_skills": sr.matched_skills if sr else [],
            "missing_skills": sr.missing_skills if sr else [],
            "additional_skills": sr.additional_skills if sr else [],
            "strengths": sr.strengths if sr else [],
            "gaps": sr.gaps if sr else [],
            "missing_in_resume": sr.missing_in_resume if sr else [],
            "recommendations": sr.recommendations if sr else [],
            "explanation": sr.explanation if sr else "",
            "experience_alignment": sr.experience_alignment if sr else ""
        } if sr else None
    }


@router.get("/{candidate_id}/interview-questions")
async def get_tailored_interview_questions(candidate_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Candidate).where(Candidate.id == candidate_id))
    cand = res.scalars().first()
    if not cand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found.")

    sr_res = await db.execute(
        select(ScreeningResult)
        .where(ScreeningResult.candidate_id == candidate_id)
        .order_by(ScreeningResult.created_at.desc())
    )
    sr = sr_res.scalars().first()

    matched = sr.matched_skills if sr and sr.matched_skills else ["Python", "FastAPI", "React"]
    missing = sr.missing_skills if sr and sr.missing_skills else ["Kubernetes", "AWS"]

    questions = []
    
    for gap in missing[:2]:
        questions.append({
            "category": "Skill Gap Probing",
            "target_skill": gap,
            "question": f"We noticed {gap} was not explicitly listed on your resume. What experience do you have working with {gap} or equivalent technologies in production environments?",
            "what_to_listen_for": f"Assess candidate's ability to quickly pick up {gap} or explain how they handled equivalent infrastructure challenges."
        })

    for skill in matched[:2]:
        questions.append({
            "category": "Technical Deep Dive",
            "target_skill": skill,
            "question": f"Can you walk us through a recent project where you utilized {skill}? What were the primary architectural trade-offs you made?",
            "what_to_listen_for": f"Look for concrete production experience, performance tuning, and clear architectural reasoning with {skill}."
        })

    questions.append({
        "category": "Behavioral & Production Ownership",
        "target_skill": "Production Systems",
        "question": "Tell us about a time a production deployment experienced unexpected latency or downtime. How did you diagnose the issue under pressure?",
        "what_to_listen_for": "Listen for structured troubleshooting methodologies, logging & telemetry inspection, and post-mortem ownership."
    })

    return {
        "candidate_id": cand.id,
        "candidate_name": cand.name,
        "questions": questions
    }


@router.get("/{candidate_id}/outreach-email")
async def get_recruiter_outreach_email(candidate_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Candidate).where(Candidate.id == candidate_id))
    cand = res.scalars().first()
    if not cand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found.")

    sr_res = await db.execute(
        select(ScreeningResult)
        .where(ScreeningResult.candidate_id == candidate_id)
        .order_by(ScreeningResult.created_at.desc())
    )
    sr = sr_res.scalars().first()

    matched_str = ", ".join(sr.matched_skills[:4]) if sr and sr.matched_skills else "software engineering"

    subject = f"Opportunity: Senior Technical Role at Cognitive Cloud AI"
    body = (
        f"Hi {cand.name.split()[0]},\n\n"
        f"I came across your profile and was thoroughly impressed by your background in {matched_str}.\n\n"
        f"We are actively building our core engineering team at Cognitive Cloud AI and your experience aligned exceptionally well with what we're looking for.\n\n"
        f"Would you be open to a brief 15-minute introductory call this week to explore possibilities?\n\n"
        f"Best regards,\n"
        f"Recruiting Team\n"
        f"Cognitive Cloud AI"
    )

    return {
        "candidate_id": cand.id,
        "candidate_name": cand.name,
        "subject": subject,
        "body": body
    }


@router.post("/shortlist", status_code=status.HTTP_200_OK)
async def toggle_shortlist(req: ShortlistToggleRequest, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Shortlist).where(Shortlist.candidate_id == req.candidate_id))
    existing = res.scalars().first()

    if existing:
        await db.delete(existing)
        await db.commit()
        return {"shortlisted": False, "candidate_id": req.candidate_id}
    else:
        sl = Shortlist(candidate_id=req.candidate_id, job_id=req.job_id, notes=req.notes)
        db.add(sl)
        await db.commit()
        return {"shortlisted": True, "candidate_id": req.candidate_id}


@router.post("/compare")
async def compare_candidates(candidate_ids: List[str], db: AsyncSession = Depends(get_db)):
    if len(candidate_ids) < 2 or len(candidate_ids) > 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please select between 2 and 4 candidates to compare."
        )

    results = []
    for cand_id in candidate_ids:
        c_res = await db.execute(select(Candidate).where(Candidate.id == cand_id))
        cand = c_res.scalars().first()
        if not cand:
            continue

        r_res = await db.execute(
            select(Resume).where(Resume.candidate_id == cand_id).order_by(Resume.created_at.desc())
        )
        resume = r_res.scalars().first()

        sr_res = await db.execute(
            select(ScreeningResult)
            .where(ScreeningResult.candidate_id == cand_id)
            .order_by(ScreeningResult.created_at.desc())
        )
        sr = sr_res.scalars().first()

        results.append({
            "candidate_id": cand.id,
            "name": cand.name,
            "email": cand.email,
            "overall_score": sr.overall_score if sr else 0.0,
            "score_category": sr.score_category if sr else "N/A",
            "recommendation": sr.recommendation if sr else "N/A",
            "skill_score": sr.skill_match_score if sr else 0.0,
            "semantic_score": sr.semantic_fit_score if sr else 0.0,
            "experience_score": sr.experience_score if sr else 0.0,
            "project_score": sr.project_score if sr else 0.0,
            "education_score": sr.education_score if sr else 0.0,
            "matched_skills": sr.matched_skills if sr else [],
            "missing_skills": sr.missing_skills if sr else [],
            "strengths": sr.strengths if sr else [],
            "gaps": sr.gaps if sr else [],
            "skills": resume.parsed_json.get("skills", []) if resume and resume.parsed_json else []
        })

    return results
