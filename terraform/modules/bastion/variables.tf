variable "ami_id" {
  description = "AMI ID for the Bastion Host"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type for the Bastion Host"
  type        = string
  default     = "t3.micro"
}

variable "subnet_id" {
  description = "Public subnet ID for the Bastion Host"
  type        = string
}

variable "security_group_id" {
  description = "Security group ID for the Bastion Host"
  type        = string
}

variable "key_name" {
  description = "EC2 key pair name for SSH access"
  type        = string
}