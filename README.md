# FlyEasy ✈️

FlyEasy is a TypeScript full-stack travel request management platform. It consists of a React (Vite) frontend and a Node.js/Express backend, backed by MongoDB, and is designed to be containerized with Docker, orchestrated with Docker Compose locally, and deployed to Amazon EKS using Kubernetes manifests and Terraform-provisioned AWS infrastructure.

All backend API routes are mounted under the base path:

    /api/v1

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Backend Structure](#backend-structure)
- [Authentication Flow](#authentication-flow)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Docker](#docker)
- [Docker Compose](#docker-compose)
- [Kubernetes Deployment](#kubernetes-deployment)
- [AWS Infrastructure](#aws-infrastructure)
- [Terraform](#terraform)
- [End-to-End AWS Deployment Flow](#end-to-end-aws-deployment-flow)
- [Security Considerations](#security-considerations)
- [Production Considerations](#production-considerations)
- [Troubleshooting](#troubleshooting)
- [Author](#author)

---

## Overview

FlyEasy manages the lifecycle of travel requests: users register and authenticate, create travel requests, claim and track them, and administrators can review request/user metrics. The project is fully containerized and includes infrastructure-as-code for running on AWS via Amazon EKS.

---

## Features

**Authentication**
- User registration with email verification
- Login with HTTP-only access and refresh cookies
- Logout (clears cookies and deletes stored refresh tokens)
- Forgot-password / reset-password flow
- Resend verification email
- JWT-based authentication with role-based authorization

**Request Management**
- Create, update, delete, and retrieve travel requests
- Claim requests
- List/search requests
- Retrieve a request by tracking ID
- Retrieve the authenticated user's own requests
- Administrative request metrics and listing

**User Management**
- List users (admin)
- User metrics (admin)
- Get current authenticated user
- Get user by ID (admin)
- Delete users (admin)

**Infrastructure**
- Docker containerization for backend and frontend
- Docker Compose for local/multi-container orchestration
- Kubernetes manifests for deployment to Amazon EKS
- Terraform-managed AWS infrastructure: VPC, IAM, ECR, Bastion host, EKS, and remote state storage

---

## Architecture

At a high level:

    Client (Browser)
          |
          v
    Frontend (React/Vite, served by Nginx, container port 80)
          |
          v
    Backend (Node.js/Express API, /api/v1, container port 5000)
          |
          v
    MongoDB

In production on AWS, the frontend and backend run as separate Kubernetes Deployments behind an ALB Ingress on Amazon EKS, with worker nodes in private subnets and a bastion host in a public subnet for administrative access. Networking, IAM, and container registry infrastructure are provisioned with Terraform.

---

## Technology Stack

**Backend**
- Node.js
- Express
- TypeScript
- MongoDB with Mongoose

Notable backend libraries:
- `jsonwebtoken`
- `bcryptjs`
- `joi`
- `nodemailer`
- `winston`
- `express-async-errors`

**Frontend**
- React
- Vite
- Axios
- `react-router-dom`
- `@tanstack/react-query`

**Infrastructure**
- Docker / Docker Compose
- Nginx (frontend web server)
- Kubernetes
- Amazon EKS
- Amazon ECR
- Amazon EC2
- Amazon S3
- AWS VPC
- IAM
- Terraform

---

## Project Structure

Top-level repository layout:

    backend/          Backend application source, Dockerfile, environment configuration
    frontend/         Frontend application source, Dockerfile, Nginx configuration
    K8s/              Kubernetes manifests
    terraform/        AWS infrastructure definitions and Terraform modules
    docker-compose.yml

> Note: the Kubernetes manifests directory is named `K8s/` (capital K) in this repository, not `k8s/`.

---

## Backend Structure

    backend/src/
    ├── auth/
    │   ├── auth.controller.ts
    │   ├── auth.route.ts
    │   ├── auth.service.ts
    │   ├── token.model.ts
    │   └── user.model.ts
    ├── users/
    │   ├── user.controller.ts
    │   ├── user.route.ts
    │   └── user.service.ts
    ├── request/
    │   ├── request.controller.ts
    │   ├── request.route.ts
    │   ├── request.model.ts
    │   └── request.service.ts
    ├── config/
    │   ├── database.ts
    │   ├── jwt.ts
    │   └── nodemailer.ts
    ├── dto/
    ├── errors/
    ├── logger/
    ├── query/
    ├── response/
    ├── types/
    ├── middlewares/
    │   ├── authenticate.ts
    │   ├── error-handler.ts
    │   ├── not-found.ts
    │   ├── async-handler.ts
    │   └── validator.middleware.ts
    ├── utils/
    │   ├── jwt.ts
    │   ├── cookies.ts
    │   └── email/
    ├── validator/
    ├── app.ts
    └── server.ts

The frontend lives in `frontend/src` and is a standard Vite + React application.

---

## Authentication Flow

1. **Registration** — `POST /api/v1/auth/register`
   The registration service creates the user, hashes the password via Mongoose pre-save middleware, generates an email verification token, stores the hashed version of that token, and sends a verification email.

2. **Email verification** — `POST /api/v1/auth/verify-email`
   The supplied token is validated and the user's verified state is updated.

3. **Login** — `POST /api/v1/auth/login`
   Credentials and the `isVerified` flag are validated. Access and refresh tokens are generated, and the controller attaches them to the response as HTTP-only cookies.

4. **Protected routes**
   - `authenticateUser` reads the `accessToken` cookie and verifies the JWT.
   - `authorizeRoles` performs role-based authorization where required.

5. **Logout** — `DELETE /api/v1/auth/logout`
   Stored refresh tokens are deleted from the database and authentication cookies are cleared.

6. **Password recovery**
   - `POST /api/v1/auth/forgot-password`
   - `POST /api/v1/auth/reset-password`

   Password reset tokens are generated and validated before a new password is accepted.

**Important implementation notes:**
- Refresh tokens are persisted in the `Token` model.
- There is currently **no explicit refresh-token endpoint** implemented in `auth.route.ts`.

---

## API Reference

Base path: `/api/v1`

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Authenticate a user and set HTTP-only cookies |
| DELETE | `/api/v1/auth/logout` | Log out the authenticated user |
| POST | `/api/v1/auth/verify-email` | Verify an account using a verification token |
| POST | `/api/v1/auth/resend-verification-email` | Resend an email verification token |
| POST | `/api/v1/auth/forgot-password` | Request a password reset email |
| POST | `/api/v1/auth/reset-password` | Reset a password using a valid reset token |

### Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/users/` | ADMIN | List all users |
| GET | `/api/v1/users/metrics` | ADMIN | Retrieve user metrics |
| GET | `/api/v1/users/current-user` | Authenticated | Retrieve the currently authenticated user |
| GET | `/api/v1/users/:id` | ADMIN | Retrieve a user by ID |
| DELETE | `/api/v1/users/:id` | ADMIN | Delete a user |

### Requests

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/v1/requests/` | Authenticated | Create a new request |
| POST | `/api/v1/requests/claim/:id` | Authenticated | Claim a request |
| GET | `/api/v1/requests/metrics` | ADMIN | Retrieve request metrics |
| GET | `/api/v1/requests/` | ADMIN | List requests |
| GET | `/api/v1/requests/my` | Authenticated | Retrieve requests belonging to the authenticated user |
| GET | `/api/v1/requests/:id` | Authenticated | Retrieve a request by ID |
| GET | `/api/v1/requests/track/:trackingId` | Authenticated | Retrieve a request using its tracking ID |
| PUT | `/api/v1/requests/:id` | Authenticated | Update a request |
| DELETE | `/api/v1/requests/:id` | Authenticated | Delete a request |

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Backend server port. Defaults to `3000` in the application, although the production Docker/Kubernetes deployment uses port `5000`. |
| `MONGO_URL` | MongoDB connection string. |
| `JWT_SECRET` | JWT signing secret. |
| `EMAIL_USER` | SMTP account username. |
| `EMAIL_PASS` | SMTP account password. |
| `MAPQUEST_API_KEY` | Used by geocoding functionality where applicable. |
| `NODE_ENV` | Controls environment-specific behavior such as cookie `secure`/`sameSite` settings. |

**Important:** Never commit real secrets. Production secrets should be supplied through an appropriate secret-management mechanism rather than committed to Git.

---

## Local Development

Clone the repository:

    git clone <repo-url>
    cd flyeasy

Install backend dependencies:

    cd backend
    npm install

Install frontend dependencies:

    cd ../frontend
    npm install

Run the backend (in one terminal):

    cd backend
    npm run dev

Run the frontend (in another terminal):

    cd frontend
    npm run dev

The backend API will be available under:

    http://localhost:<PORT>/api/v1

---

## Docker

### Backend Dockerfile

The backend uses a multi-stage build:

- **Build stage:** `node:20-alpine` — installs dependencies, copies source, runs `npm run build`.
- **Production stage:** `node:20-alpine` — installs production-only dependencies, copies the compiled `dist` output, exposes port `5000`, and starts with `npm run start`.


### Frontend Dockerfile

The frontend uses a multi-stage build:

- **Build stage:** `node:20` — installs dependencies and builds the Vite application.
- **Production stage:** `nginx:alpine` — serves the generated static assets using `nginx.conf`, exposing port `80`.


---

## Docker Compose

The root `docker-compose.yml` defines a `flyeasy-backend` and `flyeasy-frontend` service on a shared bridge network (`flyeasy-network`):

- **Backend:** built from `./backend`, restart policy `unless-stopped`, host port `5000` mapped to container port `5000`, environment loaded from `./backend/.env.production`, with `NODE_ENV=production` and `PORT=5000`.
- **Frontend:** built from `./frontend`, restart policy `unless-stopped`, host port `3000` mapped to container port `80`, environment loaded from `./frontend/.env`, and depends on the backend service.


Start the stack locally with:

    docker compose up --build

---

## Kubernetes Deployment

FlyEasy can be deployed to Amazon EKS. The Kubernetes manifests are deliberately kept separate from the application source code.

### Kubernetes Structure

    K8s/
    ├── 00-namespace.yml
    ├── 10-ingress.yaml
    ├── backend/
    │   ├── configmap.yaml
    │   ├── Deployment.yaml
    │   ├── hpa.yaml
    │   ├── pvc.yaml
    │   ├── pv.yaml
    │   ├── secret.yaml
    │   ├── Service.yaml
    │   └── storageclass.yaml
    └── frontend/
        ├── deployment.yaml
        ├── Hpa.yml
        └── service.yaml

> **Note on filenames:** file naming is inconsistent in capitalization across the repository (e.g. `Deployment.yaml` and `Service.yaml` under `backend/`, but `deployment.yaml` under `frontend/`, and `Hpa.yml` for the frontend HPA). Linux filesystems are case-sensitive, so `kubectl apply` commands must reference the exact filenames as they exist in the repository.

Manifest responsibilities:

- Namespace: `flyeasy`
- Backend: Deployment, Service, ConfigMap, Secret, HPA, PVC, a static PV example, and a StorageClass
- Frontend: Deployment, Service, HPA
- ALB Ingress routing `/` to the frontend and `/api` to the backend

Since the backend API itself is mounted under `/api/v1`, the Ingress `/api` path rule should be consistent with the actual Nginx/Ingress routing configuration so that requests are correctly forwarded to the backend service.

### Kubernetes Prerequisites

The following are cluster-level add-ons/controllers, not application manifests included in this repository. They must be available on the EKS cluster before applying the manifests above, though installation methods vary depending on how the cluster was set up:

- **metrics-server** — required for Horizontal Pod Autoscalers to function.
- **AWS EBS CSI Driver** — required for dynamically provisioned, EBS-backed persistent storage.
- **AWS Load Balancer Controller** — required to provision an ALB from the Ingress resource; this is commonly installed via Helm, but the exact installation method depends on your EKS setup.

### Kubernetes Configuration

Before applying manifests:

1. Build and push the backend and frontend images to Amazon ECR (or another registry).
2. Update the image references in the Kubernetes Deployments to point at the pushed images.
3. Confirm the backend and frontend container ports match the Service definitions.
4. Confirm health-check paths (e.g. `/health`) if configured in the Deployments.
5. Supply secrets securely (do not commit real secret values into `secret.yaml`).
6. Configure the domain/host in the Ingress if required for your environment.

### Applying the Manifests

Apply in the following order, using the exact filenames present in the repository:

    kubectl apply -f K8s/00-namespace.yml
    kubectl apply -f K8s/backend/configmap.yaml
    kubectl apply -f K8s/backend/secret.yaml
    kubectl apply -f K8s/backend/storageclass.yaml
    kubectl apply -f K8s/backend/pvc.yaml
    kubectl apply -f K8s/backend/Deployment.yaml
    kubectl apply -f K8s/backend/Service.yaml
    kubectl apply -f K8s/backend/hpa.yaml
    kubectl apply -f K8s/frontend/deployment.yaml
    kubectl apply -f K8s/frontend/Service.yaml
    kubectl apply -f K8s/frontend/Hpa.yml
    kubectl apply -f K8s/10-ingress.yaml

Manifests can alternatively be applied by pointing `kubectl apply -f` at a directory (e.g. `kubectl apply -f K8s/backend/`), but be aware this does not guarantee ordering, so applying files individually in the order above is recommended, especially for resources with dependencies (e.g. Secret/ConfigMap before Deployment).

### Verification

    kubectl get all -n flyeasy
    kubectl get ingress -n flyeasy
    kubectl get hpa -n flyeasy
    kubectl get pvc -n flyeasy

The ALB Ingress should eventually be assigned an address once the AWS Load Balancer Controller provisions the load balancer; this can take a few minutes.

### Persistent Storage

The repository includes three storage-related manifests:

- **StorageClass** (`storageclass.yaml`) — defines how volumes are dynamically provisioned (e.g. backed by EBS).
- **PersistentVolumeClaim** (`pvc.yaml`) — requests storage that satisfies the StorageClass; this is the request a Pod actually consumes.
- **PersistentVolume** (`pv.yaml`) — a static, pre-provisioned volume example.

Dynamic provisioning through the StorageClass + PVC combination is the preferred approach for EBS-backed persistent storage on EKS. The static `pv.yaml` is included as an example and is not automatically required for the normal dynamic-provisioning workflow — it exists primarily for reference or for scenarios where a pre-existing volume needs to be bound explicitly.

---

## AWS Infrastructure

AWS infrastructure is provisioned through Terraform. At a high level, the infrastructure includes:

- A VPC with public and private subnets across two Availability Zones
- An Internet Gateway and a NAT Gateway
- IAM roles for EKS
- An ECR repository for container images
- A bastion host for administrative access
- An EKS cluster with a managed node group
- An S3 bucket intended for Terraform remote state

---

## Terraform

### Terraform Structure

The Terraform root configuration includes:

- AWS provider configuration
- An EC2 key pair resource
- A VPC module
- A Security module
- An IAM module
- An ECR module
- A Bastion module
- An EKS module
- A "backend" module (Terraform state — **not** the Node.js backend; see [Terraform State](#terraform-state))


Logical dependency flow between modules:

    VPC -> Security -> IAM -> ECR -> Bastion -> EKS -> Terraform state bucket

Terraform provisions the AWS infrastructure only. It does **not** configure Kubernetes workloads — no Kubernetes provider or Kubernetes resources are defined in this configuration. Kubernetes manifests are applied separately with `kubectl`, as described in [Kubernetes Deployment](#kubernetes-deployment).

### VPC

The VPC module defines:

| Resource | Value |
|---|---|
| VPC CIDR | `10.0.0.0/16` |
| Availability Zones | `us-east-1a`, `us-east-1b` |
| Public subnets | `10.0.1.0/24`, `10.0.2.0/24` |
| Private subnets | `10.0.11.0/24`, `10.0.12.0/24` |

Outputs: `vpc_id`, `public_subnet_ids`, `private_subnet_ids`, `internet_gateway_id`, `nat_gateway_id`.

Intended architecture:

- The Internet Gateway provides internet connectivity for resources in the public subnets.
- The NAT Gateway allows resources in the private subnets to initiate outbound internet connections without being directly publicly reachable.
- The bastion host is placed in a public subnet.
- EKS worker nodes are configured to run in the private subnets.

### Security

The security module currently creates a **bastion security group** only. It accepts `vpc_id` and `allowed_ssh_cidr` as inputs.

- **Ingress:** TCP port `22` from `allowed_ssh_cidr`.
- **Current default:** `0.0.0.0/0`.
- **Egress:** all outbound traffic allowed.

Output: `bastion_security_group_id`.

> ⚠️ The default `allowed_ssh_cidr` of `0.0.0.0/0` allows SSH from any IP address and is **not safe for production**. It should be restricted to a trusted IP address or CIDR range before deploying to a real environment.

### IAM

The IAM module creates:

**EKS cluster role** — `flyeasy-eks-cluster-role`
- Trusted by `eks.amazonaws.com`
- `AmazonEKSClusterPolicy` attached

**EKS node role** — `flyeasy-eks-node-role`
- Trusted by `ec2.amazonaws.com`
- Policies attached: `AmazonEKSWorkerNodePolicy`, `AmazonEC2ContainerRegistryReadOnly`, `AmazonEKS_CNI_Policy`

Outputs: `eks_cluster_role_arn`, `eks_node_role_arn`.



### ECR

The ECR module creates a single repository:

| Setting | Value |
|---|---|
| Name | `flyeasy` |
| Image tag mutability | `MUTABLE` |
| Scan on push | `true` |

Outputs: `repository_url`, `repository_arn`.

This repository is intended to store the FlyEasy container images used by EKS. Since a single repository is defined, if both frontend and backend images are pushed to it, image tags must be used to distinguish the two, for example:

    flyeasy:backend
    flyeasy:frontend

This tagging convention is not automatically enforced by the Terraform configuration and should be applied consistently as part of the image build/push process.

### Bastion Host

The Bastion module creates a single EC2 instance.

Inputs: `ami_id`, `instance_type`, `subnet_id`, `security_group_id`, `key_name`.

| Setting | Value |
|---|---|
| Instance type (default) | `t3.micro` |
| `associate_public_ip_address` | `true` |
| Tag | `Name = flyeasy-bastion` |

Outputs: `instance_id`, `public_ip`, `private_ip`.

The root configuration currently wires this module as:



> ⚠️ AMI IDs are **region- and time-specific**. `ami-0c7217cdde317cfec` should not be treated as universally valid — verify and update it for your target region before deploying.

### EKS

The EKS module creates:

**Cluster**
| Setting | Value |
|---|---|
| Name | `flyeasy-eks` |
| Kubernetes version | `1.33` |
| Subnets | Private subnet IDs |
| IAM role | Cluster IAM role from the IAM module |

**Managed node group**
| Setting | Value |
|---|---|
| Name | `<cluster-name>-nodes` |
| IAM role | Node IAM role from the IAM module |
| Subnets | Private subnet IDs |
| Instance type | `t3.medium` |
| Desired nodes | `2` |
| Minimum nodes | `1` |
| Maximum nodes | `3` |

Outputs: `cluster_name`, `cluster_endpoint`, `cluster_arn`, `node_group_name`.

**Note on autoscaling:** node-group autoscaling (min/max/desired nodes above) is separate from Kubernetes Horizontal Pod Autoscaling (HPA):
- **HPA** scales the number of **pods** for a given workload based on metrics.
- **Node-group scaling** changes the number of **worker nodes (EC2 instances)** available to the cluster.


### Terraform State

The Terraform module named **`backend`** is **not** the FlyEasy Node.js backend — it is easy to confuse the two given the naming, so to be explicit:

- `backend/` (repository root) = the Node.js/Express API application.
- `terraform/modules/backend/` = the Terraform module that provisions an S3 bucket for **Terraform remote state**.


The bucket has versioning enabled and server-side encryption using AES256.

Outputs: `bucket_name`, `bucket_arn`.

> **Important:** creating this S3 bucket does **not**, by itself, make Terraform use it as its state backend. A separate `backend "s3" { ... }` configuration block must be added to the Terraform configuration and initialized with `terraform init` for remote state to actually be used.

### Terraform Key Pair

The root configuration creates an EC2 key pair:


The corresponding private key remains local to the operator's machine and must **never** be committed to version control.

### Terraform Variables

Key configurable variables, grouped by module:

**VPC:** `vpc_cidr`, `availability_zones`, `public_subnet_cidrs`, `private_subnet_cidrs`
**Security:** `allowed_ssh_cidr`
**Bastion:** `ami_id`, `instance_type`, `subnet_id`, `security_group_id`, `key_name`
**EKS:** `cluster_name`, `cluster_version`, `subnet_ids`, `cluster_role_arn`, `node_role_arn`, `node_instance_type`, `desired_nodes`, `min_nodes`, `max_nodes`
**ECR:** `repository_name`
**Terraform state:** `bucket_name`

### Terraform Outputs

The root configuration outputs: `vpc_id`, `public_subnet_ids`, `private_subnet_ids`, `internet_gateway_id`, `nat_gateway_id`. Individual modules additionally output their own relevant resource IDs/ARNs (see each module section above).

### Terraform Deployment

    cd terraform

    terraform init        # Initializes providers/modules and (if configured) the remote backend
    terraform fmt -recursive   # Formats configuration files consistently
    terraform validate    # Validates configuration syntax and internal consistency
    terraform plan         # Shows the changes Terraform will make
    terraform apply        # Applies those changes and provisions the infrastructure

Once the EKS cluster has been created, configure `kubectl` to talk to it:

    aws eks update-kubeconfig --region us-east-1 --name flyeasy-eks

Verify connectivity:

    kubectl get nodes

Kubernetes resources are then deployed using the manifests in `K8s/`, as described in [Kubernetes Deployment](#kubernetes-deployment). Terraform does not deploy these manifests itself.

---

## End-to-End AWS Deployment Flow

1. Terraform provisions AWS infrastructure.
2. VPC and networking (subnets, Internet Gateway, NAT Gateway) are created.
3. IAM roles are created.
4. The ECR repository is created.
5. The bastion host is created.
6. The EKS cluster and managed node group are created.
7. Docker images for the backend and frontend are built.
8. Images are pushed to ECR.
9. `kubeconfig` is configured for the new cluster.
10. Required EKS add-ons/controllers (metrics-server, EBS CSI Driver, AWS Load Balancer Controller) are installed.
11. Kubernetes manifests are applied.
12. Services and Deployments start.
13. HPA manages pod scaling based on load.
14. The AWS Load Balancer Controller provisions an ALB from the Ingress resource.
15. DNS is pointed to the ALB.
16. The application becomes accessible through the configured domain.

---

## Security Considerations

- Never commit `.env` files or real secret values to version control.
- Never commit private SSH keys.
- Restrict `allowed_ssh_cidr` to a trusted IP/CIDR instead of the current default of `0.0.0.0/0`.
- Do not put production credentials directly into Kubernetes YAML files that are committed to Git.
- Prefer a managed secret solution such as AWS Secrets Manager or the External Secrets Operator over plain Kubernetes Secrets committed to source control.
- Consider using immutable ECR image tags in production, rather than the current `MUTABLE` setting, to prevent tags from being overwritten.
- Keep AMI IDs current and region-appropriate; do not assume a hardcoded AMI ID remains valid indefinitely.
- Ensure MongoDB is not publicly exposed to the internet.
- Use HTTPS/TLS for all production traffic.
- Protect the Kubernetes API and RBAC configuration; do not expose the API server publicly without proper access controls.
- Review IAM permissions regularly according to the principle of least privilege.
- Enable appropriate logging and monitoring across the application and infrastructure.
- Treat the bastion host strictly as a controlled administrative access point, not a general-purpose server.

None of the above should be read as "already implemented" unless explicitly stated elsewhere in this document — several are recommended improvements over the current configuration.

---

## Production Considerations

The current configuration is a solid foundation, but the following areas are prerequisites or recommended improvements rather than implemented features:

- **CI/CD:** no pipeline is defined in this repository; image builds and `kubectl`/`terraform` commands are currently manual.
- **TLS/HTTPS:** no TLS termination or certificate management (e.g. ACM, cert-manager) is configured.
- **DNS:** no Route 53 or other DNS resource is defined; DNS must be pointed at the ALB manually or via separate tooling.
- **CDN:** no CloudFront or equivalent CDN is configured.
- **Caching layer:** no Redis or equivalent caching/session store is configured.
- **Node autoscaling automation:** Cluster Autoscaler or Karpenter is not configured; only static min/max/desired values are set on the managed node group.
- **Fine-grained IAM:** IRSA/Pod Identity for workload-level permissions is not configured.
- **Secret management:** secrets are currently handled via Kubernetes Secrets and environment files rather than a dedicated secrets manager.

---

## Troubleshooting

- **Ingress has no address:** confirm the AWS Load Balancer Controller is installed and has the necessary IAM permissions; check its logs with `kubectl logs` in its namespace.
- **HPA shows unknown targets:** confirm `metrics-server` is installed and running in the cluster.
- **PVC stuck in `Pending`:** confirm the AWS EBS CSI Driver is installed and that the StorageClass provisioner matches it.
- **`kubectl apply` fails with "no such file":** double-check the exact filename and capitalization under `K8s/` — filenames are not consistently lowercase across this repository.
- **Backend unreachable behind Ingress:** confirm the Ingress `/api` rule, the backend Service port, and the application's `/api/v1` base path are all consistent with each other.
- **Login/verification emails not sending:** confirm `EMAIL_USER`, `EMAIL_PASS`, and related SMTP configuration in `config/nodemailer.ts` are set correctly.
- **`terraform apply` fails on the bastion AMI:** confirm the AMI ID is valid for your target region; AMI IDs are region-specific and change over time.

---

## Author
Anthony
Maintained as part of the FlyEasy project. Contributions and issue reports are welcome via the project's repository.