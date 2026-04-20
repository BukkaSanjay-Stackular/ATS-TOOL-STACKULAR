# JD Maker Tool 🚀

This is the full implementation of the internal Job Description Generator Tool for Stackular. 

It features a **Vite + React** frontend and a **FastAPI** backend that interacts with Groq AI to draft perfectly structured JDs based on HR inputs.

## Prerequisites
- Node.js (v18+)
- Python 3.10+
- `uv` (Fast Python package installer)

## 🔧 Setup & Configuration

1. **Get your Groq API Key**:
   - Create an account on Groq Cloud and generate an API Key.
   - Open `JD_maker/backend/.env` and add your key:
     ```
     GROQ_API_KEY="gsk_your_api_key_here..."
     ```

## 🚀 How to Run

You need to run BOTH the Backend and Frontend servers concurrently in two separate terminal windows.

### Terminal 1: Start the Backend (FastAPI)
Open a terminal and navigate to the project root:
```bash
cd c:\Stackular-Project-1\ATS-TOOL-STACKULAR\JD_maker\backend
uv run uvicorn main:app --reload
```
The API server will run at `http://localhost:8000`.

### Terminal 2: Start the Frontend (React Vite)
Open a new terminal and navigate to the frontend root:
```bash
cd c:\Stackular-Project-1\ATS-TOOL-STACKULAR\JD_maker\frontend
npm run dev
```
The application will launch on `http://localhost:5173` (or whatever Vite specifies). Open that URL in your browser.

## Features Built:
- **Layer 1:** Form builder with structured parameters matching Stackular formatting needs and Tone selection control.
- **Layer 2:** Robust prompting logic leveraging Groq models (Llama 3 8B) for fast inference.
- **Layer 3:** React Quill integrated rich-text preview. The generation fills right into the editor for quick last-minute polish before PDF conversion.
- **Layer 4:** HTML to PDF rendering with full branding and customized styling baked into Vanilla CSS.
