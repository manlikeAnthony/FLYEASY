# FLYEASY Infrastructure — Terraform

## Project Overview

FLYEASY is a cloud-based application infrastructure deployed on **Amazon Web Services (AWS)** and provisioned using **Terraform**.

This Terraform project provides a reusable and modular infrastructure setup for the FLYEASY application, including networking, security, IAM, EKS, ECR, a bastion host, and remote Terraform state management.

The infrastructure is deployed in the **US East (N. Virginia) — `us-east-1`** AWS region.

---

## Infrastructure Components

The Terraform configuration provisions the following AWS infrastructure:

* **VPC** with CIDR `10.0.0.0/16`
* **2 Availability Zones**
* **2 Public Subnets**
* **2 Private Subnets**
* **Internet Gateway**
* **NAT Gateway**
* **Public and Private Route Tables**
* **Security Groups**
* **IAM Roles**
* **EC2 Bastion Host**
* **Amazon EKS Cluster**
* **EKS Worker Nodes**
* **Amazon ECR Repository**
* **Amazon S3 Remote Terraform State**
* **EC2 Key Pair**

---

## Architecture

The infrastructure follows a secure AWS network architecture where public and private resources are separated.

### Network

```text
                         Internet
                            │
                            ▼
                    ┌───────────────┐
                    │ Internet      │
                    │ Gateway       │
                    └───────┬───────┘
                            │
                     ┌──────▼──────┐
                     │     VPC     │
                     │ 10.0.0.0/16 │
                     └──────┬──────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
       ┌──────▼──────┐             ┌──────▼──────┐
       │ Public      │             │ Private     │
       │ Subnets     │             │ Subnets     │
       └──────┬──────┘             └──────┬──────┘
              │                           │
       ┌──────▼──────┐              ┌─────▼──────┐
       │ Bastion EC2 │              │    EKS     │
       │  t3.micro   │              │   Cluster  │
       └─────────────┘              └─────┬──────┘
                                         │
                                  ┌──────▼──────┐
                                  │ EKS Worker  │
                                  │    Nodes    │
                                  └─────────────┘
```

Private subnet resources access the internet through the **NAT Gateway**, while the Bastion Host is deployed in a public subnet for controlled administrative access.

---

## Network Configuration

| Resource           | Configuration              |
| ------------------ | -------------------------- |
| VPC CIDR           | `10.0.0.0/16`              |
| Region             | `us-east-1`                |
| Availability Zones | `us-east-1a`, `us-east-1b` |
| Public Subnet 1    | `10.0.1.0/24`              |
| Public Subnet 2    | `10.0.2.0/24`              |
| Private Subnet 1   | `10.0.11.0/24`             |
| Private Subnet 2   | `10.0.12.0/24`             |

---

## Amazon EKS

The project provisions an Amazon EKS cluster with the following configuration:

* **Cluster Name:** `flyeasy-eks`
* **Kubernetes Version:** `1.33`
* **Node Instance Type:** `t3.medium`
* **Desired Nodes:** `2`
* **Minimum Nodes:** `1`
* **Maximum Nodes:** `3`
* **Subnet Placement:** Private subnets

The EKS cluster uses IAM roles created by the Terraform IAM module.

---

## Amazon ECR

An Amazon Elastic Container Registry repository is created for the FLYEASY application.

```text
Repository Name: flyeasy
```

The repository provides a location for storing and managing container images that can be used by the application deployment.

---

## Bastion Host

A Bastion EC2 instance is provisioned in the public subnet.

Configuration:

```text
Instance Type: t3.micro
Key Pair: flyeasy-key
Subnet: Public Subnet
```

The Bastion Host provides an administrative access point to resources within the private network.

---

## IAM

The IAM module creates the required IAM roles used by the infrastructure, including:

* EKS Cluster IAM Role
* EKS Node IAM Role

These roles are passed to the EKS module and allow the Kubernetes cluster and worker nodes to interact with required AWS services securely.

