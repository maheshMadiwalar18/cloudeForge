import unittest
import json
import tempfile
import shutil
from pathlib import Path
from unittest.mock import patch, MagicMock

from app.services.scanner_service import RepositoryAnalyzer

class TestRepositoryAnalyzer(unittest.TestCase):

    @patch('app.services.scanner_service.Github')
    def test_analyzer_init(self, mock_github):
        RepositoryAnalyzer(github_token="abc")
        mock_github.assert_called_with("abc")

    @patch('app.services.scanner_service.Repo')
    @patch('app.services.scanner_service.Github')
    def test_analyze_success(self, mock_github_class, mock_repo_class):
        # Mock Github client get_repo default branch
        mock_repo_meta = MagicMock()
        mock_repo_meta.default_branch = "development"
        mock_github_instance = MagicMock()
        mock_github_instance.get_repo.return_value = mock_repo_meta
        mock_github_class.return_value = mock_github_instance

        analyzer = RepositoryAnalyzer(github_token="mock_token")

        # Mock scanner method to return a dummy dict
        analyzer._scan_directory = MagicMock(return_value={
            "tech_stack": {
                "language": "Python",
                "framework": "FastAPI",
                "package_manager": "pip",
                "database_usage": "None",
                "has_dockerfile": False
            },
            "extracted_files": {}
        })

        result_str = analyzer.analyze("https://github.com/test-owner/test-repo")
        result = json.loads(result_str)

        self.assertEqual(result["repository"], "https://github.com/test-owner/test-repo")
        self.assertEqual(result["tech_stack"]["language"], "Python")
        self.assertEqual(result["tech_stack"]["framework"], "FastAPI")
        
        # Verify Github API call
        mock_github_instance.get_repo.assert_called_once_with("test-owner/test-repo")
        # Verify Git clone call
        mock_repo_class.clone_from.assert_called_once()

    @patch('app.services.scanner_service.Repo')
    @patch('app.services.scanner_service.Github')
    def test_analyze_clone_failure(self, mock_github_class, mock_repo_class):
        # Mock clone_from to raise exception
        mock_repo_class.clone_from.side_effect = Exception("Failed to clone")
        
        analyzer = RepositoryAnalyzer(github_token="mock_token")
        result_str = analyzer.analyze("https://github.com/test-owner/test-repo")
        result = json.loads(result_str)

        self.assertIn("error", result)
        self.assertEqual(result["error"], "Failed to clone")
        self.assertEqual(result["repository"], "https://github.com/test-owner/test-repo")

    def test_scan_directory_python(self):
        analyzer = RepositoryAnalyzer(github_token="mock_token")
        # Create a temp directory to simulate a python repository
        temp_dir = tempfile.mkdtemp()
        try:
            req_file = Path(temp_dir) / "requirements.txt"
            req_file.write_text("fastapi==0.111.0\nsqlalchemy==2.0.0", encoding="utf-8")

            result = analyzer._scan_directory(temp_dir)
            
            self.assertEqual(result["tech_stack"]["language"], "Python")
            self.assertEqual(result["tech_stack"]["framework"], "FastAPI")
            self.assertEqual(result["tech_stack"]["package_manager"], "pip")
            self.assertEqual(result["tech_stack"]["database_usage"], "Detected via requirements.txt")
            self.assertFalse(result["tech_stack"]["has_dockerfile"])
            self.assertIn("requirements.txt", result["extracted_files"])
        finally:
            shutil.rmtree(temp_dir)

    def test_scan_directory_javascript(self):
        analyzer = RepositoryAnalyzer(github_token="mock_token")
        # Create a temp directory to simulate a js next.js repository
        temp_dir = tempfile.mkdtemp()
        try:
            pkg_file = Path(temp_dir) / "package.json"
            pkg_file.write_text(json.dumps({
                "dependencies": {
                    "next": "14.0.0",
                    "pg": "8.0.0"
                }
            }), encoding="utf-8")
            
            docker_file = Path(temp_dir) / "Dockerfile"
            docker_file.write_text("FROM node:18", encoding="utf-8")

            result = analyzer._scan_directory(temp_dir)
            
            self.assertEqual(result["tech_stack"]["language"], "JavaScript/TypeScript")
            self.assertEqual(result["tech_stack"]["framework"], "Next.js")
            self.assertEqual(result["tech_stack"]["package_manager"], "npm/yarn")
            self.assertEqual(result["tech_stack"]["database_usage"], "Detected via package.json")
            self.assertTrue(result["tech_stack"]["has_dockerfile"])
        finally:
            shutil.rmtree(temp_dir)

    def test_scan_directory_java(self):
        analyzer = RepositoryAnalyzer(github_token="mock_token")
        temp_dir = tempfile.mkdtemp()
        try:
            pom_file = Path(temp_dir) / "pom.xml"
            pom_file.write_text("<project><dependencies><dependency><artifactId>spring-boot-starter-web</artifactId></dependency></dependencies></project>", encoding="utf-8")

            result = analyzer._scan_directory(temp_dir)
            
            self.assertEqual(result["tech_stack"]["language"], "Java")
            self.assertEqual(result["tech_stack"]["framework"], "Spring Boot")
            self.assertEqual(result["tech_stack"]["package_manager"], "Maven")
        finally:
            shutil.rmtree(temp_dir)
