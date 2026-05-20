# DevSecOps Risk Analysis & Remediation Report

This document outlines the security posture of the currently generated CloudForge DevOps infrastructure (Terraform), CI/CD pipelines (GitHub Actions), and Containerization (Docker).

---

## 1. Risk Analysis & Vulnerabilities

### Infrastructure (Terraform & AWS)
> [!WARNING]
> **Open SSH Port (Port 22)**
> The `aws_security_group` currently allows inbound traffic on port `22` from `0.0.0.0/0`. This exposes the instance to brute-force attacks and botnet scanners.

> [!CAUTION]
> **Missing Application Data Access (IAM)**
> The `aws_iam_role` is granted `AmazonSSMManagedInstanceCore` (good), but we provisioned an S3 bucket for assets that the EC2 instance cannot actually access. If the application attempts to upload files, it will result in an `AccessDenied` error.

### Secrets Management
> [!WARNING]
> **Hardcoded Fallback Credentials**
> The `docker-compose.yml` file uses bash parameter expansion defaults (e.g., `POSTGRES_PASSWORD:-cloudforge_password`). If the `.env` file fails to load in production, the database will silently spin up with a publicly known password.

### CI/CD Pipeline (GitHub Actions)
> [!IMPORTANT]
> **Mutable Action Tags (Supply Chain Risk)**
> The workflow uses mutable version tags (e.g., `actions/checkout@v4`). If the maintainer's account is compromised, the `v4` tag could be pointed to malicious code, stealing secrets during the build process.

---

## 2. Fix Recommendations

### Secret Management Improvements
1. **Eliminate Defaults**: Remove all fallback plaintext values from `docker-compose.yml`. Force the orchestrator to crash if a `.env` file is missing.
2. **Production Secrets**: In AWS, do not store `.env` files on the EC2 disk. Use **AWS Secrets Manager** or **Systems Manager (SSM) Parameter Store**. Modify the FastAPI app to fetch secrets natively via `boto3` on startup, or use an `entrypoint.sh` script to pull them into memory.

### Docker & Compose Security Improvements
1. **Pin by SHA256**: Instead of `FROM python:3.11-slim`, use the exact cryptographic hash (e.g., `FROM python:3.11-slim@sha256:d5b5a...`). This guarantees the base image cannot be tampered with upstream.
2. **Drop Linux Capabilities**: In `docker-compose.yml`, explicitly drop all root capabilities for the containers to prevent container breakout vulnerabilities:
   ```yaml
   cap_drop:
     - ALL
   ```
3. **Read-Only Filesystem**: Make the backend container's filesystem read-only to prevent malicious actors from dropping malware inside the container if they find an RCE.
   ```yaml
   read_only: true
   tmpfs:
     - /tmp
   ```

### CI/CD Security Best Practices
1. **Pin GitHub Actions to SHAs**:
   Change `uses: actions/checkout@v4` to `uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11`.
2. **OIDC Integration (No Stored Secrets)**: Instead of storing long-lived AWS Access Keys in GitHub Secrets to deploy, implement **OpenID Connect (OIDC)** between GitHub and AWS. GitHub Actions can assume a short-lived IAM role dynamically.

### IAM Least Privilege Improvements
1. **Remove Port 22**: Since the Terraform script provisions the `AmazonSSMManagedInstanceCore` policy, you can SSH into the instance securely from the AWS Console (Session Manager). Delete the Port 22 ingress rule entirely from `main.tf`.
2. **Strict S3 Binding**: Attach an inline policy to the EC2 IAM Role that grants `s3:PutObject`, `s3:GetObject`, and `s3:ListBucket` strictly targeting `${aws_s3_bucket.app_bucket.arn}/*`.

---

## 3. Actionable Security Checklist

- [ ] **Terraform**: Delete the SSH (Port 22) block from `aws_security_group.app_sg`.
- [ ] **Terraform**: Add an inline `aws_iam_role_policy` granting S3 access to the EC2 role.
- [ ] **Docker Compose**: Remove fallback default passwords (`:-cloudforge_password`).
- [ ] **Docker Compose**: Add `cap_drop: - ALL` to the `backend` and `db` services.
- [ ] **Dockerfile**: Update `FROM` statements to use `@sha256` digest hashes.
- [ ] **GitHub Actions**: Convert `@vX` tags to 40-character SHAs.
- [ ] **GitHub Actions**: Configure AWS OIDC federation for the deployment step.
- [ ] **Python App**: Add `--require-hashes` to the `pip install` command to ensure Python package integrity.
