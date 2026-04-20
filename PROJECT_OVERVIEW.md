# Internal Hiring ATS Tool

## 📌 Overview

This is an internal Applicant Tracking System (ATS) designed to streamline the hiring process within the company Stackular.

The system will help HR teams manage candidates and enable interviewers (staff) to evaluate them effectively.

---

## 👥 User Roles

### 1. HR Panel

* Upload Job Description (JD)
* Upload and manage resumes
* Screen candidates
* Select top candidates
* Track candidate progress across rounds
* View feedback from interviewers

### 2. Interviewer Panel (Staff)

* View assigned candidates
* Access candidate resume (PDF)
* View Job Description (JD)
* Provide feedback after interviews
* Submit evaluation for each candidate

---

## 🔄 Hiring Workflow

1. HR uploads Job Description (JD)
2. HR uploads resumes for that JD
3. System processes resumes (text extraction + storage)
4. HR screens and shortlists candidates
5. Interviews are scheduled
6. Interviewers review:

   * Resume
   * JD
7. Interviewers submit feedback
8. HR tracks:

   * Candidate status
   * Interview rounds
   * Final decisions

---

## 🧩 Core Features

* Resume upload and storage
* Resume text extraction
* Candidate data management
* JD-based candidate screening
* Interview feedback system
* Candidate tracking (round-wise)
* Role-based dashboards (HR / Interviewer)

---

## 🏗️ Current Development Phase

### ✅ Step 1: Resume Ingestion System

Goal:

* Extract text from resumes (PDF/DOCX)
* Extract basic details:

  * Name
  * Email
  * Phone
* Store in database
* Store original file path

Database Fields:

* id
* name
* email
* phone
* content (full resume text)
* file_path

---

## 🔜 Next Steps (Planned)

* Resume search & filtering
* JD vs Resume matching
* Candidate ranking system
* Interview scheduling module
* Feedback storage system
* Dashboard UI

---

## 🧠 Tech Stack (Initial)

* Python (backend processing)
* PyMuPDF (PDF extraction)
* SQLite (database)
* Local file storage (PDFs)

---

## 📁 Storage Design

* Resumes stored in: data/uploads/
* Database stored in: data/database/
* Each resume linked via file_path

---

## 🎯 Goal

Build a scalable internal ATS that:

* Reduces manual screening effort
* Improves candidate selection quality
* Streamlines interviewer feedback
* Provides full visibility of hiring pipeline
