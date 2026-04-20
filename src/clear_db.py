"""
Database Cleanup Script
Clears all records from the resumes database.
"""

import sqlite3
from pathlib import Path


def clear_database(db_path: str):
    """
    Clear all resume records from the database.
    
    Args:
        db_path (str): Path to the SQLite database file
    """
    try:
        db_path_obj = Path(db_path)
        
        if not db_path_obj.exists():
            print(f"⚠️  Database not found: {db_path}")
            return
        
        # Connect to database
        connection = sqlite3.connect(db_path)
        cursor = connection.cursor()
        
        # Get current count
        cursor.execute('SELECT COUNT(*) FROM resumes')
        old_count = cursor.fetchone()[0]
        
        # Delete all records
        cursor.execute('DELETE FROM resumes')
        connection.commit()
        
        print(f"✓ Database cleared successfully")
        print(f"  Deleted {old_count} resume(s)")
        
        # Get new count
        cursor.execute('SELECT COUNT(*) FROM resumes')
        new_count = cursor.fetchone()[0]
        print(f"  Records remaining: {new_count}")
        
        connection.close()
        
    except Exception as e:
        print(f"❌ Error clearing database: {str(e)}")


def delete_database(db_path: str):
    """
    Delete the entire database file.
    
    Args:
        db_path (str): Path to the SQLite database file
    """
    try:
        db_path_obj = Path(db_path)
        
        if not db_path_obj.exists():
            print(f"⚠️  Database file not found: {db_path}")
            return
        
        db_path_obj.unlink()  # Delete the file
        print(f"✓ Database file deleted: {db_path}")
        
    except Exception as e:
        print(f"❌ Error deleting database: {str(e)}")


def main():
    """
    Entry point for the cleanup script.
    """
    project_root = Path(__file__).parent.parent
    db_path = str(project_root / "data" / "database" / "resumes.db")
    
    print("\n" + "="*60)
    print("🗑️  Database Cleanup Tool")
    print("="*60 + "\n")
    
    print("Options:")
    print("  1 - Clear all records (keep database file)")
    print("  2 - Delete database file completely")
    print("  0 - Cancel")
    print()
    
    choice = input("Select option (0-2): ").strip()
    
    if choice == "1":
        clear_database(db_path)
    elif choice == "2":
        confirm = input("Are you sure? This will delete the entire database file. (yes/no): ").strip().lower()
        if confirm == "yes":
            delete_database(db_path)
        else:
            print("❌ Cancelled")
    elif choice == "0":
        print("❌ Cancelled")
    else:
        print("❌ Invalid option")
    
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
