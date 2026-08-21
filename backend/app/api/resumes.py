from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.parsers.resume_parser import ResumeParser
from app.schemas.schemas import ParsedResume

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.post("/upload", response_model=ParsedResume)
async def upload_and_parse_resume(file: UploadFile = File(...)):
    """Upload a single PDF/TXT resume and return extracted structured JSON."""
    filename = file.filename or "resume.pdf"
    if not (filename.lower().endswith(".pdf") or filename.lower().endswith(".txt")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and TXT file formats are supported."
        )

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 10MB limit."
        )

    try:
        if filename.lower().endswith(".pdf"):
            raw_text = ResumeParser.extract_text_from_pdf_bytes(content)
        else:
            raw_text = content.decode("utf-8", errors="ignore")

        if not raw_text or len(raw_text.strip()) < 20:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to extract readable text from resume document."
            )

        parsed_data = ResumeParser.parse_resume_text(raw_text)
        return parsed_data

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process resume: {str(e)}"
        )
