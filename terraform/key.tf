resource "aws_key_pair" "flyeasy" {
  key_name   = "flyeasy-key"
  public_key = file("~/.ssh/flyeasy-key.pub")
}