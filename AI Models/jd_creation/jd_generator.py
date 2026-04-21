"""
JD Generator using LLM (OpenRouter)
This module generates Job Descriptions based on HR form inputs
"""

import os
import json
import requests
from dotenv import load_dotenv
from typing import Dict, Any

# Load environment variables
load_dotenv()

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
        
        # Create the user prompt with the input data
        user_prompt = f"""Generate a professional Job Description based on this information:

Basic Info:
- Job Title: {hr_input.get('job_title')}
- Experience Level: {hr_input.get('experience_level')}
- Location: {hr_input.get('location')}
- Duration: {hr_input.get('duration')}
- Work Mode: {hr_input.get('work_mode')}
- Work Hours: {hr_input.get('work_hours')}
- Salary/Stipend: ₹{hr_input.get('stipend_salary')} INR/Month
{f"- Full-Time Offer: ₹{hr_input.get('fulltime_offer_salary')} INR/Month" if hr_input.get('fulltime_offer_salary') else ""}

Role Description (analyze this to extract responsibilities, skills, etc.):
{hr_input.get('role_info')}

Company: {hr_input.get('company_name')}
About Us: {hr_input.get('about_us')}

Generate the complete JD following the format specifications. Output only the formatted JD content."""
        
        # Prepare request headers
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
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
