import os
import shutil

def delete_directory(path):
    """
    Recursively delete a directory and its contents.
    """
    if os.path.exists(path):
        shutil.rmtree(path)
        print(f"Deleted directory: {path}")
    else:
        print(f"Directory not found: {path}")

def search_and_delete(root_path, target):
    """
    Recursively search for and delete specified directories.
    """
    for root, dirs, files in os.walk(root_path):
        for dir_name in dirs:
            if dir_name == target:
                dir_path = os.path.join(root, dir_name)
                delete_directory(dir_path)

def delete_db_file(root_path):
    """
    Delete the db.sqlite3 file from the root of the folder.
    """
    db_file = os.path.join(root_path, "db.sqlite3")
    if os.path.exists(db_file):
        os.remove(db_file)
        print(f"Deleted file: {db_file}")
    else:
        print("db.sqlite3 not found in the root folder")

def clean_project(root_path):
    """
    Clean the project by deleting all migrations and __pycache__ folders,
    and removing the db.sqlite3 file.
    """
    # Delete all migrations folders
    search_and_delete(root_path, "migrations")
    # Delete all __pycache__ folders
    search_and_delete(root_path, "__pycache__")
    # Delete db.sqlite3 from the root of the folder
    delete_db_file(root_path)

# Define the root path of the project folder
project_root_path = "../backend/"

# Run the clean project function
clean_project(project_root_path)
