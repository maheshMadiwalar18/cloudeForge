# ==========================================
# Stage 1: Build Stage (Dependency Resolution)
# ==========================================
FROM python:3.11-slim@sha256:1a84fbe717ef74de30e065dc084f74d0e6f2bc8f3baaf83e7cfab3dc35f0ef74 AS builder

# Set the working directory
WORKDIR /build

# Install system build dependencies required for compiling Python packages (e.g. psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements to cache them in docker layer
COPY requirements.txt .

# Create and activate a virtual environment, then install Python dependencies
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ==========================================
# Stage 2: Production Stage (Lean Image)
# ==========================================
FROM python:3.11-slim@sha256:1a84fbe717ef74de30e065dc084f74d0e6f2bc8f3baaf83e7cfab3dc35f0ef74

# Security: Create a dedicated non-root user and group
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Set working directory
WORKDIR /app

# Copy only the compiled virtual environment from the builder stage
COPY --from=builder /opt/venv /opt/venv

# Ensure Python uses the virtual environment
ENV PATH="/opt/venv/bin:$PATH"

# Environment Variables Optimization
# PYTHONDONTWRITEBYTECODE: Prevents python from writing .pyc files to disk
# PYTHONUNBUFFERED: Prevents python from buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production

# Copy application source code
COPY ./app ./app

# Set permissions for the non-root user
RUN chown -R appuser:appgroup /app

# Switch to the non-root user
USER appuser

# Expose the standard FastAPI port
EXPOSE 8000

# Security/Reliability: Built-in health check using Python's native urllib (no curl required)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/v1/health/')" || exit 1

# Production run command using Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