---

## Terraform Modules

The infrastructure is organized into reusable Terraform modules.

```text
modules/
├── backend/
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
│
├── bastion/
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
│
├── ecr/
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
│
├── eks/
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
│
├── iam/
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
│
├── security/
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
│
└── vpc/
    ├── main.tf
    ├── variables.tf
    └── outputs.tf
```

### Module Responsibilities

| Module     | Responsibility                                          |
| ---------- | ------------------------------------------------------- |
| `vpc`      | VPC, subnets, Internet Gateway, NAT Gateway and routing |
| `security` | Security groups                                         |
| `iam`      | IAM roles and permissions                               |
| `bastion`  | EC2 Bastion Host                                        |
| `eks`      | EKS cluster and worker nodes                            |
| `ecr`      | ECR repository                                          |
| `backend`  | S3 Terraform state storage                              |

---

## Remote State

Terraform state is stored remotely using an Amazon S3 bucket.

```text
Bucket: flyeasy-terraform-state
```

Using remote state provides centralized state management and allows the infrastructure team to work with a shared Terraform state instead of relying on a local `terraform.tfstate` file.

---

## Terraform Provider

The project uses the official AWS Terraform provider.

```text
Provider: hashicorp/aws
Version: ~> 5.0
Region: us-east-1
```

---

## SSH Key

The Bastion Host uses the AWS key pair:

```text
flyeasy-key
```

The public key is loaded from the local SSH public key:

```text
~/.ssh/id_ed25519.pub
```

Private keys and credentials should **never be committed to the repository**.

---

## Prerequisites

Before running the Terraform configuration, ensure the following are installed:

* Terraform
* AWS CLI
* Git
* An AWS account with appropriate permissions

AWS credentials must be configured in the environment before Terraform can create or inspect AWS resources.

---

## Terraform Commands

Initialize Terraform:

```bash
terraform init
```

Format Terraform configuration:

```bash
terraform fmt -recursive
```

Validate the configuration:

```bash
terraform validate
```

Create an execution plan:

```bash
terraform plan
```

Apply the infrastructure:

```bash
terraform apply
```

Destroy the infrastructure when it is no longer required:

```bash
terraform destroy
```

> `terraform plan`, `terraform apply`, and `terraform destroy` require valid AWS credentials and appropriate AWS permissions.

---

## Validation

The Terraform configuration has been validated successfully using:

```bash
terraform validate
```

Result:

```text
Success! The configuration is valid.
```

---

## Project Structure

```text
terraform/
├── main.tf
├── provider.tf
├── key.tf
├── README.md
├── .terraform.lock.hcl
│
└── modules/
    ├── backend/
    ├── bastion/
    ├── ecr/
    ├── eks/
    ├── iam/
    ├── security/
    └── vpc/
```

---

## Infrastructure Engineer Responsibilities

The Terraform infrastructure implementation covers:

* VPC and networking
* Public and private subnets
* Internet Gateway
* NAT Gateway
* Route tables
* Security groups
* IAM roles
* EC2 Bastion Host
* EKS cluster
* ECR repository
* S3 remote Terraform state
* Reusable Terraform modules
* Infrastructure documentation
* Architecture diagram

---

## Security Considerations

The infrastructure separates public and private resources to reduce unnecessary exposure.

* Bastion Host is placed in a public subnet.
* EKS resources are deployed using private subnets.
* IAM roles are used for AWS service access.
* Sensitive credentials are not stored in Terraform source files.
* Terraform state is stored remotely in Amazon S3.
* SSH private keys must never be committed to Git.

---

## Conclusion

The FLYEASY Terraform infrastructure provides a modular and reusable foundation for deploying the application's AWS environment.

The configuration uses Terraform modules to separate infrastructure responsibilities, while AWS networking, IAM, EKS, ECR, EC2, and S3 provide the underlying cloud infrastructure.

This approach makes the infrastructure easier to maintain, review, scale, and reuse across environments.
