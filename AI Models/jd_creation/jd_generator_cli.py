"""
Interactive CLI Tool for JD Generation (SIMPLIFIED)
Takes only 8 basic inputs + role description, LLM generates the rest
"""

import json
import os
from jd_generator import JDGenerator


def get_user_input(prompt: str, input_type: str = "text", options: list = None, required: bool = True) -> str:
    """Get input from user with validation"""
    while True:
        value = input(prompt).strip()
        
        if required and not value:
            print("❌ This field is required. Please try again.")
            continue
        
        if input_type == "select" and options:
            if value not in options:
                print(f"❌ Please select from: {', '.join(options)}")
                continue
        
        if input_type == "number" and value:
            try:
                int(value)
            except ValueError:
                print("❌ Please enter a valid number.")
                continue
        
        return value


def collect_hr_inputs() -> dict:
    """Interactively collect 8 basic inputs + role description"""
    
    print("\n" + "="*70)
    print("JD GENERATOR - SIMPLIFIED INPUT")
    print("="*70)
    print("\nFill in basic position details (8 fields)")
    print("Then describe the role - LLM will generate skills, responsibilities, etc.\n")
    
    # Section 1: Basic Details (8 fields)
    print("\n📋 POSITION DETAILS")
    print("-" * 70)
    
    experience_level = get_user_input(
        "1. Experience Level (Intern/Fresher/Experienced): ",
        input_type="select",
        options=["Intern", "Fresher", "Experienced"],
        required=True
    )
    
    job_title = get_user_input(
        "2. Job Title: ",
        required=True
    )
    
    duration = get_user_input(
        "3. Duration (e.g., '6 Months', 'Permanent'): ",
        required=True
    )
    
    location = get_user_input(
        "4. Location: ",
        required=True
    )
    
    work_mode = get_user_input(
        "5. Work Mode (On-site/Remote/Hybrid): ",
        input_type="select",
        options=["On-site", "Remote", "Hybrid"],
        required=True
    )
    
    work_hours = get_user_input(
        "6. Work Hours (e.g., '11:00 AM to 8:00 PM'): ",
        required=True
    )
    
    print("\n💰 COMPENSATION")
    print("-" * 70)
    
    stipend_salary = get_user_input(
        "7. Stipend/Salary (INR): ",
        input_type="number",
        required=True
    )
    
    fulltime_offer_salary = get_user_input(
        "8. Full-Time Offer Salary (optional, INR): ",
        input_type="number",
        required=False
    )
    
    # Section 2: Role Description (LLM will process this)
    print("\n📝 ROLE DESCRIPTION")
    print("-" * 70)
    print("Describe the role in your own words.")
    print("Include what the person will work on, key responsibilities, and any special requirements.")
    print("(Press Enter twice when done)\n")
    
    role_info_lines = []
    while True:
        line = input("").strip()
        if not line:
            if role_info_lines:
                break
            print("⚠️  Please describe the role")
            continue
        role_info_lines.append(line)
    role_info = "\n".join(role_info_lines)
    
    # Compile all inputs (minimal set)
    hr_input = {
        "company_name": "Stackular",  # Default
        "experience_level": experience_level,
        "job_title": job_title,
        "duration": duration,
        "location": location,
        "work_mode": work_mode,
        "work_hours": work_hours,
        "stipend_salary": int(stipend_salary),
        "fulltime_offer_salary": int(fulltime_offer_salary) if fulltime_offer_salary else None,
        "currency": "INR",  # Default
        "role_info": role_info,  # FREE TEXT for LLM to process
        "about_us": "At Stackular, we are more than just a team – we are a product development community driven by a shared vision. Our values shape who we are, what we do, and how we interact with our peers and our customers. We're not just seeking any regular engineer; we want individuals who identify with our core values and are passionate about software development."  # Default
    }
    
    return hr_input


def main():
    """Main CLI function"""
    
    print("\n")
    print("╔" + "═"*68 + "╗")
    print("║" + " "*68 + "║")
    print("║" + "JD GENERATOR - INTERACTIVE CLI TOOL".center(68) + "║")
    print("║" + " "*68 + "║")
    print("╚" + "═"*68 + "╝")
    
    try:
        # Collect inputs
        hr_input = collect_hr_inputs()
        
        # Summary
        print("\n" + "="*70)
        print("SUMMARY")
        print("="*70)
        print(f"Job Title: {hr_input['job_title']}")
        print(f"Experience Level: {hr_input['experience_level']}")
        print(f"Location: {hr_input['location']}")
        print(f"Company: {hr_input['company_name']}")
        
        # Confirm before generating
        confirm = input("\n✓ Ready to generate JD? (yes/no): ").strip().lower()
        if confirm != "yes":
            print("❌ Cancelled.")
            return
        
        # Generate JD
        print("\n📝 Generating JD using LLM...")
        generator = JDGenerator()
        jd = generator.generate_jd(hr_input)
        
        if not jd:
            print("❌ Failed to generate JD")
            return
        
        # Save output
        output_file = f"jd_{hr_input['job_title'].replace(' ', '_').replace('–', '-')}.txt"
        generator.save_jd(jd, output_file)
        
        # Display result
        print("\n" + "="*70)
        print("✅ JD GENERATED SUCCESSFULLY")
        print("="*70)
        print(f"\n📄 Saved to: {output_file}\n")
        print(jd)
        print("\n" + "="*70)
        
    except KeyboardInterrupt:
        print("\n\n❌ Cancelled by user.")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
