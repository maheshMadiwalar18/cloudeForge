# -----------------------------------------------------------
# S3 Bucket for Application Assets / Logs
# -----------------------------------------------------------
resource "aws_s3_bucket" "app_bucket" {
  bucket        = "${var.project_name}-${var.environment}-assets-${random_id.bucket_suffix.hex}"
  force_destroy = true

  tags = {
    Name        = "${var.project_name}-bucket"
    Environment = var.environment
  }
}

# Append random ID to ensure global uniqueness of the S3 bucket name
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# Block all public access for security best practices
resource "aws_s3_bucket_public_access_block" "app_bucket_access" {
  bucket = aws_s3_bucket.app_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# -----------------------------------------------------------
# IAM Role and Instance Profile for EC2
# -----------------------------------------------------------
resource "aws_iam_role" "ec2_role" {
  name = "${var.project_name}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# Attach AWS managed policy for Systems Manager (SSM) to allow secure shell-less access
resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Least-privilege: EC2 can only write to the specific application S3 bucket
resource "aws_iam_role_policy" "s3_write" {
  name = "${var.project_name}-s3-write"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.app_bucket.arn,
          "${aws_s3_bucket.app_bucket.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.project_name}-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

# -----------------------------------------------------------
# Security Group
# -----------------------------------------------------------
resource "aws_security_group" "app_sg" {
  name        = "${var.project_name}-sg"
  description = "Allow inbound traffic for application"

  # NOTE: Port 22 (SSH) has been intentionally removed.
  # Use AWS Systems Manager (SSM) Session Manager for secure shell access instead.
  # This eliminates the attack surface of an open SSH port entirely.

  # Allow HTTP (Port 80)
  ingress {
    description = "HTTP Proxy Access"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow direct API Access (Port 8000)
  ingress {
    description = "FastAPI Backend Port"
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-sg"
    Environment = var.environment
  }
}

# -----------------------------------------------------------
# S3 Lifecycle Rule: Move old objects to Glacier to save costs
# -----------------------------------------------------------
resource "aws_s3_bucket_lifecycle_configuration" "app_bucket_lifecycle" {
  bucket = aws_s3_bucket.app_bucket.id

  rule {
    id     = "archive-old-assets"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "GLACIER"
    }

    expiration {
      days = 365
    }
  }
}

# -----------------------------------------------------------
# Fetch Latest Amazon Linux 2023 AMI
# -----------------------------------------------------------
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    # Updated to arm64 to match the t4g.medium (Graviton) instance type
    values = ["al2023-ami-2023.*-arm64"]
  }
}

# -----------------------------------------------------------
# EC2 Instance Launch Configuration
# -----------------------------------------------------------
resource "aws_instance" "app_server" {
  ami                  = data.aws_ami.amazon_linux_2023.id
  instance_type        = var.instance_type
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name
  
  # Using vpc_security_group_ids is best practice over security_groups
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  # Cloud-Init script to auto-install dependencies upon boot
  user_data = <<-EOF
              #!/bin/bash
              # Update OS and install Docker and Git
              dnf update -y
              dnf install -y docker git
              systemctl enable docker
              systemctl start docker
              
              # Install Docker Compose
              curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
              chmod +x /usr/local/bin/docker-compose
              
              # Pull the project and start containers (Placeholder instructions)
              # git clone https://github.com/your-username/cloudforge-devops.git /opt/app
              # cd /opt/app
              # docker-compose up -d
              EOF

  tags = {
    Name        = "${var.project_name}-server"
    Environment = var.environment
  }
}
