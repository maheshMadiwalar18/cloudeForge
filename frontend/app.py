import streamlit as st
import time
from utils.api_client import trigger_analysis
from components.code_viewer import render_code_tabs

# ----------------------------------------------------
# 1. Page Configuration & State
# ----------------------------------------------------
st.set_page_config(
    page_title="CloudForge DevOps",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="expanded"
)

# State Management
if "task_status" not in st.session_state:
    st.session_state.task_status = "IDLE"
if "generated_data" not in st.session_state:
    st.session_state.generated_data = {}

# ----------------------------------------------------
# 2. Inject Custom CSS
# ----------------------------------------------------
def load_css():
    try:
        with open("assets/styles.css", "r") as f:
            st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)
    except FileNotFoundError:
        pass

load_css()

# ----------------------------------------------------
# 3. Sidebar UI
# ----------------------------------------------------
with st.sidebar:
    st.title("🚀 CloudForge")
    st.markdown("Your AI-Powered DevOps Architect")
    st.divider()
    
    st.markdown("### Deployment Credentials")
    aws_access = st.text_input("AWS Access Key (Optional)", type="password")
    aws_secret = st.text_input("AWS Secret Key (Optional)", type="password")
    st.info("💡 Keys are only required if you intend to execute the Terraform plan directly from this dashboard.")
    
    st.divider()
    st.markdown("Made with ❤️ by CloudForge")

# ----------------------------------------------------
# 4. Main Dashboard UI
# ----------------------------------------------------
st.title("Repository Analysis")
st.markdown("Enter a public GitHub repository URL to instantly generate production-ready Docker, CI/CD, and Terraform configurations.")

col1, col2 = st.columns([4, 1])
with col1:
    repo_url = st.text_input("GitHub Repository URL", placeholder="https://github.com/tiangolo/fastapi", label_visibility="collapsed")
with col2:
    analyze_btn = st.button("🚀 Generate Stack", use_container_width=True)

# ----------------------------------------------------
# 5. Application Logic
# ----------------------------------------------------
if analyze_btn:
    if not repo_url:
        st.warning("Please enter a valid GitHub URL.")
    else:
        st.session_state.task_status = "RUNNING"
        st.session_state.generated_data = {}
        
        try:
            # Step 1: Trigger API
            with st.spinner("📡 Cloning repository and extracting tech stack..."):
                response = trigger_analysis(repo_url)
                # Sleep added just for MVP UI demonstration feel
                time.sleep(1.5)
            
            # Step 2: AI Generation
            with st.spinner("🧠 LLM Engine is writing Dockerfile and CI/CD pipelines..."):
                time.sleep(2)
                
            # Step 3: Finalizing
            with st.spinner("🏗️ Scaffolding AWS Terraform Infrastructure..."):
                time.sleep(1.5)
                
            st.session_state.task_status = "COMPLETED"
            st.success("Analysis Complete! The AI has scaffolded your DevOps environment.")
            
            # MOCK DATA: In a real flow, we poll `get_task_status(task_id)` until it returns this payload.
            st.session_state.generated_data = {
                "dockerfile": "# Optimized Production Dockerfile\nFROM python:3.11-slim\n\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\n\nCOPY . .\nUSER nobody\nEXPOSE 8000\nCMD [\"uvicorn\", \"app.main:app\", \"--host\", \"0.0.0.0\"]",
                "compose": "version: '3.8'\nservices:\n  api:\n    build: .\n    ports:\n      - '8000:8000'\n    environment:\n      - ENV=production",
                "cicd": "name: CI/CD Pipeline\non: [push]\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Run Tests\n        run: pytest",
                "terraform": 'provider "aws" {\n  region = "us-east-1"\n}\n\nresource "aws_instance" "app" {\n  ami           = "ami-0c55b159cbfafe1f0"\n  instance_type = "t3.medium"\n}'
            }
            
        except Exception as e:
            st.session_state.task_status = "ERROR"
            st.error(f"Failed to analyze repository: {str(e)}")

# ----------------------------------------------------
# 6. Results Rendering
# ----------------------------------------------------
if st.session_state.task_status == "COMPLETED" and st.session_state.generated_data:
    st.divider()
    render_code_tabs(st.session_state.generated_data)
