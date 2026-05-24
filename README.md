# 🚀 CloudForge DevOps

**CloudForge DevOps** is an AI-powered platform that analyzes GitHub repositories and automatically generates production-ready infrastructure and deployment configurations.

By utilizing static code scanning and LLMs (LangChain + OpenRouter), it seamlessly detects your tech stack and scaffolds:
- 🐳 **Dockerfiles** & **docker-compose.yml**
- ♾️ **GitHub Actions CI/CD** pipelines
- 🏗️ **Terraform** -- Infrastructure-as-Code

---

## 🛠️ Tech Stack
- **Backend Core**: FastAPI, Python 3.11, Pydantic, Uvicorn
- **AI / Parsing Engine**: LangChain, PyGithub, GitPython
- **Data & Message Queue**: PostgreSQL, Redis, Celery
- **Infrastructure**: AWS (EC2, S3), Terraform, Docker

## 📁 Repository Structure
- `backend/`: The FastAPI server containing the API routes, Git repository scanner, and LLM Orchestrator prompts.
- `terraform/`: AWS infrastructure definitions (Security Groups, IAM Profiles, Auto-bootstrapped EC2).
- `docker-compose.yml`: The local development stack orchestrating the API, Postgres, and Redis.
- `docs/`: In-depth architectural designs, DevSecOps reports, and cost analyses.

---

## 🚀 Getting Started

### Local Development (Docker)
The easiest way to spin up the entire application stack:
```bash
# Start the API, Database, and Cache in the background
docker-compose up --build -d
```
Once running, the interactive API documentation will be available at: **http://localhost:8000/docs**

### Local Development (Native)
If you prefer running the API locally without Docker:
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## 📚 Documentation
Please refer to the `docs/` folder for comprehensive documentation created during the initial scaffolding:
- **[System Architecture Design](docs/cloudforge_devops_architecture.md)**
- **[DevSecOps Risk Analysis](docs/devsecops_analysis.md)**
- **[Cloud Cost Optimization](docs/cost_optimization_analysis.md)**
