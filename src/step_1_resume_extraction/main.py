"""
ATS Resume Processing Pipeline
Main module that orchestrates the complete resume extraction workflow.
"""

from pathlib import Path
from typing import List

from .extractor import extract_text
from .parser import parse_resume
from .database import ResumeDatabase
from ..utils.config import get_uploads_folder, get_db_path


def get_resume_files(uploads_folder: str) -> List[Path]:
    """
    Get all resume files (PDF, DOCX) from the uploads folder.
    Avoids duplicates on case-insensitive filesystems (Windows, macOS).
    
    Args:
        uploads_folder (str): Path to folder containing resume files
        
    Returns:
        List[Path]: List of resume file paths (deduplicated and sorted)
    """
    uploads_path = Path(uploads_folder)
    
    if not uploads_path.exists():
        print(f"❌ Uploads folder not found: {uploads_folder}")
        return []
    
    # Use a set to store unique files (by absolute path) to avoid duplicates
    # on case-insensitive filesystems like Windows and macOS
    resume_files_set = set()
    
    # Supported extensions
    extensions = ['.pdf', '.docx', '.doc']
    
    # Find all matching files
    for file in uploads_path.iterdir():
        if file.is_file() and file.suffix.lower() in extensions:
            # Store absolute path to ensure uniqueness
            resume_files_set.add(file.resolve())
    
    if not resume_files_set:
        print(f"⚠️  No resume files (PDF/DOCX) found in {uploads_folder}")
    
    return sorted(list(resume_files_set))


def process_resumes(uploads_folder: str, db_path: str):
    """
    Main pipeline: extract all resumes from files (PDF, DOCX) and store in database.
    Supports scanned PDFs with OCR fallback.
    
    Args:
        uploads_folder (str): Path to folder containing resume files
        db_path (str): Path to SQLite database file
    """
    print("\n" + "="*60)
    print("🚀 ATS Resume Processing Pipeline Started")
    print("="*60 + "\n")
    
    # Initialize database
    db = ResumeDatabase(db_path)
    db.connect()
    db.create_table()
    print()
    
    # Get all resume files (PDF, DOCX)
    resume_files = get_resume_files(uploads_folder)
    
    if not resume_files:
        print("No resumes to process.")
        db.close()
        return
    
    print(f"📁 Found {len(resume_files)} resume file(s) to process\n")
    
    # Process each resume
    successful_count = 0
    failed_count = 0
    
    for idx, resume_file in enumerate(resume_files, 1):
        print(f"[{idx}/{len(resume_files)}] Processing: {resume_file.name}")
        
        # Step 1: Extract text from file (PDF, DOCX, or scanned PDF with OCR)
        text_content = extract_text(str(resume_file))
        if not text_content:
            failed_count += 1
            print()
            continue
        
        # Step 2: Parse resume (extract name, email, phone)
        name, email, phone = parse_resume(text_content)
        print(f"  → Name: {name or 'Not found'}")
        print(f"  → Email: {email or 'Not found'}")
        print(f"  → Phone: {phone or 'Not found'}")
        
        # Step 3: Store in database
        success = db.insert_resume(name, email, phone, text_content, str(resume_file))
        if success:
            print(f"  ✓ Stored in database")
            successful_count += 1
        else:
            failed_count += 1
        
        print()
    
    # Print summary
    print("="*60)
    print("📊 Processing Summary")
    print("="*60)
    print(f"✓ Successfully processed: {successful_count}")
    print(f"❌ Failed: {failed_count}")
    print(f"📦 Total resumes in database: {db.get_resume_count()}")
    print("="*60 + "\n")
    
    # Close database
    db.close()


def main():
    """
    Entry point for the application.
    """
    uploads_folder = get_uploads_folder()
    db_path = get_db_path()
    process_resumes(uploads_folder, db_path)


if __name__ == "__main__":
    main()
