from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
import asyncio
from app.logger import logger

router = APIRouter()

class AnalyzeRequest(BaseModel):
    github_url: str
    branch: str = "main"

async def mock_analysis_task(repo_url: str):
    """
    Mock background task for repository analysis.
    """
    logger.info(f"Starting analysis for {repo_url}...")
    await asyncio.sleep(2) # Simulate async IO-bound work
    logger.info(f"Completed analysis for {repo_url}")

@router.post("/")
async def trigger_analysis(request: AnalyzeRequest, background_tasks: BackgroundTasks):
    """
    Trigger a repository analysis asynchronously using FastAPI BackgroundTasks.
    """
    logger.info(f"Received request to analyze: {request.github_url}")
    
    # Delegate to a background task so the API response isn't blocked
    background_tasks.add_task(mock_analysis_task, request.github_url)
    
    return {
        "message": "Analysis triggered successfully", 
        "repository": request.github_url,
        "status": "pending"
    }
