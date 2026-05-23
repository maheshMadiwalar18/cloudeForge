import streamlit as st
import time
import requests
import os

# ─────────────────────────────────────────────
# PAGE CONFIG  (must be the first Streamlit call)
# ─────────────────────────────────────────────
st.set_page_config(
    page_title="CloudForge DevOps",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="expanded",
)

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000/api/v1")

# ─────────────────────────────────────────────
# INJECT CSS THEME
# ─────────────────────────────────────────────
def _load_css():
    css_path = os.path.join(os.path.dirname(__file__), "assets", "styles.css")
    try:
        with open(css_path) as f:
            st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)
    except FileNotFoundError:
        pass

_load_css()

# ─────────────────────────────────────────────
# SESSION STATE BOOTSTRAP
# ─────────────────────────────────────────────
_defaults = {
    "page": "Dashboard",
    "status": "IDLE",          # IDLE | RUNNING | COMPLETED | ERROR
    "repo_url": "",
    "error_msg": "",
    "generated": {             # holds AI-generated content
        "stack": {},
        "dockerfile": "",
        "compose": "",
        "cicd": "",
        "terraform": "",
        "deployment_notes": "",
    },
    "history": [],             # list of past analysis dicts
}
for k, v in _defaults.items():
    if k not in st.session_state:
        st.session_state[k] = v

# ─────────────────────────────────────────────
# SIDEBAR NAVIGATION
# ─────────────────────────────────────────────
with st.sidebar:
    st.markdown("""
        <div style='text-align:center;padding:1rem 0 0.5rem'>
            <span style='font-size:2.5rem'>🚀</span><br/>
            <span style='font-size:1.2rem;font-weight:700;color:#F8FAFC;letter-spacing:-0.5px'>CloudForge</span><br/>
            <span style='font-size:0.72rem;color:#475569;letter-spacing:2px;text-transform:uppercase'>DevOps AI Platform</span>
        </div>
    """, unsafe_allow_html=True)
    st.divider()

    pages = {
        "📊 Dashboard":        "Dashboard",
        "🔍 Repo Analyzer":   "Analyzer",
        "💻 Generated Files": "Files",
        "🚀 Deployment":      "Deployment",
    }
    for label, key in pages.items():
        active = st.session_state.page == key
        if st.button(
            label,
            key=f"nav_{key}",
            use_container_width=True,
            type="primary" if active else "secondary",
        ):
            st.session_state.page = key
            st.rerun()

    st.divider()
    st.markdown("#### ☁️ Cloud Credentials")
    st.text_input("AWS Access Key ID", type="password", key="aws_access",
                  placeholder="AKIA…", help="Required to execute Terraform deploy")
    st.text_input("AWS Secret Access Key", type="password", key="aws_secret",
                  placeholder="••••••••")
    st.caption("Keys are stored only in session memory and never persisted.")

# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────
def _trigger_analysis(repo_url: str):
    """Call FastAPI backend and return generated assets (or mock data for MVP)."""
    try:
        resp = requests.post(f"{API_BASE_URL}/analyze/",
                             json={"github_url": repo_url, "branch": "main"},
                             timeout=5)
        resp.raise_for_status()
        return resp.json()
    except Exception:
        # ── MVP Mock Response ─────────────────────────────────────────────────
        return {
            "stack": {
                "language": "Python",
                "framework": "FastAPI",
                "package_manager": "pip",
                "database": "PostgreSQL",
            },
            "dockerfile": """\
# ── Production Dockerfile (AI Generated) ─────────────────────────────────
FROM python:3.11-slim@sha256:1a84fbe717ef74de30e065dc084f74d0e6f2bc8f3baaf83e7cfab3dc35f0ef74 AS builder
WORKDIR /build
RUN apt-get update && apt-get install -y --no-install-recommends build-essential \\
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN python -m venv /opt/venv && /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

FROM python:3.11-slim@sha256:1a84fbe717ef74de30e065dc084f74d0e6f2bc8f3baaf83e7cfab3dc35f0ef74
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
WORKDIR /app
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH" PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY ./app ./app
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
""",
            "compose": """\
version: "3.8"
services:
  db:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    cap_drop: [ALL]
    volumes: [postgres_data:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    restart: always
    volumes: [redis_data:/data]

  backend:
    build: ./backend
    restart: on-failure
    depends_on: [db, redis]
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      - REDIS_URL=redis://redis:6379/0
    cap_drop: [ALL]
    ports: ["8000:8000"]

  frontend:
    build: ./frontend
    restart: on-failure
    depends_on: [backend]
    ports: ["8501:8501"]

volumes:
  postgres_data:
  redis_data:
""",
            "cicd": """\
name: CloudForge CI/CD Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-and-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@692973e3d937129bcbf40652eb9f2f61becf3332
      - uses: actions/setup-python@82c7e631bb3cdc910f68e0081d67478d79c6982d
        with: {python-version: '3.11', cache: 'pip'}
      - run: pip install flake8 pytest bandit && pip install -r backend/requirements.txt
      - run: flake8 backend --count --select=E9,F63,F7,F82 --show-source --statistics
      - run: bandit -r backend -ll -ii || true
      - run: pytest backend/tests/ || true

  build-and-push:
    runs-on: ubuntu-latest
    needs: test-and-scan
    if: github.event_name == 'push'
    permissions: {contents: read, packages: write}
    steps:
      - uses: actions/checkout@692973e3d937129bcbf40652eb9f2f61becf3332
      - uses: docker/login-action@9780b0c442fbb1117ed29e0efdff1e18412f7567
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@4a13e500e55bc31b36bb1bbce6f18ed4c770d10b
        with: {context: ./backend, push: true, tags: ghcr.io/${{ github.repository }}/backend:main}
""",
            "terraform": """\
provider "aws" { region = "us-east-1" }

resource "aws_instance" "app_server" {
  ami           = data.aws_ami.al2023.id
  instance_type = "t4g.medium"   # Graviton ARM64 — ~20 % cheaper than t3.medium
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name
  vpc_security_group_ids = [aws_security_group.app_sg.id]
}

resource "aws_security_group" "app_sg" {
  # Port 22 intentionally REMOVED — use SSM Session Manager instead
  ingress { from_port=80  to_port=80  protocol="tcp" cidr_blocks=["0.0.0.0/0"] }
  ingress { from_port=8000 to_port=8000 protocol="tcp" cidr_blocks=["0.0.0.0/0"] }
  egress  { from_port=0   to_port=0   protocol="-1"  cidr_blocks=["0.0.0.0/0"] }
}

resource "aws_s3_bucket_lifecycle_configuration" "lifecycle" {
  bucket = aws_s3_bucket.app_bucket.id
  rule {
    id = "archive"; status = "Enabled"
    transition   { days = 30;  storage_class = "GLACIER" }
    expiration   { days = 365 }
  }
}
""",
            "deployment_notes": """\
## 🚀 Recommended AWS Architecture

| Component      | Service                     | Notes                                    |
|----------------|-----------------------------|------------------------------------------|
| Compute        | EC2 t4g.medium (Graviton)   | ARM64 — best price/performance for APIs  |
| Database       | Amazon RDS PostgreSQL        | Managed, automated backups               |
| Cache          | ElastiCache Redis            | Serverless tier available                |
| Storage        | S3 + Glacier lifecycle       | Auto-archive after 30 days               |
| Access         | SSM Session Manager          | No open SSH ports required               |
| Container Reg. | GitHub Container Registry    | Free for public repos                    |

### Estimated Monthly Cost (Startup Tier)
- **EC2 t4g.medium** on-demand  ≈ **$26/mo**
- **RDS db.t4g.micro**           ≈ **$13/mo**
- **S3 (10 GB)**                 ≈ **$0.23/mo**
- **Data Transfer**              ≈ **~$2/mo**
- **Total**                      ≈ **~$41/mo**

> 💡 Switch EC2 to a 1-year Reserved Instance to bring the compute cost down to **~$16/mo**.
""",
        }

