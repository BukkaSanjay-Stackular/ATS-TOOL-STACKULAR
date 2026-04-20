"""
Resume Data Parser Module
Handles regex-based extraction of email, phone, and name from resume text.
"""

import re
from typing import Optional, Tuple


def extract_email(text: str) -> Optional[str]:
    """
    Extract email address from text using regex.
    
    Args:
        text (str): The text to search
        
    Returns:
        Optional[str]: First email found or None
    """
    # Regex pattern for email addresses
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    match = re.search(email_pattern, text)
    return match.group(0) if match else None


def extract_phone(text: str) -> Optional[str]:
    """
    Extract phone number from text using regex.
    Matches various formats: (123) 456-7890, 123-456-7890, 1234567890, +1-123-456-7890
    
    Args:
        text (str): The text to search
        
    Returns:
        Optional[str]: First phone number found or None
    """
    # Regex pattern for phone numbers (US and international formats)
    phone_pattern = r'(\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    match = re.search(phone_pattern, text)
    return match.group(0) if match else None


def extract_name(text: str) -> Optional[str]:
    """
    Extract name from resume text.
    Simple heuristic: assumes the first non-empty line is the candidate's name.
    
    Args:
        text (str): The extracted resume text
        
    Returns:
        Optional[str]: The extracted name or None
    """
    # Split text into lines
    lines = text.split('\n')
    
    # Find first non-empty line (typically the name at top of resume)
    for line in lines:
        cleaned_line = line.strip()
        # Skip very short lines and lines that look like email/phone
        if cleaned_line and len(cleaned_line) > 2 and '@' not in cleaned_line:
            return cleaned_line
    
    return None


def parse_resume(text: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """
    Parse resume text and extract name, email, and phone.
    
    Args:
        text (str): The full resume text
        
    Returns:
        Tuple: (name, email, phone)
    """
    name = extract_name(text)
    email = extract_email(text)
    phone = extract_phone(text)
    
    return name, email, phone
