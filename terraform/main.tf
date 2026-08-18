module "vpc" {
  source = "./modules/vpc"

  vpc_cidr             = "10.0.0.0/16"
  availability_zones   = ["us-east-1a", "us-east-1b"]
  public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnet_cidrs = ["10.0.11.0/24", "10.0.12.0/24"]
}

module "security" {
  source = "./modules/security"

  vpc_id = module.vpc.vpc_id
}

module "iam" {
  source = "./modules/iam"
}

module "ecr" {
  source = "./modules/ecr"

  repository_name = "flyeasy"
}

module "bastion" {
  source = "./modules/bastion"

  ami_id            = "ami-0c7217cdde317cfec"
  instance_type     = "t3.micro"
  subnet_id         = module.vpc.public_subnet_ids[0]
  security_group_id = module.security.bastion_security_group_id
  key_name          = aws_key_pair.flyeasy.key_name
}

module "eks" {
  source = "./modules/eks"

  cluster_name    = "flyeasy-eks"
  cluster_version = "1.33"

  subnet_ids = module.vpc.private_subnet_ids

  cluster_role_arn = module.iam.eks_cluster_role_arn
  node_role_arn    = module.iam.eks_node_role_arn

  node_instance_type = "t3.medium"

  desired_nodes = 2
  min_nodes     = 1
  max_nodes     = 3
}

module "backend" {
  source = "./modules/backend"

  bucket_name = "flyeasy-terraform-state"
}