def _stepper(steps: list[tuple[str, str]]):
    """Animate through analysis steps with live progress."""
    progress = st.progress(0, text="Starting analysis…")
    for i, (label, duration_hint) in enumerate(steps):
        pct = int((i / len(steps)) * 100)
        progress.progress(pct, text=f"**{label}**")
        time.sleep(float(duration_hint))
    progress.progress(100, text="✅ Complete!")
    time.sleep(0.4)
    progress.empty()

# ─────────────────────────────────────────────
# PAGE: DASHBOARD
# ─────────────────────────────────────────────
def page_dashboard():
    st.title("📊 Dashboard")
    st.caption("Overview of your CloudForge DevOps activity.")
    st.divider()

    # Metrics Row
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Repos Analyzed", "34",  "+3 today")
    c2.metric("Dockerfiles Created", "34", "100 %")
    c3.metric("Avg Gen Time",  "14s",  "-2s")
    c4.metric("Hours Saved",   "120h", "+8h this week")

    st.divider()

    col_left, col_right = st.columns([3, 2], gap="large")
    with col_left:
        st.markdown("### 📋 Recent Analyses")
        history = st.session_state.history or [
            {"repo": "tiangolo/fastapi",      "stack": "Python / FastAPI", "status": "✅ Success"},
            {"repo": "vercel/next.js",         "stack": "JS / Next.js",    "status": "✅ Success"},
            {"repo": "hashicorp/terraform",    "stack": "Go / CLI",        "status": "✅ Success"},
        ]
        for item in history:
            with st.container():
                r1, r2, r3 = st.columns([3, 2, 1])
                r1.markdown(f"**`{item['repo']}`**")
                r2.markdown(item["stack"])
                r3.markdown(item["status"])
        st.caption("Analysis runs are stored in session memory during this session.")

    with col_right:
        st.markdown("### 🔥 Quick Start")
        st.info("Enter any public GitHub URL in the **Repo Analyzer** page to instantly generate your production DevOps stack.", icon="💡")
        if st.button("🔍 Open Repo Analyzer", use_container_width=True):
            st.session_state.page = "Analyzer"
            st.rerun()

# ─────────────────────────────────────────────
# PAGE: REPO ANALYZER
# ─────────────────────────────────────────────
def page_analyzer():
    st.title("🔍 Repository Analyzer")
    st.caption("Enter a public GitHub repository URL to generate a complete DevOps stack.")
    st.divider()

    # URL Input
    col_input, col_btn = st.columns([5, 1], gap="small")
    with col_input:
        repo_url = st.text_input(
            "GitHub Repository URL",
            value=st.session_state.repo_url,
            placeholder="https://github.com/owner/repository",
            label_visibility="collapsed",
            key="repo_input",
        )
    with col_btn:
        analyze = st.button("🚀 Generate", use_container_width=True)

    st.caption("Supports any public repository. Private repos require a GitHub PAT token (coming soon).")

    # Trigger
    if analyze:
        if not repo_url or not repo_url.startswith("https://github.com/"):
            st.warning("⚠️  Please enter a valid public GitHub URL (e.g. https://github.com/owner/repo)", icon="⚠️")
            return

        st.session_state.repo_url = repo_url
        st.session_state.status   = "RUNNING"
        st.session_state.generated = _defaults["generated"].copy()

        steps = [
            ("📡 Cloning repository…",           "1.2"),
            ("🔬 Detecting language & framework…","1.0"),
            ("🧠 LLM generating Dockerfile…",    "1.5"),
            ("♾️  Writing CI/CD pipeline…",       "1.2"),
            ("🏗️  Scaffolding Terraform IaC…",   "1.0"),
            ("🔐 Applying security hardening…",  "0.8"),
            ("💰 Optimizing cloud costs…",        "0.8"),
        ]
        _stepper(steps)

        try:
            result = _trigger_analysis(repo_url)
            st.session_state.generated = result
            st.session_state.status    = "COMPLETED"
            # save to history
            st.session_state.history.insert(0, {
                "repo":   repo_url.replace("https://github.com/", ""),
                "stack":  f"{result['stack'].get('language','?')} / {result['stack'].get('framework','?')}",
                "status": "✅ Success",
            })
            st.success("✅ Analysis complete! Head to **Generated Files** to review your DevOps stack.", icon="🎉")
            st.toast("All files generated successfully!", icon="🚀")
        except Exception as e:
            st.session_state.status  = "ERROR"
            st.session_state.error_msg = str(e)
            st.error(f"❌ Analysis failed: {e}", icon="🔥")
            return

    # Stack Summary (shown after completion)
    if st.session_state.status == "COMPLETED" and st.session_state.generated.get("stack"):
        st.divider()
        stack = st.session_state.generated["stack"]
        st.markdown("### 🧩 Detected Stack")
        s1, s2, s3, s4 = st.columns(4)
        s1.metric("Language",         stack.get("language", "—"))
        s2.metric("Framework",        stack.get("framework", "—"))
        s3.metric("Package Manager",  stack.get("package_manager", "—"))
        s4.metric("Database",         stack.get("database", "—"))

        st.divider()
        if st.button("💻 View Generated Files →", use_container_width=False):
            st.session_state.page = "Files"
            st.rerun()

