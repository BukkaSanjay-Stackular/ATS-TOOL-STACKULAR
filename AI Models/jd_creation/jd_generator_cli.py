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
    """Interactively collect HR inputs - all optional except job_title and role_info"""
    
    print("\n" + "="*70)
    print("JD GENERATOR - INTERACTIVE INPUT")
    print("="*70)
    print("\n⚠️  Only Job Title and Role Description are mandatory.")
    print("Leave fields blank to skip (LLM will adapt the JD)\n")
    
    # Section 1: Basic Details (optional)
    print("\n📋 POSITION DETAILS (Optional)")
    print("-" * 70)
    
    job_title = get_user_input(
        "1. Job Title (MANDATORY): ",
        required=True
    )
    
    experience_level = get_user_input(
        "2. Experience Level (Intern/Fresher/Experienced): ",
        input_type="select",
        options=["Intern", "Fresher", "Experienced"],
        required=False
    )
    
    duration = get_user_input(
        "3. Duration (e.g., '6 Months', 'Permanent'): ",
        required=False
    )
    
    location = get_user_input(
        "4. Location: ",
        required=False
    )
    
    work_mode = get_user_input(
        "5. Work Mode (On-site/Remote/Hybrid): ",
        input_type="select",
        options=["On-site", "Remote", "Hybrid"],
        required=False
    )
    
    work_hours = get_user_input(
        "6. Work Hours (e.g., '2 PM to 8 PM'): ",
        required=False
    )
    
    years_of_experience = get_user_input(
        "7. Years of Experience Required: ",
        input_type="number",
        required=False
    )
    
    print("\n💰 COMPENSATION (Optional)")
    print("-" * 70)
    
    stipend_salary = get_user_input(
        "8. Salary/Stipend (INR): ",
        input_type="number",
        required=False
    )
    
    fulltime_offer_salary = get_user_input(
        "9. Full-Time Offer Salary (INR): ",
        input_type="number",
        required=False
    )
    
    # Section 2: Role Description (MANDATORY)
    print("\n📝 ROLE DESCRIPTION (MANDATORY)")
    print("-" * 70)
    print("Describe the role, responsibilities, skills needed, and requirements.")
    print("(Press Enter twice when done)\n")
    
    role_info_lines = []
    while True:
        line = input("").strip()
        if not line:
            if role_info_lines:
                break
            print("⚠️  Role description is required. Please describe the role.")
            continue
        role_info_lines.append(line)
    role_info = "\n".join(role_info_lines)
    
    # Compile all inputs
    hr_input = {
        "company_name": "Stackular",
        "experience_level": experience_level if experience_level else None,
        "job_title": job_title,
        "duration": duration if duration else None,
        "location": location if location else None,
        "work_mode": work_mode if work_mode else None,
        "work_hours": work_hours if work_hours else None,
        "years_of_experience": int(years_of_experience) if years_of_experience else None,
        "stipend_salary": int(stipend_salary) if stipend_salary else None,
        "fulltime_offer_salary": int(fulltime_offer_salary) if fulltime_offer_salary else None,
        "currency": "INR",
        "role_info": role_info,
        "about_us": "At Stackular, we are more than just a team – we are a product development community driven by a shared vision. Our values shape who we are, what we do, and how we interact with our peers and our customers."
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
        
        # Save text output
        base_filename = f"jd_{hr_input['job_title'].replace(' ', '_').replace('–', '-')}"
        output_file = f"{base_filename}.txt"
        generator.save_jd(jd, output_file)
        
        # Display result
        print("\n" + "="*70)
        print("✅ JD GENERATED SUCCESSFULLY")
        print("="*70)
        print(f"\n📄 Saved to: {output_file}\n")
        print(jd)
        print("\n" + "="*70)
        
        # Ask if user wants PDF
        print("\n📄 PDF Generation")
        print("-" * 70)
        print(f"📝 You can now edit the file '{output_file}' if needed.")
        pdf_choice = input("Would you like to generate a PDF version? (yes/no): ").strip().lower()
        
        if pdf_choice == "yes":
            print("\n📝 Generating PDF...")
            # Re-read from file to capture any edits user made
            try:
                with open(output_file, 'r', encoding='utf-8') as f:
                    jd_from_file = f.read()
                
                success = generator.generate_pdf(jd_from_file, hr_input, base_filename)
                
                if success:
                    print(f"✅ PDF generated and downloaded successfully as: {base_filename}.pdf")
                else:
                    print("⚠️  PDF generation failed, but text file is available.")
            except FileNotFoundError:
                print(f"❌ Error: File {output_file} not found.")
                print("⚠️  PDF generation skipped.")
        else:
            print("ℹ️  Skipping PDF generation.")
        
        print("\n" + "="*70)
        print("✅ PROCESS COMPLETED")
        print("="*70)
        
    except KeyboardInterrupt:
        print("\n\n❌ Cancelled by user.")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
