import streamlit as st
import time

st.set_page_config(
    page_title="CloudForge DevOps",
    page_icon="☁️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- CSS Styling for Modern SaaS Aesthetic ---
st.markdown("""
<style>
    /* Global Background and Typography */
    .stApp {
        background-color: #0e1117;
        color: #e2e8f0;
    }
    
    /* Gradient Text for Main Header */
    .gradient-text {
        background: -webkit-linear-gradient(45deg, #4a90e2, #50e3c2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 800;
        font-size: 3.5rem;
        margin-bottom: 0px;
        padding-bottom: 0px;
    }
    
    /* Section Headers */
    .section-header {
        font-size: 1.5rem;
        font-weight: 600;
        margin-top: 2rem;
        margin-bottom: 1rem;
        color: #f8fafc;
        border-bottom: 1px solid #334155;
        padding-bottom: 0.5rem;
    }
    
    /* Metric Cards Styling */
    .metric-card {
        background-color: #1e293b;
        padding: 20px;
        border-radius: 12px;
        border: 1px solid #334155;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        text-align: center;
        transition: transform 0.2s;
    }
    .metric-card:hover {
        transform: translateY(-5px);
        border-color: #4a90e2;
    }
    .metric-card h4 {
        color: #94a3b8;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 8px;
    }
    .metric-card h2 {
        color: #f8fafc;
        font-size: 1.8rem;
        margin: 0;
    }
    
    /* Button Styling tweaks */
    div.stButton > button {
        border-radius: 8px;
        font-weight: 600;
    }
</style>
""", unsafe_allow_html=True)

# --- Header ---
st.markdown('<h1 class="gradient-text">CloudForge</h1>', unsafe_allow_html=True)
st.markdown("### AI-Powered DevOps Infrastructure Generator")

# --- Session State Initialization ---
if 'analysis_complete' not in st.session_state:
    st.session_state.analysis_complete = False
if 'generated_data' not in st.session_state:
    st.session_state.generated_data = None

# --- Mock Backend API Call ---
def mock_analyze_repo(url: str):
    """Simulates a call to a FastAPI backend."""
    time.sleep(1.5) # Simulate network latency
    if "error" in url.lower():
        raise Exception("Failed to clone repository. Make sure the URL is public and correct.")
    
    # Mocked AI Response
    return {
        "repo_name": url.split("/")[-1] if "/" in url else "unknown-repo",
        "language": "Python / FastAPI",
        "architecture": "Microservice",
        "complexity": "Medium",
        "dockerfile": "FROM python:3.9-slim\n\nWORKDIR /app\n\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\n\nCOPY . .\n\nEXPOSE 8000\nCMD [\"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]",
        "github_actions": "name: CI/CD Pipeline\n\non:\n  push:\n    branches: [ main ]\n\njobs:\n  test-and-build:\n    runs-on: ubuntu-latest\n    steps:\n    - uses: actions/checkout@v3\n    - name: Set up Python\n      uses: actions/setup-python@v4\n      with:\n        python-version: '3.9'\n    - name: Install dependencies\n      run: |\n        pip install -r requirements.txt\n    - name: Run Tests\n      run: |\n        pytest",
        "terraform": "terraform {\n  required_providers {\n    aws = {\n      source  = \"hashicorp/aws\"\n      version = \"~> 4.16\"\n    }\n  }\n}\n\nprovider \"aws\" {\n  region = \"us-west-2\"\n}\n\nresource \"aws_ecs_cluster\" \"app_cluster\" {\n  name = \"cloudforge-cluster\"\n}",
        "recommendations": [
            "Your app is stateless, making it a perfect fit for AWS ECS or Google Cloud Run.",
            "Consider implementing a multi-stage Docker build to reduce the final image size by ~40%.",
            "Add a Redis caching layer to optimize the latency of your FastAPI endpoints."
        ]
    }

# --- 1. Input Section ---
st.markdown('<div class="section-header">1. Connect Repository</div>', unsafe_allow_html=True)

with st.container():
    col1, col2 = st.columns([3, 1])
    with col1:
        repo_url = st.text_input(
            "GitHub Repository URL", 
            placeholder="https://github.com/username/project",
            label_visibility="collapsed"
        )
    with col2:
        analyze_btn = st.button("🚀 Analyze & Generate", use_container_width=True, type="primary")

# --- Analysis Logic ---
if analyze_btn:
    if not repo_url:
        st.error("⚠️ Please enter a valid GitHub repository URL.")
    else:
        try:
            # Modern loading animation using st.status
            with st.status("Analyzing Repository Context...", expanded=True) as status:
                st.write("📥 Cloning repository metadata...")
                time.sleep(1)
                st.write("🧠 AI analyzing code structure, dependencies, and architecture...")
                
                # Execute mock API call
                result = mock_analyze_repo(repo_url)
                
                # Save to state
                st.session_state.generated_data = result
                st.session_state.analysis_complete = True
                
                status.update(label="Analysis Complete!", state="complete", expanded=False)
        except Exception as e:
            st.error(f"❌ Analysis failed: {str(e)}")
            st.session_state.analysis_complete = False

# --- Results Sections (Only show if analysis is complete) ---
if st.session_state.analysis_complete and st.session_state.generated_data:
    data = st.session_state.generated_data
    
    # --- 2. AI Analysis Dashboard ---
    st.markdown('<div class="section-header">2. AI Analysis Dashboard</div>', unsafe_allow_html=True)
    m1, m2, m3 = st.columns(3)
    with m1:
        st.markdown(f'<div class="metric-card"><h4>Primary Stack</h4><h2>{data["language"]}</h2></div>', unsafe_allow_html=True)
    with m2:
        st.markdown(f'<div class="metric-card"><h4>Detected Architecture</h4><h2>{data["architecture"]}</h2></div>', unsafe_allow_html=True)
    with m3:
        st.markdown(f'<div class="metric-card"><h4>Complexity Score</h4><h2>{data["complexity"]}</h2></div>', unsafe_allow_html=True)

    # --- 3. Generated Files Viewer ---
    st.markdown('<div class="section-header">3. Generated DevOps Files</div>', unsafe_allow_html=True)
    
    tab_docker, tab_actions, tab_tf = st.tabs(["🐳 Dockerfile", "🐙 GitHub Actions", "🏗️ Terraform"])
    
    with tab_docker:
        col_dl, col_blank = st.columns([2, 8])
        with col_dl:
            st.download_button("⬇️ Download Dockerfile", data=data['dockerfile'], file_name="Dockerfile", mime="text/plain", use_container_width=True)
        st.code(data['dockerfile'], language="dockerfile", line_numbers=True)
        
    with tab_actions:
        col_dl, col_blank = st.columns([2, 8])
        with col_dl:
            st.download_button("⬇️ Download workflow.yml", data=data['github_actions'], file_name="deploy.yml", mime="text/yaml", use_container_width=True)
        st.code(data['github_actions'], language="yaml", line_numbers=True)
        
    with tab_tf:
        col_dl, col_blank = st.columns([2, 8])
        with col_dl:
            st.download_button("⬇️ Download main.tf", data=data['terraform'], file_name="main.tf", mime="text/plain", use_container_width=True)
        st.code(data['terraform'], language="hcl", line_numbers=True)
        
    # --- 4. Deployment Recommendations ---
    st.markdown('<div class="section-header">4. Deployment Recommendations</div>', unsafe_allow_html=True)
    with st.expander("💡 View AI Architecture Insights", expanded=True):
        st.write("Based on the repository analysis, our AI suggests the following strategies:")
        for rec in data['recommendations']:
            st.info(rec)
