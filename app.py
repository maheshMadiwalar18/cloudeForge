import streamlit as st

# Set page config
st.set_page_config(
    page_title="CloudForge DevOps Code Viewer",
    page_icon="☁️",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Custom CSS for UI improvements (smooth scrolling, styling tweaks)
st.markdown("""
    <style>
    /* Smooth scrolling */
    html {
        scroll-behavior: smooth;
    }
    
    /* Code block container styling for a premium feel */
    [data-testid="stCodeBlock"] {
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border: 1px solid #333;
    }
    
    /* Button styling improvements */
    [data-testid="stDownloadButton"] button {
        border-radius: 6px;
        transition: all 0.2s ease-in-out;
    }
    
    [data-testid="stDownloadButton"] button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    
    /* Header styling */
    .main-header {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        background: -webkit-linear-gradient(45deg, #4a90e2, #50e3c2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    </style>
""", unsafe_allow_html=True)

st.markdown('<div class="main-header">☁️ CloudForge DevOps</div>', unsafe_allow_html=True)
st.markdown("Professional code viewer for infrastructure and deployment configurations.")
st.divider()

# Sample configuration codes
dockerfile_code = """# Dockerfile
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port and run application
EXPOSE 8501
CMD ["streamlit", "run", "app.py", "--server.address=0.0.0.0"]
"""

github_actions_code = """# .github/workflows/deploy.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
        cache: 'pip'
        
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        
    - name: Run tests
      run: |
        pytest tests/
"""

terraform_code = """# main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }
  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "us-west-2"
}

resource "aws_instance" "app_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  tags = {
    Name        = "CloudForge-WebApp"
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}
"""

# Implement Tabs
tab_docker, tab_actions, tab_tf = st.tabs(["🐳 Dockerfile", "🐙 GitHub Actions", "🏗️ Terraform"])

with tab_docker:
    col1, col2 = st.columns([0.8, 0.2])
    with col1:
        st.subheader("Dockerfile")
        st.caption("Defines the container environment for the Streamlit application.")
    with col2:
        st.download_button(
            label="⬇️ Download",
            data=dockerfile_code,
            file_name="Dockerfile",
            mime="text/plain",
            use_container_width=True
        )
    # st.code automatically handles syntax highlighting and includes a copy button
    st.code(dockerfile_code, language="dockerfile", line_numbers=True)

with tab_actions:
    col1, col2 = st.columns([0.8, 0.2])
    with col1:
        st.subheader("CI/CD Workflow")
        st.caption("GitHub Actions pipeline for automated testing and deployment.")
    with col2:
        st.download_button(
            label="⬇️ Download",
            data=github_actions_code,
            file_name="deploy.yml",
            mime="text/yaml",
            use_container_width=True
        )
    st.code(github_actions_code, language="yaml", line_numbers=True)

with tab_tf:
    col1, col2 = st.columns([0.8, 0.2])
    with col1:
        st.subheader("Infrastructure as Code")
        st.caption("Terraform configuration for provisioning AWS EC2 instances.")
    with col2:
        st.download_button(
            label="⬇️ Download",
            data=terraform_code,
            file_name="main.tf",
            mime="text/plain",
            use_container_width=True
        )
    st.code(terraform_code, language="hcl", line_numbers=True)
