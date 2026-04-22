"""
JD Generator using LLM (OpenRouter)
This module generates Job Descriptions based on HR form inputs
"""

import os
import json
import requests
from dotenv import load_dotenv
from typing import Dict, Any
from jinja2 import Template
from weasyprint import HTML

# Load environment variables - override=True used to favor .env file over system variables
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
                - stipend_salary, fulltime_offer_salary
                - role_info (free text description for LLM to analyze)
                - company_name, about_us
        
        Returns:
            Generated JD as string
        """
        # Load the prompt template
        template = self.load_prompt_template()
        
        # Create the system prompt
        system_prompt = template
        
        stipend_salary = str(hr_input.get('stipend_salary'))
        fulltime_salary = str(hr_input.get('fulltime_offer_salary'))
        
        user_prompt = f"""Generate a professional Job Description based on this information:

Basic Info:
- Job Title: {hr_input.get('job_title')}
- Experience Level: {hr_input.get('experience_level')}
- Location: {hr_input.get('location')}
- Duration: {hr_input.get('duration')}
- Work Mode: {hr_input.get('work_mode')}
- Work Hours: {hr_input.get('work_hours')}
- Salary/Stipend: {stipend_salary} INR/Month
{f"- Full-Time Offer: {fulltime_salary} INR/Month" if hr_input.get('fulltime_offer_salary') else ""}

Role Description (analyze this to extract responsibilities, skills, etc.):
{hr_input.get('role_info')}

Company: {hr_input.get('company_name')}
About Us: {hr_input.get('about_us')}

Generate the complete JD following the format specifications. Output only the formatted JD content."""
        
        # Prepare request headers
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://stackular.in", # Optional, for OpenRouter rankings
            "X-Title": "Stackular JD Generator", # Optional, for OpenRouter rankings
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
                return jd.strip()
            else:
                raise ValueError(f"Unexpected API response: {result}")
        
        except requests.exceptions.RequestException as e:
            print(f"API Error: {e}")
            print("Attempting fallback model...")
            return self._retry_with_fallback(system_prompt, user_prompt, headers)
    
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
                return result["choices"][0]["message"]["content"].strip()
        except Exception as e:
            print(f"Fallback also failed: {e}")
            raise
    
    def save_jd(self, jd_content: str, output_file: str = "generated_jd.txt") -> None:
        """Save generated JD to file"""
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(jd_content)
        print(f"JD saved to: {output_file}")
    
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
            elif 'what you' in lower_line and 'work' in lower_line or 'responsibilities' in lower_line or 'key responsibilities' in lower_line:
                current_section = 'work'
                current_items = []
            elif 'what you need' in lower_line or 'requirements' in lower_line or 'required skills' in lower_line:
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
                        current_items.append(item)
                # Handle regular text
                else:
                    if current_section == 'overview':
                        data['overview'] += line + ' '
                    elif current_section == 'about':
                        data['about'] += line + ' '
                    else:
                        if line:
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
            margin: 50px 75px;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            margin-bottom: 35px;
        }
        .logo {
            width: 140px;
            height: auto;
        }
        .role-section {
            margin-bottom: 18px;
        }
        .role-section p {
            margin: 3px 0;
            font-size: 12px;
            line-height: 1.5;
        }
        .role-title {
            margin-bottom: 5px !important;
        }
        .work-details {
            margin-bottom: 18px;
        }
        .work-details p {
            margin: 3px 0;
            font-size: 12px;
            line-height: 1.5;
        }
        .full-time-section {
            margin-bottom: 22px;
        }
        .full-time-section p {
            margin: 3px 0;
            font-size: 12px;
            line-height: 1.6;
        }
        .section {
            margin-bottom: 22px;
            page-break-inside: avoid;
        }
        h3 {
            margin: 0 0 12px 0;
            color: #000;
            font-size: 13px;
            font-weight: 700;
            page-break-after: avoid;
        }
        p {
            font-size: 12px;
            line-height: 1.6;
            margin: 0 0 12px 0;
        }
        strong {
            font-weight: 700;
        }
        ul {
            margin: 0 0 0 22px;
            padding: 0;
            list-style-type: disc;
        }
        li {
            margin-bottom: 8px;
            font-size: 12px;
            line-height: 1.6;
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
        <p class="role-title"><strong>Role:</strong> {{ role }}</p>
        <p><strong>Duration:</strong> {{ duration }}</p>
        <p><strong>Location:</strong> {{ location }}</p>
        <p><strong>Work mode:</strong> {{ work_mode }}</p>
    </div>

    <div class="work-details">
        <p><strong>Work Hours:</strong> {{ work_hours }}</p>
        <p><strong>Stipend:</strong> {{ stipend }}</p>
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
            
            print(f"✅ PDF generated successfully: {pdf_filename}")
            return True
            
        except Exception as e:
            print(f"❌ Error generating PDF: {e}")
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
        print("[OK] JD Generator initialized successfully")
        print(f"Using model: {generator.model}")
        print("-" * 60)
        
        # Generate JD
        print("Generating JD...")
        jd = generator.generate_jd(sample_input)
        
        # Save to file
        generator.save_jd(jd, "sample_generated_jd.txt")
        
        # Print to console (safely)
        print("\n" + "=" * 60)
        print("GENERATED JD:")
        print("=" * 60)
        try:
            print(jd)
        except UnicodeEncodeError:
            print(jd.encode('ascii', errors='replace').decode('ascii'))
        print("=" * 60)
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
