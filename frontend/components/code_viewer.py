import streamlit as st
from streamlit_ace import st_ace

def render_code_tabs(generated_data: dict):
    """
    Renders the generated code using Streamlit Tabs and the interactive Ace editor.
    """
    st.markdown("### 🛠️ Generated Configuration Files")
    st.info("Review and edit your configurations below before downloading. Changes made in the editor will be preserved in the download.")
    
    tab1, tab2, tab3, tab4 = st.tabs(["🐳 Dockerfile", "🐙 docker-compose.yml", "♾️ CI/CD Actions", "🏗️ Terraform"])
    
    with tab1:
        docker_code = st_ace(
            value=generated_data.get("dockerfile", "# Error loading Dockerfile"),
            language="dockerfile",
            theme="monokai",
            key="ace_docker",
            height=400
        )
        st.download_button("⬇️ Download Dockerfile", docker_code, file_name="Dockerfile")
        
    with tab2:
        compose_code = st_ace(
            value=generated_data.get("compose", "# Error loading compose file"),
            language="yaml",
            theme="monokai",
            key="ace_compose",
            height=400
        )
        st.download_button("⬇️ Download docker-compose.yml", compose_code, file_name="docker-compose.yml")
        
    with tab3:
        cicd_code = st_ace(
            value=generated_data.get("cicd", "# Error loading GitHub Actions"),
            language="yaml",
            theme="monokai",
            key="ace_cicd",
            height=400
        )
        st.download_button("⬇️ Download main.yml", cicd_code, file_name="main.yml")

    with tab4:
        tf_code = st_ace(
            value=generated_data.get("terraform", "# Error loading Terraform"),
            language="terraform",
            theme="monokai",
            key="ace_tf",
            height=400
        )
        st.download_button("⬇️ Download main.tf", tf_code, file_name="main.tf")
