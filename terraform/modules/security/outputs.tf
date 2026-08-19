output "bastion_security_group_id" {
  description = "ID of the Bastion Host security group"
  value       = aws_security_group.bastion.id
}