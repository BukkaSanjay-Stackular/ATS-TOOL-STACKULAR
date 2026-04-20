"""
Configuration Module
Centralized paths and settings for the ATS system.
"""

from pathlib import Path


def get_project_root() -> Path:
    """
    Get the project root directory.
    
    Returns:
        Path: Absolute path to project root
    """
    # Navigate from src/utils/config.py up to project root
    return Path(__file__).parent.parent.parent


def get_uploads_folder() -> str:
    """
    Get the uploads folder path.
    
    Returns:
        str: Path to uploads folder
    """
    return str(get_project_root() / "data" / "uploads")


def get_db_path() -> str:
    """
    Get the database file path.
    
    Returns:
        str: Path to resumes.db
    """
    return str(get_project_root() / "data" / "database" / "resumes.db")
