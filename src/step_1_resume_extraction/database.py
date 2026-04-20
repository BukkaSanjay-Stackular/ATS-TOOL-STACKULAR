"""
SQLite Database Module
Handles database connection, table creation, and resume data insertion.
"""

import sqlite3
from pathlib import Path
from typing import Optional


class ResumeDatabase:
    """Manages SQLite database for resume storage."""
    
    def __init__(self, db_path: str):
        """
        Initialize database connection.
        
        Args:
            db_path (str): Path to the SQLite database file
        """
        self.db_path = db_path
        self.connection = None
    
    def connect(self):
        """Establish database connection."""
        try:
            # Create parent directory if it doesn't exist
            Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
            
            self.connection = sqlite3.connect(self.db_path)
            print(f"✓ Connected to database: {self.db_path}")
        except Exception as e:
            print(f"❌ Failed to connect to database: {str(e)}")
            raise
    
    def create_table(self):
        """Create resumes table if it doesn't exist."""
        try:
            cursor = self.connection.cursor()
            
            # Create table with schema
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS resumes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    email TEXT,
                    phone TEXT,
                    content TEXT NOT NULL,
                    file_path TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            self.connection.commit()
            print("✓ Table 'resumes' ready")
        except Exception as e:
            print(f"❌ Error creating table: {str(e)}")
            raise
    
    def insert_resume(self, name: Optional[str], email: Optional[str], 
                     phone: Optional[str], content: str, file_path: str) -> bool:
        """
        Insert a resume record into the database.
        
        Args:
            name (Optional[str]): Candidate name
            email (Optional[str]): Candidate email
            phone (Optional[str]): Candidate phone
            content (str): Full resume text
            file_path (str): Path to the resume file
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            cursor = self.connection.cursor()
            
            cursor.execute('''
                INSERT INTO resumes (name, email, phone, content, file_path)
                VALUES (?, ?, ?, ?, ?)
            ''', (name, email, phone, content, file_path))
            
            self.connection.commit()
            return True
        except Exception as e:
            print(f"❌ Error inserting resume: {str(e)}")
            return False
    
    def close(self):
        """Close database connection."""
        if self.connection:
            self.connection.close()
            print("✓ Database connection closed")
    
    def get_resume_count(self) -> int:
        """
        Get total number of resumes in database.
        
        Returns:
            int: Number of resumes
        """
        try:
            cursor = self.connection.cursor()
            cursor.execute('SELECT COUNT(*) FROM resumes')
            count = cursor.fetchone()[0]
            return count
        except Exception as e:
            print(f"❌ Error fetching count: {str(e)}")
            return 0
