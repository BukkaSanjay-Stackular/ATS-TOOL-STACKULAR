from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="JD Maker API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev, update in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

class JDRequest(BaseModel):
    role_title: str
    department: str
    employment_type: str # Internship or Full-Time
    duration: Optional[str] = None
    location: str
    work_mode: str # On-site / Hybrid / Remote
    working_hours: Optional[str] = None
    compensation: Optional[str] = None
    full_time_offer_details: Optional[str] = None
    responsibilities: Optional[str] = None
    required_skills: Optional[str] = None
    nice_to_have_skills: Optional[str] = None
    who_can_apply: Optional[str] = None
    tone: str # Professional, Friendly & Energetic, Technical Deep-Dive
    additional_notes: Optional[str] = None

class JDResponse(BaseModel):
    generated_jd: str

@app.post("/api/generate-jd", response_model=JDResponse)
async def generate_jd(request: JDRequest):
    if not client:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured on server.")

    # System prompt defining voice and structure constraint
    system_prompt = f"""
    You are an expert HR copywriter for Stackular. Your task is to write high-quality, perfectly formatted Job Descriptions (JDs) based on structured input.
    
    The desired tone for this JD is: {request.tone}.
    Make sure the voice aligns with this tone. Stackular is modern, professional, and innovative.
    
    Structure the Job Description clearly in markdown. Use these sections:
    - # Role
    - ## Internship Duration
    - ## Location
    - ## Work Mode
    - ## Working Hours
    - ## Stipend
    - ## Full-time Offer Details (Must be included only if the employment type is internship)
    - ## About us: At Stackular, we are more than just a team – we are a product development
community driven by a shared vision. Our values shape who we are, what we do, and how
we interact with our peers and our customers. We're not just seeking any regular engineer;
we want individuals who identify with our core values and are passionate about software
development.
    - ## Role Overview
    - ## Key Responsibilities
    - ## Requirements & Skills
    - ## What We Offer (Compensation, Perks, etc.), only include this if the employment type is full-time.
    - ## Who can apply
    
    Keep the writing clean, engaging, and directly appealing to candidates.
    Expand the provided bullet points logically and professionally.
    """

    #These inputs will change on request per HR.
    user_prompt = f"""
    Generate a Job Description based on the following details:
    
    Role Title: {request.role_title}
    Department: {request.department}
    Employment Type: {request.employment_type}
    Duration: {request.duration or 'N/A'}
    Location: {request.location}
    Work Mode: {request.work_mode}
    Working Hours: {request.working_hours or 'N/A'}
    Compensation: {request.compensation or 'N/A'}
    Full-time Offer Details: {request.full_time_offer_details or 'N/A'}
    
    Responsibilities provided: {request.responsibilities or 'Standard responsibilities for this role'}
    Required Skills: {request.required_skills or 'Standard skills for this role'}
    Nice to Have: {request.nice_to_have_skills or 'N/A'}
    Who Can Apply: {request.who_can_apply or 'Standard eligibility'}
    
    Additional Override Notes: {request.additional_notes or 'None'}
    
    Please return ONLY the raw markdown of the Job Description and no conversational filler.
    """

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # Default fast model, can be updated
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
        )
        jd_markdown = completion.choices[0].message.content
        return JDResponse(generated_jd=jd_markdown)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
