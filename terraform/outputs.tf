output "web_public_ips" {

  value = aws_instance.web[*].public_ip

}


output "web_private_ips" {

  value = aws_instance.web[*].private_ip

}



output "mongo_public_ip" {

  value = aws_instance.mongo.public_ip

}



output "mongo_private_ip" {

  value = aws_instance.mongo.private_ip

}