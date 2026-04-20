# ATS Step 1: Resume Extraction Pipeline

## 📋 Project Overview

A clean, modular Python application that:
- Reads resume files (PDF, DOCX) from `data/uploads/`
- Extracts text using PyMuPDF (standard PDFs) with OCR fallback for scanned PDFs
- Extracts DOCX files using python-docx
- Parses email, phone, and name using regex
- Stores data in SQLite database (`data/database/resumes.db`)

## 🏗️ Project Structure

```
Stackular_ATS_System/
├── src/
│   ├── extractor.py      # Multi-format text extraction + OCR
│   ├── parser.py         # Regex parsing (email, phone, name)
│   ├── database.py       # SQLite operations
│   └── main.py           # Main pipeline orchestrator
├── data/
│   ├── uploads/          # Place resume files here (PDF, DOCX)
│   └── database/         # SQLite database stored here
├── requirements.txt      # Python dependencies
└── README.md            # This file
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Install Tesseract (For OCR - Optional but Recommended)
OCR is only needed for **scanned PDFs**. If you only have standard PDFs and DOCX files, you can skip this.

**Windows:**
- Download installer: https://github.com/UB-Mannheim/tesseract/wiki
- Run the installer (default path: `C:\Program Files\Tesseract-OCR`)

**Mac:**
```bash
brew install tesseract
```

**Linux:**
```bash
sudo apt-get install tesseract-ocr
```

### 3. Place Resume Files
Add your resume files to the `data/uploads/` folder. Supported formats:
- PDF (standard text-based)
- PDF (scanned/image-based - automatically uses OCR)
- DOCX (Word documents)
- DOC (older Word format)

### 4. Run the Pipeline
```bash
cd src
python main.py
```

### 5. Check Results
- Database will be created at: `data/database/resumes.db`
- View extracted data:
  ```bash
  sqlite3 data/database/resumes.db
  SELECT * FROM resumes;
  ```

## 📊 Database Schema

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary Key (auto-increment) |
| name | TEXT | Extracted candidate name |
| email | TEXT | Extracted email address |
| phone | TEXT | Extracted phone number |
| content | TEXT | Full resume text |
| file_path | TEXT | Path to original file |
| created_at | TIMESTAMP | When record was created |

## 📝 Module Details

### `extractor.py`
Multi-format extraction with intelligent fallback:

**Functions:**
- `extract_text(file_path)` - Main dispatcher (handles all formats)
- `pymupdf_extract(file_path)` - Standard PDF text extraction
- `ocr_extract(file_path)` - Scanned PDF OCR extraction
- `docx_extract(file_path)` - DOCX file extraction
- `get_file_type(file_path)` - Determine file type

**Smart Logic:**
- PDF → Try PyMuPDF first
- If text < 50 chars → Likely scanned → Use OCR
- If no text extracted → Try OCR
- DOCX → Direct extraction

### `parser.py`
- `extract_email(text)` - Email regex matching
- `extract_phone(text)` - Phone number extraction
- `extract_name(text)` - Name extraction (first line)
- `parse_resume(text)` - Combined parsing

### `database.py`
- `ResumeDatabase` class:
  - `connect()` - Establish connection
  - `create_table()` - Create schema
  - `insert_resume()` - Add record
  - `close()` - Close connection
  - `get_resume_count()` - Get total count

### `main.py`
- `process_resumes()` - Main pipeline
- `get_resume_files()` - Find all supported files
- Provides comprehensive logging

## ✨ Features

✅ Multi-format support (PDF, DOCX, scanned PDFs)  
✅ Automatic OCR fallback for scanned documents  
✅ Smart text detection (< 50 chars triggers OCR)  
✅ Modular, clean code structure  
✅ Comprehensive error handling  
✅ Progress logging with emojis  
✅ Auto-creates database and tables  
✅ Regex extraction for email and phone  
✅ Simple but effective name extraction  

## 🔧 Error Handling

- Missing files are skipped with warnings
- Corrupted files are logged and skipped
- Empty files are skipped
- Unsupported formats are reported
- Database errors are caught and reported
- Missing Tesseract is caught (OCR will fail gracefully)
- All errors include descriptive messages

## 📈 Sample Output

```
============================================================
🚀 ATS Resume Processing Pipeline Started
============================================================

✓ Connected to database: data/database/resumes.db
✓ Table 'resumes' ready

📁 Found 4 resume file(s) to process

[1/4] Processing: John_Doe.pdf
  → Name: John Doe
  → Email: john.doe@email.com
  → Phone: (555) 123-4567
  ✓ Stored in database

[2/4] Processing: scanned_resume.pdf
  📄 Short text detected, attempting OCR for scanned PDF...
  🔄 Attempting OCR extraction (scanned PDF detected)...
  → Name: Jane Smith
  → Email: jane@company.com
  → Phone: Not found
  ✓ Stored in database

[3/4] Processing: resume.docx
  → Name: Robert Johnson
  → Email: bob@email.com
  → Phone: 555-987-6543
  ✓ Stored in database

[4/4] Processing: invalid_file.pdf
  ❌ PyMuPDF extraction failed: file is not a PDF
  📄 No text extracted, attempting OCR...

============================================================
📊 Processing Summary
============================================================
✓ Successfully processed: 3
❌ Failed: 1
📦 Total resumes in database: 3
============================================================
```

## 🔮 Future Enhancements

- Extract more fields (education, experience, skills)
- Add duplicate detection
- Support for different resume formats
- Integration with job description matching
- Web UI for managing resumes
- Batch processing with queue system
- Support for image formats (PNG, JPG)
- Resume classification by role/experience level
