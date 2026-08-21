from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database.session import get_db
from app.database.models import Candidate, Job, ScreeningSession, ScreeningResult, Shortlist
from app.schemas.schemas import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    sr_res = await db.execute(select(ScreeningResult))
    all_results = sr_res.scalars().all()
    
    total_screened = len(all_results)
    avg_score = round(sum([r.overall_score for r in all_results]) / total_screened, 1) if total_screened > 0 else 0.0

    top_name = None
    top_score = 0.0
    if all_results:
        top_res = max(all_results, key=lambda r: r.overall_score)
        top_score = top_res.overall_score
        c_res = await db.execute(select(Candidate).where(Candidate.id == top_res.candidate_id))
        cand = c_res.scalars().first()
        if cand:
            top_name = cand.name

    sl_res = await db.execute(select(func.count(Shortlist.id)))
    shortlisted_count = sl_res.scalar() or 0

    j_res = await db.execute(select(func.count(Job.id)))
    jobs_count = j_res.scalar() or 0

    dist = {
        "Exceptional (90-100)": 0,
        "Strong (80-89)": 0,
        "Good (70-79)": 0,
        "Moderate (60-69)": 0,
        "Low (<60)": 0
    }
    for r in all_results:
        if r.overall_score >= 90:
            dist["Exceptional (90-100)"] += 1
        elif r.overall_score >= 80:
            dist["Strong (80-89)"] += 1
        elif r.overall_score >= 70:
            dist["Good (70-79)"] += 1
        elif r.overall_score >= 60:
            dist["Moderate (60-69)"] += 1
        else:
            dist["Low (<60)"] += 1

    all_matched = []
    all_missing = []
    for r in all_results:
        if r.matched_skills:
            all_matched.extend(r.matched_skills)
        if r.missing_skills:
            all_missing.extend(r.missing_skills)

    matched_counts = Counter(all_matched).most_common(6)
    missing_counts = Counter(all_missing).most_common(6)

    top_matched_skills = [{"skill": k, "count": v} for k, v in matched_counts]
    common_skill_gaps = [{"skill": k, "count": v} for k, v in missing_counts]

    sess_res = await db.execute(
        select(ScreeningSession).order_by(ScreeningSession.created_at.desc()).limit(5)
    )
    sessions = sess_res.scalars().all()
    
    recent_sessions = []
    for s in sessions:
        j_r = await db.execute(select(Job).where(Job.id == s.job_id))
        j = j_r.scalars().first()
        recent_sessions.append({
            "session_id": s.id,
            "job_title": j.title if j else "Software Role",
            "total_resumes": s.total_resumes,
            "avg_score": s.avg_score,
            "created_at": s.created_at.strftime("%Y-%m-%d %H:%M")
        })

    return DashboardStats(
        total_resumes_screened=total_screened,
        avg_match_score=avg_score,
        top_candidate_name=top_name,
        top_candidate_score=top_score,
        shortlisted_count=shortlisted_count,
        total_jobs_analyzed=jobs_count,
        score_distribution=dist,
        top_matched_skills=top_matched_skills,
        common_skill_gaps=common_skill_gaps,
        recent_sessions=recent_sessions
    )
