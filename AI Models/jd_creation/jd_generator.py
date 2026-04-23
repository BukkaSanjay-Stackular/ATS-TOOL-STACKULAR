#JD Generator using LLM (OpenRouter).This module generates Job Descriptions based on HR form inputs

import os
import json
import requests
from dotenv import load_dotenv
from typing import Dict, Any
from jinja2 import Template
from weasyprint import HTML

# Load environment variables
load_dotenv(override=True)

class JDGenerator:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.model = os.getenv("OPENROUTER_MODEL", "openrouter/free")
        self.fallback_model = os.getenv("OPENROUTER_FALLBACK_MODEL", "openai/gpt-4o-mini")
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"
        
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY not found in .env file")
    
    def load_prompt_template(self, template_path: str = "jd_prompt_template.md") -> str:
        """Load the JD prompt template from file"""
        try:
            with open(template_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            print(f"Warning: {template_path} not found. Using inline template.")
            return self._get_default_template()
    
    def _get_default_template(self) -> str:
        """Fallback template if file not found"""
        return """You are an expert HR and recruitment specialist. Generate a professional Job Description based on the provided information following the exact format shown."""
    
    def generate_jd(self, hr_input: Dict[str, Any]) -> str:
        """
        Generate a JD from HR form input
        
        Args:
            hr_input: Dictionary containing:
                - job_title, experience_level, location, duration, work_mode, work_hours
                - years_of_experience, stipend_salary, fulltime_offer_salary
                - role_info (free text description for LLM to analyze)
                - company_name, about_us
        
        Returns:
            Generated JD as string
        """
        # Load the prompt template
        template = self.load_prompt_template()
        
        # Create the system prompt
        system_prompt = template
        
        # Create the user prompt with the input data
        experience_level = hr_input.get('experience_level', 'Not specified')
        is_internship = experience_level and experience_level.lower() in ['intern', 'fresher']
        
        # Build job details section based on provided fields
        job_details = []
        if hr_input.get('duration'):
            job_details.append(f"- Duration: {hr_input.get('duration')}")
        if hr_input.get('location'):
            job_details.append(f"- Location: {hr_input.get('location')}")
        if hr_input.get('work_mode'):
            job_details.append(f"- Work Mode: {hr_input.get('work_mode')}")
        if hr_input.get('work_hours'):
            job_details.append(f"- Work Hours: {hr_input.get('work_hours')}")
        if hr_input.get('stipend_salary'):
            job_details.append(f"- Salary/Stipend: ₹{hr_input.get('stipend_salary'):,} INR/Month")
        
        job_details_section = "\n".join(job_details) if job_details else "- Details to be discussed"
        
        # Build experience requirement section
        experience_requirement = ""
        if hr_input.get('years_of_experience'):
            experience_requirement = f"- Minimum {hr_input.get('years_of_experience')}+ years of experience required"
        elif is_internship:
            experience_requirement = "- This is an internship opportunity (no prior experience required)"
        else:
            experience_requirement = "- Experience level to be determined based on the role"
        
        # Full-time offer instruction
        fulltime_instruction = ""
        fulltime_salary_info = ""
        if is_internship and hr_input.get('fulltime_offer_salary'):
            fulltime_salary_info = f"₹{hr_input.get('fulltime_offer_salary'):,} INR/Month"
            fulltime_instruction = f"\n- INCLUDE a professional 'Full-Time Offer' or 'Conversion to Permanent Role' section mentioning the opportunity to convert to a full-time role with salary {fulltime_salary_info}."
        elif not is_internship and experience_level:
            fulltime_instruction = "\n- DO NOT include any internship conversion or full-time offer section (this is already a permanent role)."
        
        user_prompt = f"""Generate a professional, well-structured Job Description based on the following information:

**AVAILABLE INFORMATION:**

Role Title: {hr_input.get('job_title')}
Experience Level: {experience_level}

Job Details:
{job_details_section}

Experience Requirement:
{experience_requirement}

Company: {hr_input.get('company_name')}
Company Info: {hr_input.get('about_us')}

Role Details & Requirements (use this to extract responsibilities, skills, who can apply, etc.):
{hr_input.get('role_info')}

**INSTRUCTIONS FOR JD GENERATION:**

Generate a polished, professional Job Description using this exact template structure:

1. **Header Info** - Role, Duration (if provided), Location (if provided), Work Mode (if provided), Work Hours (if provided), Salary (if provided)

2. **About Us** - Brief company information (provided above)

3. **Role Overview** - 2-3 sentences explaining the role and its importance

4. **What You'll Do** - 5-8 key responsibilities as bullet points

5. **What You Need** - Required skills and experience (include the experience requirement above)
   {experience_requirement}

6. **Great to Have** - Nice-to-have skills and qualifications (optional but recommended)

7. **Who Can Apply** - Target candidate profile{fulltime_instruction}

**FORMATTING REQUIREMENTS:**
- Use clear section headers with bold formatting (**Header Name**)
- Use bullet points (•) for lists
- Keep descriptions concise and professional
- Use action verbs in responsibilities
- Ensure the JD is compelling and attracts qualified candidates
- Generate ONLY the JD content, no explanations or preamble

**ADAPTATION RULES:**
- If a detail is NOT provided (like location), mention it as "To be discussed" or "Flexible"
- Adapt the JD structure based on what information is available
- For Intern/Fresher roles: emphasize learning opportunities and growth
- For Experienced roles: emphasize technical depth and leadership opportunities
- Always maintain professional tone and formatting"""
        
        # Prepare request headers
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://stackular.in",  # Optional: for OpenRouter analytics
            "X-Title": "Stackular JD Generator",    # Optional: for OpenRouter analytics
        }
        
        # Prepare request payload
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ],
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        try:
            print(f"Calling LLM with model: {self.model}")
            response = requests.post(self.api_url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            
            # Extract the generated JD
            if "choices" in result and len(result["choices"]) > 0:
                jd = result["choices"][0]["message"]["content"]
                if jd and jd.strip():
                    return jd.strip()
                else:
                    print("Warning: LLM returned empty content")
                    print("Attempting fallback model...")
                    return self._retry_with_fallback(system_prompt, user_prompt, headers)
            else:
                print(f"⚠️  Unexpected API response format: {result}")
                print("Attempting fallback model...")
                return self._retry_with_fallback(system_prompt, user_prompt, headers)
        
        except requests.exceptions.RequestException as e:
            print(f"API Error: {e}")
            print("Attempting fallback model...")
            fallback_result = self._retry_with_fallback(system_prompt, user_prompt, headers)
            if not fallback_result:
                raise Exception(f"Both primary and fallback models failed. Original error: {e}")
            return fallback_result
        except Exception as e:
            print(f"Unexpected error: {e}")
            print("Attempting fallback model...")
            fallback_result = self._retry_with_fallback(system_prompt, user_prompt, headers)
            if not fallback_result:
                raise
            return fallback_result
    
    def _retry_with_fallback(self, system_prompt: str, user_prompt: str, headers: Dict) -> str:
        """Retry with fallback model if primary fails"""
        payload = {
            "model": self.fallback_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        try:
            print(f"Retrying with fallback model: {self.fallback_model}")
            response = requests.post(self.api_url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            result = response.json()
            
            if "choices" in result and len(result["choices"]) > 0:
                content = result["choices"][0]["message"]["content"]
                if content and content.strip():
                    print("Fallback model succeeded")
                    return content.strip()
                else:
                    print("Fallback model returned empty content")
                    return None
            else:
                print(f"Unexpected fallback response format: {result}")
                return None
        except Exception as e:
            print(f"Fallback also failed: {e}")
            return None
    
    def save_jd(self, jd_content: str, output_file: str = "generated_jd.txt") -> None:
        """Save generated JD to file"""
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(jd_content)
        print(f"JD saved to: {output_file}")
    
    def _bold_keywords(self, text: str) -> str:
        """Bold important keywords in text for PDF display (context-aware)"""
        if not text:
            return text
        
        import re
        
        # Skip bolding if text contains negative contexts
        negative_contexts = ['no prior', 'not required', 'optional', 'no experience', 'not necessary']
        lower_text = text.lower()
        
        for context in negative_contexts:
            if context in lower_text:
                # Don't bold anything in negative context sentences
                return text
        
        # Keywords to bold (only in positive contexts)
        replacements = [
            (r'\b(\d+\+?\s*years?)\b', r'<b>\1</b>'),  # 3+ years, 5 years
            (r'\b(required)\b', r'<b>\1</b>'),  # required (but not in "no...required")
            (r'\b(proficiency)\b', r'<b>\1</b>'),  # proficiency
            (r'\b(expertise)\b', r'<b>\1</b>'),  # expertise
            (r'\b(strong)\b', r'<b>\1</b>'),  # strong
            (r'\b(excellent)\b', r'<b>\1</b>'),  # excellent
            (r'\b(proven)\b', r'<b>\1</b>'),  # proven
        ]
        
        result = text
        for pattern, replacement in replacements:
            result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
        
        return result
    
    def parse_jd_content(self, jd_content: str, hr_input: dict) -> dict:
        """
        Parse the generated JD content into structured data for the template
        
        Args:
            jd_content: The generated JD text
            hr_input: Original HR input data
        
        Returns:
            Dictionary with structured JD data
        """
        data = {
            "company_name": hr_input.get("company_name", "Stackular"),
            "role": hr_input.get("job_title", ""),
            "duration": hr_input.get("duration", ""),
            "location": hr_input.get("location", ""),
            "work_mode": hr_input.get("work_mode", ""),
            "work_hours": hr_input.get("work_hours", ""),
            "stipend": f"{hr_input.get('stipend_salary', 0):,} INR/Month",
            "full_time": "",
            "about": hr_input.get("about_us", ""),
            "overview": "",
            "work": [],
            "requirements": [],
            "good_to_have": [],
            "who_can_apply": [],
            "logo_path": "./assets/logo.svg"  # Relative path to logo
        }
        
        # Add full-time offer if available
        if hr_input.get("fulltime_offer_salary"):
            data["full_time"] = f"Based on your performance, we will review your internship and extend a full-time offer. The starting salary for the full-time role will be ₹{hr_input.get('fulltime_offer_salary'):,} INR/Month."
        
        # Parse JD content to extract sections
        lines = jd_content.split('\n')
        current_section = None
        current_items = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Detect section headers
            lower_line = line.lower()
            if 'role overview' in lower_line or ('overview' in lower_line and current_section is None):
                current_section = 'overview'
                current_items = []
            elif ('what you' in lower_line and ('do' in lower_line or 'work' in lower_line)) or 'responsibilities' in lower_line or 'key responsibilities' in lower_line:
                current_section = 'work'
                current_items = []
            elif 'what you' in lower_line and 'know' in lower_line or 'what you need' in lower_line or 'requirements' in lower_line or 'required skills' in lower_line or 'should know' in lower_line:
                current_section = 'requirements'
                current_items = []
            elif 'great to have' in lower_line or 'good to have' in lower_line or 'nice to have' in lower_line:
                current_section = 'good_to_have'
                current_items = []
            elif 'who can apply' in lower_line or 'eligibility' in lower_line:
                current_section = 'who_can_apply'
                current_items = []
            elif 'about' in lower_line and current_section is None:
                current_section = 'about'
                current_items = []
            # Process content based on current section
            elif current_section:
                # Skip section headers
                if line.endswith(':') or line.isupper():
                    continue
                
                # Handle bullet points
                if line.startswith('•') or line.startswith('-') or line.startswith('*'):
                    item = line.lstrip('•-* ').strip()
                    if item:
                        # Bold keywords in requirements and good_to_have sections
                        if current_section in ['requirements', 'good_to_have']:
                            item = self._bold_keywords(item)
                        current_items.append(item)
                # Handle regular text
                else:
                    if current_section == 'overview':
                        data['overview'] += line + ' '
                    elif current_section == 'about':
                        data['about'] += line + ' '
                    else:
                        if line:
                            # Bold keywords in requirements
                            if current_section in ['requirements', 'good_to_have']:
                                line = self._bold_keywords(line)
                            current_items.append(line)
                
                # Update data dictionary
                if current_section == 'work':
                    data['work'] = current_items.copy()
                elif current_section == 'requirements':
                    data['requirements'] = current_items.copy()
                elif current_section == 'good_to_have':
                    data['good_to_have'] = current_items.copy()
                elif current_section == 'who_can_apply':
                    data['who_can_apply'] = current_items.copy()
        
        # Clean up text fields
        data['overview'] = data['overview'].strip()
        data['about'] = data['about'].strip()
        
        return data
    
    def generate_pdf(self, jd_content: str, hr_input: dict, output_filename: str) -> bool:
        """
        Generate a PDF from the JD content using WeasyPrint and Jinja2
        
        Args:
            jd_content: The generated JD text
            hr_input: Original HR input data
            output_filename: Base filename (without extension)
        
        Returns:
            True if successful, False otherwise
        """
        try:
            pdf_filename = f"{output_filename}.pdf"
            
            # Parse JD content into structured data
            data = self.parse_jd_content(jd_content, hr_input)
            
            # HTML template (inline) - based on debug/template.html
            html_template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Job Description - {{ role }}</title>
    <style>
        @page {
            size: A4;
            margin: 1in;
        }
        body {
            font-family: 'Aptos', 'Calibri', 'Segoe UI', Arial, sans-serif;
            line-height: 1.2;
            color: #000;
            margin: 0;
            padding: 0;
            font-size: 13pt;
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            margin-bottom: 25px;
        }
        .logo {
            width: 120px;
            height: auto;
        }
        .role-section {
            margin-bottom: 15px;
        }
        .role-section p {
            margin: 2px 0;
            font-size: 11pt;
            line-height: 1.2;
        }
        .role-title {
            margin-bottom: 4px !important;
            font-size: 13pt;
        }
        .work-details {
            margin-bottom: 15px;
        }
        .work-details p {
            margin: 2px 0;
            font-size: 11pt;
            line-height: 1.2;
        }
        .full-time-section {
            margin-bottom: 20px;
        }
        .full-time-section p {
            margin: 2px 0;
            font-size: 11pt;
            line-height: 1.3;
        }
        .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        h3 {
            margin: 0 0 8px 0;
            color: #000;
            font-size: 12pt;
            font-weight: 700;
            page-break-after: avoid;
            text-transform: none;
            border-bottom: none;
            padding-bottom: 0;
        }
        p {
            font-size: 11pt;
            line-height: 1.3;
            margin: 0 0 10px 0;
        }
        strong, b {
            font-weight: 700;
        }
        ul {
            margin: 0 0 10px 20px;
            padding: 0;
            list-style-type: disc;
        }
        li {
            margin-bottom: 5px;
            font-size: 11pt;
            line-height: 1.3;
            padding-left: 5px;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        {% if logo_path %}
        <img src="{{ logo_path }}" class="logo">
        {% else %}
        <h1 style="margin: 0; font-size: 24px;">{{ company_name }}</h1>
        {% endif %}
    </div>

    <!-- Role Info -->
    <div class="role-section">
        <p class="role-title"><strong>Role:</strong> <strong>{{ role }}</strong></p>
        <p><strong>Duration:</strong> {{ duration }}</p>
        <p><strong>Location:</strong> {{ location }}</p>
        <p><strong>Work mode:</strong> {{ work_mode }}</p>
    </div>

    <div class="work-details">
        <p><strong>Work Hours:</strong> {{ work_hours }}</p>
        <p><strong>Stipend:</strong> <strong>{{ stipend }}</strong></p>
    </div>

    {% if full_time %}
    <div class="full-time-section">
        <p><strong>Full-Time Offer:</strong> {{ full_time }}</p>
    </div>
    {% endif %}

    <!-- About -->
    {% if about %}
    <div class="section">
        <p><strong>About us:</strong> {{ about }}</p>
    </div>
    {% endif %}

    <!-- Role Overview -->
    {% if overview %}
    <div class="section">
        <h3>Role Overview</h3>
        <p>{{ overview }}</p>
    </div>
    {% endif %}

    <!-- Work -->
    {% if work %}
    <div class="section">
        <h3>What You'll Work On</h3>
        <ul>
            {% for item in work %}
            <li>{{ item }}</li>
            {% endfor %}
        </ul>
    </div>
    {% endif %}

    <!-- Requirements -->
    {% if requirements %}
    <div class="section">
        <h3>What You Need</h3>
        <ul>
            {% for item in requirements %}
            <li>{{ item }}</li>
            {% endfor %}
        </ul>
    </div>
    {% endif %}

    <!-- Good to have -->
    {% if good_to_have %}
    <div class="section">
        <h3>Great to Have</h3>
        <ul>
            {% for item in good_to_have %}
            <li>{{ item }}</li>
            {% endfor %}
        </ul>
    </div>
    {% endif %}

    <!-- Who Can Apply -->
    {% if who_can_apply %}
    <div class="section">
        <h3>Who Can Apply</h3>
        <ul>
            {% for item in who_can_apply %}
            <li>{{ item }}</li>
            {% endfor %}
        </ul>
    </div>
    {% endif %}
</body>
</html>
            """
            
            # Render HTML using Jinja2
            template = Template(html_template)
            html_out = template.render(data)
            
            # Generate PDF using WeasyPrint
            HTML(string=html_out, base_url='.').write_pdf(pdf_filename)
            
            print(f"PDF generated successfully: {pdf_filename}")
            return True
            
        except Exception as e:
            print(f"Error generating PDF: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def generate_pdf_bytes(self, jd_content: str, hr_input: dict) -> bytes:
        """
        Generate a PDF as bytes (in-memory) from JD content
        
        Args:
            jd_content: The generated JD text (can be edited)
            hr_input: Original HR input data for styling/metadata
        
        Returns:
            PDF content as bytes, or None if generation fails
        """
        try:
            # Parse JD content into structured data
            data = self.parse_jd_content(jd_content, hr_input)
            
            # HTML template (inline)
            html_template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Job Description - {{ role }}</title>
    <style>
        @page {
            size: A4;
            margin: 1in;
        }
        body {
            font-family: 'Aptos', 'Calibri', 'Segoe UI', Arial, sans-serif;
            line-height: 1.2;
            color: #000;
            margin: 0;
            padding: 0;
            font-size: 13pt;
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            margin-bottom: 25px;
        }
        .logo {
            width: 120px;
            height: auto;
        }
        .role-section {
            margin-bottom: 15px;
        }
        .role-section p {
            margin: 2px 0;
            font-size: 11pt;
            line-height: 1.2;
        }
        .role-title {
            margin-bottom: 4px !important;
            font-size: 13pt;
        }
        .work-details {
            margin-bottom: 15px;
        }
        .work-details p {
            margin: 2px 0;
            font-size: 11pt;
            line-height: 1.2;
        }
        .full-time-section {
            margin-bottom: 20px;
        }
        .full-time-section p {
            margin: 2px 0;
            font-size: 11pt;
            line-height: 1.3;
        }
        .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        h3 {
            margin: 0 0 8px 0;
            color: #000;
            font-size: 12pt;
            font-weight: 700;
            page-break-after: avoid;
            text-transform: none;
            border-bottom: none;
            padding-bottom: 0;
        }
        p {
            font-size: 11pt;
            line-height: 1.3;
            margin: 0 0 10px 0;
        }
        strong, b {
            font-weight: 700;
        }
        ul {
            margin: 0 0 10px 20px;
            padding: 0;
            list-style-type: disc;
        }
        li {
            margin-bottom: 5px;
            font-size: 11pt;
            line-height: 1.3;
            padding-left: 5px;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        {% if logo_path %}
        <img src="{{ logo_path }}" class="logo">
        {% else %}
        <h1 style="margin: 0; font-size: 24px;">{{ company_name }}</h1>
        {% endif %}
    </div>

    <!-- Role Info -->
    <div class="role-section">
        <p class="role-title"><strong>Role:</strong> <strong>{{ role }}</strong></p>
        <p><strong>Duration:</strong> {{ duration }}</p>
        <p><strong>Location:</strong> {{ location }}</p>
        <p><strong>Work mode:</strong> {{ work_mode }}</p>
    </div>

    <div class="work-details">
        <p><strong>Work Hours:</strong> {{ work_hours }}</p>
        <p><strong>Stipend:</strong> <strong>{{ stipend }}</strong></p>
    </div>

    {% if full_time %}
    <div class="full-time-section">
        <p><strong>Full-Time Offer:</strong> {{ full_time }}</p>
    </div>
    {% endif %}

    <!-- About -->
    {% if about %}
    <div class="section">
        <p><strong>About us:</strong> {{ about }}</p>
    </div>
    {% endif %}

    <!-- Role Overview -->
    {% if overview %}
    <div class="section">
        <h3>Role Overview</h3>
        <p>{{ overview }}</p>
    </div>
    {% endif %}

    <!-- Work -->
    {% if work %}
    <div class="section">
        <h3>What You'll Work On</h3>
        <ul>
            {% for item in work %}
            <li>{{ item }}</li>
            {% endfor %}
        </ul>
    </div>
    {% endif %}

    <!-- Requirements -->
    {% if requirements %}
    <div class="section">
        <h3>What You Need</h3>
        <ul>
            {% for item in requirements %}
            <li>{{ item }}</li>
            {% endfor %}
        </ul>
    </div>
    {% endif %}

    <!-- Good to have -->
    {% if good_to_have %}
    <div class="section">
        <h3>Great to Have</h3>
        <ul>
            {% for item in good_to_have %}
            <li>{{ item }}</li>
            {% endfor %}
        </ul>
    </div>
    {% endif %}

    <!-- Who Can Apply -->
    {% if who_can_apply %}
    <div class="section">
        <h3>Who Can Apply</h3>
        <ul>
            {% for item in who_can_apply %}
            <li>{{ item }}</li>
            {% endfor %}
        </ul>
    </div>
    {% endif %}
</body>
</html>
            """
            
            # Render HTML using Jinja2
            template = Template(html_template)
            html_out = template.render(data)
            
            # Generate PDF as bytes using WeasyPrint
            from io import BytesIO
            pdf_bytes = BytesIO()
            HTML(string=html_out, base_url='.').write_pdf(pdf_bytes)
            pdf_bytes.seek(0)
            
            print(f"PDF generated successfully as bytes ({len(pdf_bytes.getvalue())} bytes)")
            return pdf_bytes.getvalue()
            
        except Exception as e:
            print(f"Error generating PDF bytes: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def generate_pdf_from_file(self, txt_file: str) -> bool:
        """
        Generate a PDF from an existing .txt JD file
        
        Args:
            txt_file: Path to the .txt file containing JD content
        
        Returns:
            True if successful, False otherwise
        """
        try:
            # Read JD content from file
            print(f"\n📖 Reading JD from file: {txt_file}")
            with open(txt_file, 'r', encoding='utf-8') as f:
                jd_content = f.read()
            
            if not jd_content.strip():
                print(f"File is empty: {txt_file}")
                return False
            
            print("✓ JD content loaded successfully")
            
            # Create minimal HR input for PDF generation
            print("\n" + "="*70)
            print("PROVIDE DETAILS FOR PDF GENERATION")
            print("="*70)
            
            company_name = input("Company Name (default: Stackular): ").strip() or "Stackular"
            job_title = input("Job Title: ").strip() or "Job Position"
            duration = input("Duration (e.g., '6 Months'): ").strip() or "Not specified"
            location = input("Location: ").strip() or "Not specified"
            work_mode = input("Work Mode (On-site/Remote/Hybrid): ").strip() or "Not specified"
            work_hours = input("Work Hours: ").strip() or "Not specified"
            stipend_salary = input("Stipend/Salary (INR): ").strip() or "0"
            
            # Create HR input dictionary
            hr_input = {
                "company_name": company_name,
                "job_title": job_title,
                "duration": duration,
                "location": location,
                "work_mode": work_mode,
                "work_hours": work_hours,
                "stipend_salary": int(stipend_salary) if stipend_salary.isdigit() else 0,
                "fulltime_offer_salary": None,
                "about_us": "At Stackular, we are more than just a team – we are a product development community driven by a shared vision."
            }
            
            # Generate output filename from input file
            base_filename = txt_file.replace('.txt', '')
            output_filename = base_filename
            
            print(f"\n📝 Generating PDF from JD content...")
            return self.generate_pdf(jd_content, hr_input, output_filename)
            
        except FileNotFoundError:
            print(f"File not found: {txt_file}")
            return False
        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()
            return False


def main():
    """Example usage"""
    # Sample HR input (based on your AI/ML Intern JD)
    sample_input = {
        "company_name": "Stackular",
        "experience_level": "Intern",
        "job_title": "AI/ML Intern – Agentic AI (Autonomous Agents)",
        "department": "AI/ML",
        "role_specialization": "Autonomous Agents",
        "duration": "6 Months",
        "location": "Raidurg Main Road, Hyderabad",
        "work_mode": "On-site",
        "work_hours": "11:00 AM to 8:00 PM",
        "stipend_salary": 35000,
        "fulltime_offer_salary": 50000,
        "currency": "INR",
        "role_overview": "We're looking for driven interns who want to work on cutting-edge Agentic AI systems—autonomous agents that can reason, plan, and act independently. If you're passionate about AI beyond the basics and want hands-on exposure to real agent workflows, this role is built for you.",
        "key_responsibilities": "Designing and experimenting with autonomous AI agents\nBuilding agent workflows using LangChain, OpenAI tools, RAG pipelines, etc.\nIntegrating APIs, vector databases, and automation tools\nRunning experiments, tracking behavior, and refining performance\nContributing to internal POCs and innovation projects",
        "key_technologies": "LangChain, OpenAI, RAG, Vector Databases, Python, Autonomous Agents",
        "required_skills": "Strong Python skills (or solid programming in any language)\nUnderstanding of ML fundamentals & embeddings\nFamiliarity with LLM-based apps, LangChain, or RAG (or willingness to learn fast)\nBasic knowledge of GitHub, SQL, and cloud platforms",
        "nice_to_have_skills": "Experience with autonomous agents (CrewAI, AutoGen, Swarm libraries)\nExposure to vector databases\nKnowledge of reinforcement learning",
        "who_can_apply": "Final-year students or recent graduates in Computer Science, Artificial Intelligence, Data Science, or related disciplines. Candidates with hands-on coursework or project experience in AI/ML, especially on Agentic AI. Individuals who are self-driven, collaborative, and passionate about applying technology to real-world impact.",
        "about_us": "At Stackular, we are more than just a team – we are a product development community driven by a shared vision. Our values shape who we are, what we do, and how we interact with our peers and our customers. We're not just seeking any regular engineer; we want individuals who identify with our core values and are passionate about software development."
    }
    
    try:
        # Initialize generator
        generator = JDGenerator()
        print("✓ JD Generator initialized successfully")
        print(f"Using model: {generator.model}")
        print("-" * 60)
        
        # Generate JD
        print("Generating JD...")
        jd = generator.generate_jd(sample_input)
        
        # Save to file
        generator.save_jd(jd, "sample_generated_jd.txt")
        
        # Print to console
        print("\n" + "=" * 60)
        print("GENERATED JD:")
        print("=" * 60)
        print(jd)
        print("=" * 60)
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
