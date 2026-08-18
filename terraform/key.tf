resource "aws_key_pair" "flyeasy" {
  key_name   = "flyeasy-key"
  public_key = file(pathexpand("~/.ssh/id_ed25519.pub"))
}
