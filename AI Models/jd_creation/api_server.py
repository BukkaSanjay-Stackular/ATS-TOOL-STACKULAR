"""
FastAPI Server for JD Generation
Exposes REST API endpoint for .NET backend to call
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from jd_generator import JDGenerator
import os
from dotenv import load_dotenv
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(
    title="JD Generator API",
    version="1.0.0",
    description="REST API for generating Job Descriptions using LLM"
)

# Allow .NET backend and Frontend to call this API (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",      # .NET Backend (HTTP)
        "http://localhost:5001",      # .NET Backend (HTTPS)
        "https://localhost:5001",     # .NET Backend (HTTPS)
        "http://localhost:5173",      # Frontend (Vite dev server - primary)
        "http://localhost:5174",      # Frontend (Vite dev server - fallback)
        "http://localhost:5175",      # Frontend (Vite dev server - fallback)
        "http://127.0.0.1:5000",
        "http://127.0.0.1:5001",
        "https://127.0.0.1:5001",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# REQUEST/RESPONSE MODELS (Data validation)
# ============================================================================

class JDRequest(BaseModel):
    """
    Expected input from .NET backend
    All fields match Frontend/Backend field names (camelCase)
    """
    experienceLevel: Optional[str] = None
    jobTitle: str
    location: Optional[str] = None
    workMode: Optional[str] = None
    workHours: Optional[str] = None
    duration: Optional[str] = None
    stipend: Optional[str] = None
    salary: Optional[str] = None
    fullTimeOfferSalary: Optional[str] = None
    experienceYears: Optional[str] = None
    roleDescription: str
    companyName: Optional[str] = "Stackular"
    
    class Config:
        json_schema_extra = {
            "example": {
                "jobTitle": "Senior AI Engineer",
                "experienceLevel": "experienced",
                "location": "Hyderabad",
                "workMode": "Remote",
                "workHours": "2:00 PM - 8:00 PM",
                "duration": "Permanent",
                "salary": "500000",
                "experienceYears": "5",
                "roleDescription": "Lead AI/ML development initiatives...",
                "companyName": "Stackular"
            }
        }


class JDResponse(BaseModel):
    """Response from API to .NET backend"""
    status: str  # "success" or "error"
    jd: Optional[str] = None
    error: Optional[str] = None
    message: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    version: str


# ============================================================================
# ROUTES (API Endpoints)
# ============================================================================

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint
    Use this to verify the API is running
    """
    return HealthResponse(
        status="healthy",
        service="JD Generator API",
        version="1.0.0"
    )


@app.post("/generate-jd", response_model=JDResponse, tags=["JD Generation"])
async def generate_jd(request: JDRequest):
    """
    Generate a Job Description from HR form data
    
    This is the main endpoint called by .NET Backend
    
    Input:
    - experienceLevel: "intern", "fresher", or "experienced"
    - jobTitle: Required. E.g., "AI Engineer"
    - location: E.g., "Hyderabad"
    - workMode: "On-site", "Remote", or "Hybrid"
    - workHours: E.g., "2:00 PM - 8:00 PM"
    - duration: E.g., "6 Months", "Permanent"
    - stipend: For interns (in INR)
    - salary: For experienced (in INR)
    - fullTimeOfferSalary: For freshers (in INR)
    - experienceYears: Required years of experience (number)
    - roleDescription: Required. Detailed role description
    - companyName: Optional, defaults to "Stackular"
    
    Output:
    {
        "status": "success",
        "jd": "## Job Title\nAI Engineer\n...",
        "message": "JD generated successfully"
    }
    
    Or on error:
    {
        "status": "error",
        "error": "Error message here",
        "jd": null
    }
    """
    try:
        logger.info(f"📝 Received request to generate JD for: {request.jobTitle}")
        
        # Validate that OpenRouter API key is configured
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            logger.error("❌ OPENROUTER_API_KEY not found in .env")
            raise ValueError("API key not configured. Please set OPENROUTER_API_KEY in .env")
        
        # Convert camelCase (from Frontend/Backend) to snake_case (for jd_generator.py)
        hr_input = {
            "job_title": request.jobTitle,
            "experience_level": request.experienceLevel,
            "location": request.location,
            "work_mode": request.workMode,
            "work_hours": request.workHours,
            "duration": request.duration,
            "stipend_salary": int(request.stipend) if request.stipend else None,
            "salary": int(request.salary) if request.salary else None,
            "fulltime_offer_salary": int(request.fullTimeOfferSalary) if request.fullTimeOfferSalary else None,
            "years_of_experience": int(request.experienceYears) if request.experienceYears else None,
            "role_info": request.roleDescription,
            "company_name": request.companyName or "Stackular",
            "about_us": "At Stackular, we are a community of builders creating world-class products."
        }
        
        logger.info(f"🔄 Initializing JD Generator...")
        
        # Create generator instance and generate JD
        generator = JDGenerator()
        jd = generator.generate_jd(hr_input)
        
        if not jd or jd.strip() == "":
            logger.error("❌ JD generator returned empty content")
            raise ValueError("JD generator returned empty content")
        
        logger.info(f"✅ JD generated successfully ({len(jd)} characters)")
        
        return JDResponse(
            status="success",
            jd=jd,
            message="JD generated successfully"
        )
    
    except ValueError as ve:
        logger.error(f"❌ Validation Error: {str(ve)}")
        return JDResponse(
            status="error",
            error=str(ve),
            jd=None
        )
    
    except Exception as e:
        logger.error(f"❌ Unexpected Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JDResponse(
            status="error",
            error=f"Failed to generate JD: {str(e)}",
            jd=None
        )


