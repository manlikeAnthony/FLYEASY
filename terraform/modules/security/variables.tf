variable "vpc_id" {
  description = "ID of the VPC where security groups will be created"
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "CIDR block allowed to access SSH"
  type        = string
  default     = "0.0.0.0/0"
}