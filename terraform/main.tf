resource "aws_instance" "web" {

  count = 2

  ami = var.ami

instance_type = "t3.micro"

key_name = aws_key_pair.flyeasy.key_name

  tags = {
    Name = "flyeasy-web-${count.index + 1}"
  }


  vpc_security_group_ids = [
    aws_security_group.flyeasy.id
  ]

}


resource "aws_instance" "mongo" {
  ami = var.ami

    instance_type = "t3.micro"
    
    key_name = aws_key_pair.flyeasy.key_name

  tags = {
    Name = "flyeasy-mongo"
  }
  vpc_security_group_ids = [
    aws_security_group.flyeasy.id
  ]
}



resource "aws_security_group" "flyeasy" {
  name = "flyeasy-security"

  ingress {

    from_port = 22
    to_port = 22
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]

  }

  ingress {

    from_port = 3000
    to_port = 3000
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]

  }

  ingress {

    from_port = 5000
    to_port = 5000
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]

  }



  ingress {

    from_port = 27017
    to_port = 27017
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]

  }



  egress {

    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]

  }

}