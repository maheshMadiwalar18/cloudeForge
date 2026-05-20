output "instance_public_ip" {
  description = "The public IP address of the deployed EC2 instance"
  value       = aws_instance.app_server.public_ip
}

output "instance_public_dns" {
  description = "The public DNS name of the deployed EC2 instance"
  value       = aws_instance.app_server.public_dns
}

output "s3_bucket_name" {
  description = "The name of the globally unique S3 bucket"
  value       = aws_s3_bucket.app_bucket.id
}

output "ssh_connection_string" {
  description = "Command to SSH into the instance using Systems Manager (SSM) or standard SSH"
  value       = "ssh ec2-user@${aws_instance.app_server.public_ip}"
}
