from typing import List, Optional
from fastapi import APIRouter, Depends, Form, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.session import get_db
from app.database.models import Job, Candidate, Resume, ScreeningSession, ScreeningResult, Shortlist
from app.schemas.schemas import ScreeningSessionResponse, CandidateMatchReport, ScoreBreakdown
from app.parsers.resume_parser import ResumeParser
from app.parsers.job_parser import JobParser
from app.ai.matcher import HybridMatcher
from app.ai.llm_provider import get_ai_provider

router = APIRouter(prefix="/screen", tags=["Screening"])


@router.post("", response_model=ScreeningSessionResponse)
async def screen_resumes(
    job_id: Optional[str] = Form(None),
    job_title: Optional[str] = Form("Software Engineer"),
    company: Optional[str] = Form("Acme Corp"),
    job_description: Optional[str] = Form(None),
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db)
):
    if not files or len(files) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one resume file must be uploaded.")

    db_job = None
    if job_id:
        result = await db.execute(select(Job).where(Job.id == job_id))
        db_job = result.scalar_one_or_none()

    if not db_job:
        if not job_description or len(job_description.strip()) < 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either a valid job_id or a detailed job_description text must be provided."
            )
        parsed_job = JobParser.parse_job_description(
            text=job_description,
            default_title=job_title or "Software Engineer",
            company=company or "Acme Corp"
        )
        db_job = Job(
            title=parsed_job["title"],
            company=parsed_job["company"],
            department=parsed_job.get("department", "Engineering"),
            description=job_description,
            required_skills=parsed_job["required_skills"],
            preferred_skills=parsed_job["preferred_skills"],
            responsibilities=parsed_job["responsibilities"],
            education_requirements=parsed_job["education_requirements"],
            experience_requirements=parsed_job["experience_requirements"],
            keywords=parsed_job["keywords"]
        )
        db.add(db_job)
        await db.flush()

    job_data_dict = {
        "title": db_job.title,
        "company": db_job.company,
        "description": db_job.description,
        "required_skills": db_job.required_skills or [],
        "preferred_skills": db_job.preferred_skills or [],
        "responsibilities": db_job.responsibilities or [],
        "keywords": db_job.keywords or []
    }

    ai_provider = get_ai_provider()

    session = ScreeningSession(job_id=db_job.id, total_resumes=len(files), avg_score=0.0)
    db.add(session)
    await db.flush()

    reports: List[CandidateMatchReport] = []
    total_scores_sum = 0.0

    for upload_file in files:
        fname = upload_file.filename or "resume.pdf"
        file_bytes = await upload_file.read()

        try:
            if fname.lower().endswith(".pdf"):
                raw_text = ResumeParser.extract_text_from_pdf_bytes(file_bytes)
            else:
                raw_text = file_bytes.decode("utf-8", errors="ignore")
        except Exception:
            continue

        if not raw_text or len(raw_text.strip()) < 15:
            continue

        parsed_resume = ResumeParser.parse_resume_text(raw_text)

        cand_email = parsed_resume.candidate.email
        cand_name = parsed_resume.candidate.name or "Candidate"

        db_cand = None
        if cand_email:
            res = await db.execute(select(Candidate).where(Candidate.email == cand_email))
            db_cand = res.scalar_one_or_none()

        if not db_cand:
            db_cand = Candidate(
                name=cand_name,
                email=cand_email,
                phone=parsed_resume.candidate.phone,
                location=parsed_resume.candidate.location,
                linkedin=parsed_resume.candidate.linkedin,
                github=parsed_resume.candidate.github,
                portfolio=parsed_resume.candidate.portfolio,
                summary=parsed_resume.summary
            )
            db.add(db_cand)
            await db.flush()
        else:
            db_cand.name = cand_name
            if parsed_resume.candidate.phone: db_cand.phone = parsed_resume.candidate.phone
            if parsed_resume.candidate.location: db_cand.location = parsed_resume.candidate.location
            if parsed_resume.candidate.linkedin: db_cand.linkedin = parsed_resume.candidate.linkedin
            if parsed_resume.candidate.github: db_cand.github = parsed_resume.candidate.github
            if parsed_resume.candidate.portfolio: db_cand.portfolio = parsed_resume.candidate.portfolio
            if parsed_resume.summary: db_cand.summary = parsed_resume.summary
            await db.flush()

        db_resume = Resume(
            candidate_id=db_cand.id,
            filename=fname,
            raw_text=raw_text,
            parsed_json=parsed_resume.model_dump()
        )
        db.add(db_resume)
        await db.flush()

        breakdown, aux_data = HybridMatcher.calculate_match_score(parsed_resume, job_data_dict)
        ai_output = await ai_provider.generate_explanation(parsed_resume, job_data_dict, breakdown, aux_data)

        if ai_output.get("is_llm") and "fit_rating" in ai_output and isinstance(ai_output["fit_rating"], (int, float)):
            breakdown.overall_score = float(ai_output["fit_rating"]) * 10.0
            
            score = breakdown.overall_score
            if score >= 85:
                breakdown.score_category = "Strong Fit"
                breakdown.recommendation = "Highly Recommended"
            elif score >= 70:
                breakdown.score_category = "Good Fit"
                breakdown.recommendation = "Recommended"
            elif score >= 50:
                breakdown.score_category = "Partial Fit"
                breakdown.recommendation = "Consider with reservations"
            else:
                breakdown.score_category = "Weak Fit"
                breakdown.recommendation = "Not Recommended"

        sl_res = await db.execute(
            select(Shortlist).where(Shortlist.candidate_id == db_cand.id, Shortlist.job_id == db_job.id)
        )
        is_shortlisted = sl_res.scalar_one_or_none() is not None

        result_rec = ScreeningResult(
            session_id=session.id,
            candidate_id=db_cand.id,
            job_id=db_job.id,
            overall_score=breakdown.overall_score,
            score_category=breakdown.score_category,
            recommendation=breakdown.recommendation,
            skill_match_score=breakdown.skill_match_score,
            semantic_fit_score=breakdown.semantic_fit_score,
            experience_score=breakdown.experience_score,
            project_score=breakdown.project_score,
            education_score=breakdown.education_score,
            certification_score=breakdown.certification_score,
            keyword_score=breakdown.keyword_score,
            matched_skills=aux_data["matched_skills"],
            missing_skills=aux_data["missing_skills"],
            additional_skills=aux_data["additional_skills"],
            strengths=ai_output.get("strengths", []),
            gaps=ai_output.get("gaps", []),
            missing_in_resume=ai_output.get("missing_in_resume", []),
            recommendations=ai_output.get("recommendations_to_add", []),
            explanation=ai_output.get("explanation", ""),
            experience_alignment=ai_output.get("experience_alignment", "")
        )
        db.add(result_rec)

        total_scores_sum += breakdown.overall_score

        report = CandidateMatchReport(
            candidate_id=db_cand.id,
            candidate_name=db_cand.name,
            email=db_cand.email,
            match_scores=breakdown,
            matched_skills=aux_data["matched_skills"],
            missing_skills=aux_data["missing_skills"],
            additional_skills=aux_data["additional_skills"],
            strengths=ai_output.get("strengths", []),
            gaps=ai_output.get("gaps", []),
            missing_in_resume=ai_output.get("missing_in_resume", []),
            recommendations=ai_output.get("recommendations_to_add", []),
            explanation=ai_output.get("explanation", ""),
            experience_alignment=ai_output.get("experience_alignment", ""),
            is_shortlisted=is_shortlisted
        )
        reports.append(report)

    reports.sort(key=lambda r: r.match_scores.overall_score, reverse=True)

    if reports:
        session.avg_score = round(total_scores_sum / len(reports), 1)
        session.total_resumes = len(reports)

    await db.commit()

    return ScreeningSessionResponse(
        session_id=session.id,
        job_id=db_job.id,
        job_title=db_job.title,
        total_resumes=len(reports),
        avg_score=session.avg_score,
        created_at=session.created_at,
        results=reports
    )
