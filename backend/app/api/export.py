import csv
import io
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.session import get_db
from app.database.models import Candidate, ScreeningResult, Job

router = APIRouter(prefix="/export", tags=["Export"])


@router.get("/csv")
async def export_screening_results_csv(
    job_id: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """Export candidate screening report as CSV file for a given job."""
    j_res = await db.execute(select(Job).where(Job.id == job_id))
    job = j_res.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")

    res = await db.execute(
        select(ScreeningResult).where(ScreeningResult.job_id == job_id).order_by(ScreeningResult.overall_score.desc())
    )
    results = res.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "Rank", "Candidate Name", "Email", "Overall Match %", "Category", 
        "Recommendation", "Skill Score", "Semantic Fit", "Experience Score",
        "Matched Skills", "Missing Skills", "Explanation"
    ])

    for rank, r in enumerate(results, 1):
        c_res = await db.execute(select(Candidate).where(Candidate.id == r.candidate_id))
        cand = c_res.scalar_one_or_none()
        c_name = cand.name if cand else "Candidate"
        c_email = cand.email if cand else ""

        writer.writerow([
            rank,
            c_name,
            c_email,
            r.overall_score,
            r.score_category,
            r.recommendation,
            r.skill_match_score,
            r.semantic_fit_score,
            r.experience_score,
            "; ".join(r.matched_skills or []),
            "; ".join(r.missing_skills or []),
            r.explanation or ""
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=screening_results_{job_id[:8]}.csv"}
    )
