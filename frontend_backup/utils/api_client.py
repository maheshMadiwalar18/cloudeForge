import os
import requests

# Use internal docker network URL if running in docker-compose, otherwise localhost
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000/api/v1")

def trigger_analysis(repo_url: str) -> dict:
    """
    Calls the FastAPI backend to trigger the async repository scan.
    """
    try:
        response = requests.post(
            f"{API_BASE_URL}/analyze/", 
            json={"github_url": repo_url, "branch": "main"}
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"Backend API error: {str(e)}")

def get_task_status(task_id: str) -> dict:
    """
    Polls the backend for Celery task status.
    """
    # Placeholder for actual API endpoint integration
    return {"status": "COMPLETED"}
