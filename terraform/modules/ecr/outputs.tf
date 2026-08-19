output "repository_url" {
  description = "URL of the FlyEasy ECR repository"
  value       = aws_ecr_repository.this.repository_url
}

output "repository_arn" {
  description = "ARN of the FlyEasy ECR repository"
  value       = aws_ecr_repository.this.arn
}