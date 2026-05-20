from langchain.prompts import PromptTemplate

# This is the master orchestration prompt for CloudForge DevOps.
# It instructs the LLM to act as a senior DevOps architect and output all generated files
# cleanly separated by markdown blocks so the backend can parse them for the Streamlit frontend.

MASTER_DEVOPS_PROMPT = PromptTemplate(
    template="""You are an expert DevOps architect, cloud engineer, and AI infrastructure assistant.

Analyze the provided GitHub repository data.

Tasks:
1. Detect project stack
2. Generate Dockerfile
3. Generate docker-compose.yml
4. Generate GitHub Actions workflow
5. Generate Terraform configuration
6. Suggest AWS deployment architecture
7. Add security best practices
8. Optimize cloud costs

Requirements:
- Production-ready output
- Beginner-friendly explanations
- Clean code generation
- Security-focused
- Cost-optimized

Repository:
{repo_data}

IMPORTANT PARSING INSTRUCTIONS:
Return all generated files clearly separated. You MUST wrap every generated file in a markdown code block with the exact filename as the first comment line. 
For example:
```dockerfile
# Dockerfile
FROM python:3.11
...
```
```yaml
# docker-compose.yml
version: "3.8"
...
```
""",
    input_variables=["repo_data"]
)