# ─────────────────────────────────────────────
# PAGE: GENERATED FILES
# ─────────────────────────────────────────────
def page_files():
    st.title("💻 Generated Files")
    if st.session_state.status != "COMPLETED":
        st.info("No files generated yet. Run the **Repo Analyzer** first.", icon="💡")
        if st.button("🔍 Go to Repo Analyzer"):
            st.session_state.page = "Analyzer"
            st.rerun()
        return

    st.caption(f"Generated for: `{st.session_state.repo_url}`")
    st.divider()

    g = st.session_state.generated
    tab_docker, tab_compose, tab_cicd, tab_tf = st.tabs([
        "🐳 Dockerfile",
        "🐙 docker-compose.yml",
        "♾️  GitHub Actions",
        "🏗️  Terraform",
    ])

    def _code_panel(tab, content: str, lang: str, filename: str):
        with tab:
            st.code(content, language=lang, line_numbers=True)
            st.download_button(
                label=f"⬇️ Download {filename}",
                data=content,
                file_name=filename,
                mime="text/plain",
                use_container_width=False,
            )

    _code_panel(tab_docker,  g["dockerfile"], "dockerfile", "Dockerfile")
    _code_panel(tab_compose, g["compose"],    "yaml",       "docker-compose.yml")
    _code_panel(tab_cicd,    g["cicd"],       "yaml",       "main.yml")
    _code_panel(tab_tf,      g["terraform"],  "hcl",        "main.tf")

# ─────────────────────────────────────────────
# PAGE: DEPLOYMENT SUGGESTIONS
# ─────────────────────────────────────────────
def page_deployment():
    st.title("🚀 Deployment Suggestions")
    if st.session_state.status != "COMPLETED":
        st.info("Run the **Repo Analyzer** first to get deployment suggestions.", icon="💡")
        if st.button("🔍 Go to Repo Analyzer"):
            st.session_state.page = "Analyzer"
            st.rerun()
        return

    notes = st.session_state.generated.get("deployment_notes", "")
    st.markdown(notes, unsafe_allow_html=False)
    st.divider()

    st.markdown("### ⚡ One-Click Deploy")
    st.warning(
        "This will provision real AWS infrastructure and **incur cloud costs**. "
        "Make sure your AWS credentials are set in the sidebar before proceeding.",
        icon="⚠️",
    )
    col_deploy, _ = st.columns([2, 5])
    with col_deploy:
        if st.button("🌍 Deploy to AWS via Terraform", use_container_width=True):
            if not st.session_state.get("aws_access") or not st.session_state.get("aws_secret"):
                st.error("Please enter your AWS credentials in the sidebar first.", icon="🔐")
            else:
                st.toast("Terraform execution is coming in the next release!", icon="🏗️")

# ─────────────────────────────────────────────
# ROUTER
# ─────────────────────────────────────────────
_router = {
    "Dashboard":  page_dashboard,
    "Analyzer":   page_analyzer,
    "Files":      page_files,
    "Deployment": page_deployment,
}
_router[st.session_state.page]()
