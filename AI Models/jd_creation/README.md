# 🤖 JD Generator - AI Model Setup & Integration Guide

## 📂 Folder Structure

```
jd_creation/
├── api_server.py                    ← FastAPI server (START THIS)
├── jd_generator.py                  ← Core LLM logic
├── jd_generator_cli.py              ← CLI tool (legacy)
├── jd_prompt_template.md            ← LLM prompt template
├── test_harness.py                  ← Testing script
├── requirements.txt                 ← Python dependencies
├── .env                             ← API keys (not in git)
├── venv/                            ← Virtual environment
└── assets/                          ← Sample files
```

---

## 🚀 Quick Start

### **Step 1: Activate Virtual Environment**

```bash
cd "c:\dev\projects\ATS-TOOL-STACKULAR\AI Models\jd_creation"
.\venv\Scripts\Activate.ps1
```

### **Step 2: Verify Dependencies**

```bash
pip list | grep -E "fastapi|uvicorn|requests|jinja2|weasyprint"
```

Should show all installed ✅

### **Step 3: Start the API Server**

```bash
python -m uvicorn api_server:app --host 0.0.0.0 --port 8000
```

You should see:
```
✅ JD Generator API - STARTED
🌐 Running on: http://localhost:8000
```

### **Step 4: Test the API**

Open browser: `http://localhost:8000/docs`

---

## 📋 Setup Checklist

- [ ] Virtual environment activated
- [ ] All dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` file has `OPENROUTER_API_KEY`
- [ ] API server running on port 8000
- [ ] Health check works: `http://localhost:8000/health`
- [ ] Swagger UI accessible: `http://localhost:8000/docs`

---

## 🔑 Environment Configuration (.env)

**File:** `c:\dev\projects\ATS-TOOL-STACKULAR\AI Models\jd_creation\.env`

Required:
```env
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_MODEL=openrouter/free
OPENROUTER_FALLBACK_MODEL=openai/gpt-4o-mini
```

---

## 📊 Architecture

```
Frontend (React)
    ↓
.NET Backend (handles auth, DB, validation)
    ↓
FastAPI Server (http://localhost:8000)  ← YOU
    ↓
OpenRouter LLM API
    ↓
Generated JD
```

---

## 🔄 What Each File Does

| File | Purpose | Used By |
|------|---------|---------|
| `api_server.py` | **FastAPI REST server** | .NET Backend calls this |
| `jd_generator.py` | LLM logic (OpenRouter calls) | `api_server.py` imports this |
| `jd_generator_cli.py` | Interactive CLI tool | Manual testing only |
| `jd_prompt_template.md` | System prompt for LLM | `jd_generator.py` loads this |
| `requirements.txt` | Python dependencies | `pip install -r requirements.txt` |

---

## 🧪 Testing

### **Option 1: Swagger UI (Recommended)**
```
http://localhost:8000/docs
```
- Interactive form to test `/generate-jd`
- Fill in fields, click "Execute"
- See response in real-time

### **Option 2: Health Check**
```bash
curl http://localhost:8000/health
```

### **Option 3: Full Test (cURL)**
```bash
curl -X POST "http://localhost:8000/generate-jd" \
  -H "Content-Type: application/json" \
  -d '{
    "jobTitle": "AI Engineer",
    "roleDescription": "Build AI systems",
    "experienceLevel": "experienced",
    "location": "Hyderabad",
    "workMode": "Remote",
    "salary": "500000",
    "experienceYears": "5"
  }'
```

---

## 🐛 Troubleshooting

### **Issue: "OPENROUTER_API_KEY not found"**
```
Solution: Add to .env file:
OPENROUTER_API_KEY=sk_your_key_here
```

### **Issue: "Connection refused" on port 8000**
```
Solution: 
1. Make sure server is running
2. Check port: netstat -ano | findstr :8000
3. Kill process: taskkill /PID [PID] /F
4. Restart server
```

### **Issue: "Failed to generate JD" after 30s**
```
Solution:
- OpenRouter API is slow
- Retry the request
- Check if API key is valid
- Check internet connection
```

### **Issue: Virtual environment not activating**
```
Solution:
.\venv\Scripts\Activate.ps1
(or use: .\venv\Scripts\activate.bat)
```

---

## 📦 Installing New Dependencies

If you need to add packages:

```bash
# Activate venv first
.\venv\Scripts\Activate.ps1

# Install
pip install package_name

# Save to requirements.txt
pip freeze > requirements.txt
```

---

## 🔐 Security Notes

- ❌ Never commit `.env` file (it's in `.gitignore`)
- ✅ Store API keys in environment variables only
- ✅ This API server has no authentication (by design)
- ✅ .NET Backend adds authentication layer

---

## 📞 Support

- **API Server:** Runs on `http://localhost:8000`
- **Documentation:** See `API_DOCUMENTATION.md`
- **Quick Reference:** See `QUICK_REFERENCE.md`
- **Interactive Testing:** Visit `/docs` endpoint

---

## 🎯 Summary

```
1. Activate venv
2. Verify .env has API key
3. Start: python -m uvicorn api_server:app --host 0.0.0.0 --port 8000
4. Test: http://localhost:8000/docs
5. Share with .NET dev: API_DOCUMENTATION.md + QUICK_REFERENCE.md
```

**That's it! API is ready for integration.** ✅