@app.post("/generate-jd-and-pdf", tags=["JD Generation"])
async def generate_jd_and_pdf(request: JDRequest):
    """
    Generate JD and convert to PDF
    Optional endpoint for future use
    """
    try:
        logger.info(f"📝 Request: Generate JD + PDF for: {request.jobTitle}")
        
        # Convert camelCase to snake_case
        hr_input = {
            "job_title": request.jobTitle,
            "experience_level": request.experienceLevel,
            "location": request.location,
            "work_mode": request.workMode,
            "work_hours": request.workHours,
            "duration": request.duration,
            "stipend_salary": int(request.stipend) if request.stipend else None,
            "salary": int(request.salary) if request.salary else None,
            "fulltime_offer_salary": int(request.fullTimeOfferSalary) if request.fullTimeOfferSalary else None,
            "years_of_experience": int(request.experienceYears) if request.experienceYears else None,
            "role_info": request.roleDescription,
            "company_name": request.companyName or "Stackular",
            "about_us": "At Stackular, we are a community of builders creating world-class products."
        }
        
        # Generate JD
        generator = JDGenerator()
        jd = generator.generate_jd(hr_input)
        
        if not jd:
            raise ValueError("JD generator returned empty content")
        
        # Generate PDF
        output_filename = f"jd_{request.jobTitle.replace(' ', '_')}.pdf"
        pdf_success = generator.generate_pdf(jd, hr_input, output_filename)
        
        if not pdf_success:
            raise ValueError("Failed to generate PDF")
        
        logger.info(f"✅ JD + PDF generated: {output_filename}")
        
        return JDResponse(
            status="success",
            jd=jd,
            message=f"JD and PDF generated successfully: {output_filename}"
        )
    
    except Exception as e:
        logger.error(f"❌ Error: {str(e)}")
        return JDResponse(
            status="error",
            error=str(e),
            jd=None
        )


# ============================================================================
# STARTUP/SHUTDOWN EVENTS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Print startup message"""
    print("\n")
    print("╔" + "═"*68 + "╗")
    print("║" + " "*68 + "║")
    print("║" + "✅ JD Generator API - STARTED".center(68) + "║")
    print("║" + " "*68 + "║")
    print("║" + f"🌐 Running on: http://localhost:8000".ljust(68) + "║")
    print("║" + f"📖 Interactive Docs: http://localhost:8000/docs".ljust(68) + "║")
    print("║" + f"🔍 Health Check: http://localhost:8000/health".ljust(68) + "║")
    print("║" + " "*68 + "║")
    print("║" + "Available Endpoints:".ljust(68) + "║")
    print("║" + "  • POST /generate-jd    - Generate JD from form data".ljust(68) + "║")
    print("║" + "  • GET  /health         - API health check".ljust(68) + "║")
    print("║" + " "*68 + "║")
    print("╚" + "═"*68 + "╝")
    print("\n")
    logger.info("🚀 JD Generator API startup complete")


@app.on_event("shutdown")
async def shutdown_event():
    """Print shutdown message"""
    logger.info("🛑 JD Generator API shutting down")


# ============================================================================
# ROOT ENDPOINT
# ============================================================================

@app.get("/", tags=["Info"])
async def root():
    """Root endpoint with API info"""
    return {
        "service": "JD Generator API",
        "version": "1.0.0",
        "docs": "http://localhost:8000/docs",
        "health": "http://localhost:8000/health",
        "main_endpoint": "POST /generate-jd"
    }


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        app,
        host="0.0.0.0",  # Listen on all interfaces
        port=8000,
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )
