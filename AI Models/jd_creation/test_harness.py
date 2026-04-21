"""
Test Harness for JD Generator
Runs the generator with sample inputs and validates output
"""

import json
import os
from pathlib import Path
from jd_generator import JDGenerator


def load_json_file(filepath: str) -> dict:
    """Load a JSON test input file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: Test file {filepath} not found")
        return None
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in {filepath}: {e}")
        return None


def run_test(test_name: str, input_file: str, output_file: str):
    """Run a single JD generation test"""
    print(f"\n{'='*70}")
    print(f"TEST: {test_name}")
    print(f"{'='*70}")
    print(f"Input file: {input_file}")
    print(f"Output file: {output_file}")
    print("-" * 70)
    
    # Load test input
    test_input = load_json_file(input_file)
    if not test_input:
        return False
    
    print(f"✓ Loaded test input: {test_input.get('job_title', 'Unknown')}")
    
    try:
        # Initialize generator
        generator = JDGenerator()
        print("✓ JD Generator initialized")
        
        # Generate JD
        print("📝 Generating JD...")
        jd = generator.generate_jd(test_input)
        
        if not jd:
            print("✗ Generated JD is empty")
            return False
        
        print(f"✓ JD generated successfully ({len(jd)} characters)")
        
        # Save output
        generator.save_jd(jd, output_file)
        
        # Validate output
        if os.path.exists(output_file):
            print(f"✓ JD saved to {output_file}")
            
            # Print preview
            print("\n" + "-" * 70)
            print("PREVIEW (first 500 characters):")
            print("-" * 70)
            preview = jd[:500] + "..." if len(jd) > 500 else jd
            print(preview)
            print("-" * 70)
            
            return True
        else:
            print(f"✗ Failed to save JD to {output_file}")
            return False
    
    except Exception as e:
        print(f"✗ Error during test: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests"""
    print("\n")
    print("╔" + "═" * 68 + "╗")
    print("║" + " " * 68 + "║")
    print("║" + "JD GENERATOR - TEST HARNESS".center(68) + "║")
    print("║" + " " * 68 + "║")
    print("╚" + "═" * 68 + "╝")
    
    tests = [
        {
            "name": "AI/ML Intern – Agentic AI",
            "input": "test_input_ai_ml_intern.json",
            "output": "generated_jd_ai_ml_intern.txt"
        },
        {
            "name": "Full Stack Developer Intern",
            "input": "test_input_fullstack_intern.json",
            "output": "generated_jd_fullstack_intern.txt"
        }
    ]
    
    results = []
    
    for test in tests:
        result = run_test(test["name"], test["input"], test["output"])
        results.append({
            "test": test["name"],
            "status": "✓ PASS" if result else "✗ FAIL"
        })
    
    # Summary
    print(f"\n\n{'='*70}")
    print("TEST SUMMARY")
    print('='*70)
    
    for result in results:
        print(f"{result['status']:<10} {result['test']}")
    
    total = len(results)
    passed = sum(1 for r in results if "PASS" in r["status"])
    print(f"\nTotal: {passed}/{total} tests passed")
    print('='*70)
    
    return all("PASS" in r["status"] for r in results)


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
