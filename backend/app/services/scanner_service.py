import os
import stat
import json
import tempfile
import shutil
from pathlib import Path
from typing import Dict, Any, Optional
from git import Repo
from github import Github

class RepositoryAnalyzer:
    def __init__(self, github_token: Optional[str] = None):
        """
        Initializes the PyGithub client.
        :param github_token: Optional personal access token to prevent rate limits.
        """
        self.github_client = Github(github_token) if github_token else Github()

    def analyze(self, repo_url: str) -> str:
        """
        Clones a repository, analyzes its tech stack, and returns a JSON summary.
        """
        # Parse owner and repo name from URL
        parts = repo_url.rstrip("/").split("/")
        owner, repo_name = parts[-2], parts[-1]
        if repo_name.endswith(".git"):
            repo_name = repo_name[:-4]

        # Fetch metadata using PyGithub (default branch)
        try:
            repo_meta = self.github_client.get_repo(f"{owner}/{repo_name}")
            default_branch = repo_meta.default_branch
        except Exception:
            # Fallback if repository is unauthenticated or API rate limit exceeded
            default_branch = "main"

        # Create temporary directory for cloning
        temp_dir = tempfile.mkdtemp(prefix="cloudforge_repo_")
        
        try:
            # Perform a shallow clone of the default branch to save time and bandwidth
            Repo.clone_from(repo_url, temp_dir, depth=1, branch=default_branch)
            
            # Run the local scanner
            analysis_result = self._scan_directory(temp_dir)
            analysis_result["repository"] = repo_url
            
            return json.dumps(analysis_result, indent=2)
            
        except Exception as e:
            return json.dumps({"error": str(e), "repository": repo_url})
        finally:
            # Clean up the temporary clone
            if os.path.exists(temp_dir):
                self._remove_readonly(temp_dir)

    def _scan_directory(self, root_path: str) -> Dict[str, Any]:
        """
        Traverses the local directory to detect the tech stack based on manifest files.
        """
        root = Path(root_path)
        
        detected_language = "Unknown"
        detected_framework = "Unknown"
        package_manager = "Unknown"
        database_usage = "None"
        
        important_files = {
            "package.json": None,
            "requirements.txt": None,
            "Dockerfile": None,
            "pom.xml": None
        }

        # 1. Attempt to read important files
        for filename in important_files.keys():
            file_path = root / filename
            if file_path.exists():
                try:
                    content = file_path.read_text(encoding="utf-8")
                    # Cap content to 2000 chars to avoid massively bloated JSON payloads
                    important_files[filename] = content[:2000]
                except Exception:
                    important_files[filename] = "Error reading file content"

        # 2. Analyze logic based on discovered manifests
        if important_files["package.json"]:
            detected_language = "JavaScript/TypeScript"
            package_manager = "npm/yarn"
            content = important_files["package.json"].lower()
            
            if "next" in content:
                detected_framework = "Next.js"
            elif "express" in content:
                detected_framework = "Express.js"
            elif "react" in content:
                detected_framework = "React"
                
            if any(db in content for db in ["pg", "mysql", "mongoose", "prisma", "sequelize"]):
                database_usage = "Detected via package.json"

        elif important_files["requirements.txt"]:
            detected_language = "Python"
            package_manager = "pip"
            content = important_files["requirements.txt"].lower()
            
            if "fastapi" in content:
                detected_framework = "FastAPI"
            elif "django" in content:
                detected_framework = "Django"
            elif "flask" in content:
                detected_framework = "Flask"
                
            if any(db in content for db in ["psycopg2", "sqlalchemy", "pymongo", "asyncpg"]):
                database_usage = "Detected via requirements.txt"

        elif important_files["pom.xml"]:
            detected_language = "Java"
            package_manager = "Maven"
            content = important_files["pom.xml"].lower()
            
            if "spring-boot" in content:
                detected_framework = "Spring Boot"
            
            if any(db in content for db in ["postgresql", "mysql", "hibernate"]):
                database_usage = "Detected via pom.xml"

        # Check for existing Dockerfile natively
        has_dockerfile = important_files["Dockerfile"] is not None

        return {
            "tech_stack": {
                "language": detected_language,
                "framework": detected_framework,
                "package_manager": package_manager,
                "database_usage": database_usage,
                "has_dockerfile": has_dockerfile
            },
            "extracted_files": {k: v for k, v in important_files.items() if v is not None}
        }

    def _remove_readonly(self, path: str):
        """
        Helper method to forcefully remove git objects which can be marked as Read-Only on Windows.
        """
        def remove_readonly(func, path, _):
            os.chmod(path, stat.S_IWRITE)
            func(path)
        shutil.rmtree(path, onerror=remove_readonly)

# Example Usage
if __name__ == "__main__":
    analyzer = RepositoryAnalyzer()
    # Note: Replace with a valid public repository URL for testing
    test_url = "https://github.com/tiangolo/fastapi"
    print(f"Analyzing {test_url}...")
    result = analyzer.analyze(test_url)
    print(result)
