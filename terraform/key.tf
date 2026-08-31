resource "aws_key_pair" "flyeasy" {
  key_name   = "flyeasy-key"
  public_key = file(pathexpand("~/.ssh/flyeasy-key.pub"))
}
