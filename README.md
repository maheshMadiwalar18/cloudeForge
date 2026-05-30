# 🚀 CloudForge DevOps

**CloudForge DevOps** is an AI-powered platform that analyzes GitHub repositories and automatically generates production-ready infrastructure and deployment configurations.

By scanning the code structure and configuration files, it automatically detects the technology stack and generates:
- 🐳 **Dockerfiles** & **docker-compose.yml**
- ♾️ **GitHub Actions CI/CD** pipelines
- 🏗️ **Terraform** -- Infrastructure-as-Code

---

## 🛠️ Tech Stack
- **Backend Core**: FastAPI, Python 3.11, Pydantic, Uvicorn
- **AI / Scanner Engine**: PyGithub, GitPython
- **Frontend Dashboard**: Next.js, React, TailwindCSS, Monaco Editor, Zustand
- **Data & Message Queue**: PostgreSQL, Redis
- **Infrastructure**: AWS (ECS, EC2, S3), Terraform, Docker

## 📁 Repository Structure
- `backend/`: FastAPI API server, repo scanner service, and unit tests.
- `frontend/`: Next.js frontend web dashboard.
- `terraform/`: Infrastructure-as-Code scripts for AWS resources.
- `docker-compose.yml`: Multi-container configuration for backend, database, cache, and frontend.
- `docs/`: Architecture designs, DevSecOps reports, and cost optimization analyses.

---

## 🚀 Getting Started

### 🐳 Local Development (Docker Compose)
To spin up the entire application stack (Database, Redis, FastAPI backend, and Next.js frontend):
1. **Set up Environment variables**:
   Create a `.env` in `backend/` using the template:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. **Build and run**:
   ```bash
   docker-compose up --build -d
   ```
   - **Frontend UI**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:8000](http://localhost:8000)
   - **Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 💻 Local Development (Native Setup)

If you prefer running services natively:

#### 1. Start the Backend API
```bash
cd backend
python -m venv venv
# On Windows (Powershell):
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### 2. Start the Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Testing and Linting

We use unit tests and linting to ensure code quality.

### Run Backend Unit Tests
- **On Windows (PowerShell)**:
  ```powershell
  $env:PYTHONPATH="backend"
  python -m unittest discover -s backend/tests
  ```
- **On Linux/macOS**:
  ```bash
  PYTHONPATH=backend pytest backend/tests/
  ```

### Run Backend Linter & Security Scan
```bash
# Linting
flake8 backend
# Static Security analysis (SAST)
bandit -r backend -ll -ii
```

---

## 📚 Documentation
- **[System Architecture Design](docs/cloudforge_devops_architecture.md)**
- **[DevSecOps Risk Analysis](docs/devsecops_analysis.md)**
- **[Cloud Cost Optimization](docs/cost_optimization_analysis.md)**

---

## 🤝 Contributing & Open Source

We welcome contributions from the open-source community! 

Whether you want to fix a bug, suggest new features, or improve the documentation, please feel free to help make CloudForge better:
- **Read our contributing guide** in [CONTRIBUTING.md](CONTRIBUTING.md) to understand our coding standards and pull request process.
- **Report bugs or request features** by opening an issue using our [templates](.github/ISSUE_TEMPLATE/).
- Make sure to review our [Security Policy](SECURITY.md) before reporting any potential vulnerabilities.

Thank you for supporting open-source software!
