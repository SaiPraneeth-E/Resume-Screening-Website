from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.session import get_db
from app.database.models import Job
from app.schemas.schemas import JobCreate, JobResponse
from app.parsers.job_parser import JobParser

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(job_in: JobCreate, db: AsyncSession = Depends(get_db)):
    parsed_dict = JobParser.parse_job_description(
        text=job_in.description,
        default_title=job_in.title,
        company=job_in.company or "Acme Corp"
    )
    
    if job_in.required_skills:
        parsed_dict["required_skills"] = list(set(parsed_dict["required_skills"] + job_in.required_skills))
    if job_in.preferred_skills:
        parsed_dict["preferred_skills"] = list(set(parsed_dict["preferred_skills"] + job_in.preferred_skills))

    db_job = Job(
        title=parsed_dict["title"],
        company=parsed_dict["company"],
        department=parsed_dict.get("department", "Engineering"),
        description=job_in.description,
        required_skills=parsed_dict["required_skills"],
        preferred_skills=parsed_dict["preferred_skills"],
        responsibilities=parsed_dict["responsibilities"],
        education_requirements=parsed_dict["education_requirements"],
        experience_requirements=parsed_dict["experience_requirements"],
        keywords=parsed_dict["keywords"]
    )
    db.add(db_job)
    await db.commit()
    await db.refresh(db_job)
    return db_job


@router.get("", response_model=List[JobResponse])
async def list_jobs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).order_by(Job.created_at.desc()))
    jobs = result.scalars().all()
    return jobs


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job description not found.")
    return job


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(job_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job description not found.")
    await db.delete(job)
    await db.commit()
    return None
