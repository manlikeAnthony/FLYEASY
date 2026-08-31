pipeline {
agent any

```
options {
    disableConcurrentBuilds()
    timestamps()
}

parameters {
    string(
        name: 'IMAGE_TAG_OVERRIDE',
        defaultValue: '',
        description: 'Optional custom image tag. Leave blank to use the Jenkins build number.'
    )

    booleanParam(
        name: 'SKIP_TESTS',
        defaultValue: false,
        description: 'Skip backend tests. Use only for emergency/debug builds.'
    )

    string(
        name: 'NOTIFY_EMAIL',
        defaultValue: 'ayomi.kifodah@gmail.com',
        description: 'Email address for build notifications.'
    )
}

environment {
    AWS_REGION      = 'us-east-1'
    AWS_ACCOUNT_ID  = '380267955461'

    ECR_REPO        = 'flyeasy'
    ECR_REGISTRY    = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

    K8S_CLUSTER     = 'flyeasy-eks'
    K8S_NAMESPACE   = 'flyeasy'
    KUBECONFIG      = '/var/lib/jenkins/.kube/config'

    IMAGE_TAG       = "${params.IMAGE_TAG_OVERRIDE?.trim() ? params.IMAGE_TAG_OVERRIDE.trim() : env.BUILD_NUMBER}"
}

stages {

    stage('Checkout') {
        steps {
            checkout scm

            sh '''
                echo "=========================================="
                echo "FlyEasy CI/CD Pipeline"
                echo "=========================================="
                echo "Build:       ${BUILD_NUMBER}"
                echo "Git commit:  $(git rev-parse --short HEAD)"
                echo "AWS Region:  ${AWS_REGION}"
                echo "ECR Repo:    ${ECR_REGISTRY}/${ECR_REPO}"
                echo "EKS Cluster: ${K8S_CLUSTER}"
                echo "Namespace:   ${K8S_NAMESPACE}"
                echo "Image tag:   ${IMAGE_TAG}"
                echo "=========================================="
            '''
        }
    }

    stage('Verify AWS Access') {
        steps {
            withCredentials([
                usernamePassword(
                    credentialsId: 'aws-ecr-creds',
                    usernameVariable: 'AWS_ACCESS_KEY_ID',
                    passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                )
            ]) {
                sh '''
                    set -e

                    echo "Checking AWS credentials..."

                    aws sts get-caller-identity

                    echo "Checking ECR repository..."

                    aws ecr describe-repositories \
                        --repository-names "${ECR_REPO}" \
                        --region "${AWS_REGION}"

                    echo "AWS access verified."
                '''
            }
        }
    }

    stage('Configure EKS Access') {
        steps {
            withCredentials([
                usernamePassword(
                    credentialsId: 'aws-ecr-creds',
                    usernameVariable: 'AWS_ACCESS_KEY_ID',
                    passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                )
            ]) {
                sh '''
                    set -e

                    echo "Configuring EKS access..."

                    mkdir -p "$(dirname "${KUBECONFIG}")"

                    aws eks update-kubeconfig \
                        --region "${AWS_REGION}" \
                        --name "${K8S_CLUSTER}" \
                        --kubeconfig "${KUBECONFIG}"

                    echo "Testing Kubernetes access..."

                    kubectl get nodes

                    echo "Checking FlyEasy namespace..."

                    kubectl get namespace "${K8S_NAMESPACE}"

                    echo "EKS access verified."
                '''
            }
        }
    }

    stage('Install Backend Dependencies') {
        steps {
            sh '''
                set -e

                docker run --rm \
                    -v "$WORKSPACE/backend":/app \
                    -w /app \
                    node:20-alpine \
                    npm ci
            '''
        }
    }

    stage('Run Backend Tests') {
        when {
            expression {
                return !params.SKIP_TESTS
            }
        }

        steps {
            sh '''
                set -e

                docker run --rm \
                    -v "$WORKSPACE/backend":/app \
                    -w /app \
                    node:20-alpine \
                    npm test
            '''
        }
    }

    stage('Build Backend Image') {
        steps {
            sh '''
                set -e

                docker build \
                    -t "${ECR_REGISTRY}/${ECR_REPO}:backend-${IMAGE_TAG}" \
                    -t "${ECR_REGISTRY}/${ECR_REPO}:backend-latest" \
                    ./backend
            '''
        }
    }

    stage('Build Frontend Image') {
        steps {
            sh '''
                set -e

                docker build \
                    -t "${ECR_REGISTRY}/${ECR_REPO}:frontend-${IMAGE_TAG}" \
                    -t "${ECR_REGISTRY}/${ECR_REPO}:frontend-latest" \
                    ./frontend
            '''
        }
    }

    stage('Login to ECR') {
        steps {
            withCredentials([
                usernamePassword(
                    credentialsId: 'aws-ecr-creds',
                    usernameVariable: 'AWS_ACCESS_KEY_ID',
                    passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                )
            ]) {
                sh '''
                    set -e

                    aws ecr get-login-password \
                        --region "${AWS_REGION}" | \
                    docker login \
                        --username AWS \
                        --password-stdin "${ECR_REGISTRY}"
                '''
            }
        }
    }

    stage('Push Backend Image') {
        steps {
            sh '''
                set -e

                docker push \
                    "${ECR_REGISTRY}/${ECR_REPO}:backend-${IMAGE_TAG}"

                docker push \
                    "${ECR_REGISTRY}/${ECR_REPO}:backend-latest"
            '''
        }
    }

    stage('Push Frontend Image') {
        steps {
            sh '''
                set -e

                docker push \
                    "${ECR_REGISTRY}/${ECR_REPO}:frontend-${IMAGE_TAG}"

                docker push \
                    "${ECR_REGISTRY}/${ECR_REPO}:frontend-latest"
            '''
        }
    }

    stage('Deploy Backend') {
        steps {
            withCredentials([
                usernamePassword(
                    credentialsId: 'aws-ecr-creds',
                    usernameVariable: 'AWS_ACCESS_KEY_ID',
                    passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                )
            ]) {
                sh '''
                    set -e

                    echo "Deploying backend..."

                    kubectl set image \
                        deployment/backend-deployment \
                        backend="${ECR_REGISTRY}/${ECR_REPO}:backend-${IMAGE_TAG}" \
                        -n "${K8S_NAMESPACE}"

                    kubectl rollout status \
                        deployment/backend-deployment \
                        -n "${K8S_NAMESPACE}" \
                        --timeout=180s
                '''
            }
        }
    }

    stage('Deploy Frontend') {
        steps {
            withCredentials([
                usernamePassword(
                    credentialsId: 'aws-ecr-creds',
                    usernameVariable: 'AWS_ACCESS_KEY_ID',
                    passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                )
            ]) {
                sh '''
                    set -e

                    echo "Deploying frontend..."

                    kubectl set image \
                        deployment/frontend-deployment \
                        frontend="${ECR_REGISTRY}/${ECR_REPO}:frontend-${IMAGE_TAG}" \
                        -n "${K8S_NAMESPACE}"

                    kubectl rollout status \
                        deployment/frontend-deployment \
                        -n "${K8S_NAMESPACE}" \
                        --timeout=180s
                '''
            }
        }
    }

    stage('Verify Deployment') {
        steps {
            withCredentials([
                usernamePassword(
                    credentialsId: 'aws-ecr-creds',
                    usernameVariable: 'AWS_ACCESS_KEY_ID',
                    passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                )
            ]) {
                sh '''
                    set -e

                    echo "=========================================="
                    echo "Kubernetes Deployments"
                    echo "=========================================="

                    kubectl get deployments \
                        -n "${K8S_NAMESPACE}"

                    echo ""
                    echo "=========================================="
                    echo "Pods"
                    echo "=========================================="

                    kubectl get pods \
                        -n "${K8S_NAMESPACE}" \
                        -o wide

                    echo ""
                    echo "=========================================="
                    echo "Services"
                    echo "=========================================="

                    kubectl get services \
                        -n "${K8S_NAMESPACE}"

                    echo ""
                    echo "=========================================="
                    echo "Backend Image"
                    echo "=========================================="

                    kubectl get deployment backend-deployment \
                        -n "${K8S_NAMESPACE}" \
                        -o jsonpath='{.spec.template.spec.containers[0].image}'

                    echo ""

                    echo "=========================================="
                    echo "Frontend Image"
                    echo "=========================================="

                    kubectl get deployment frontend-deployment \
                        -n "${K8S_NAMESPACE}" \
                        -o jsonpath='{.spec.template.spec.containers[0].image}'

                    echo ""
                '''
            }
        }
    }
}

post {

    success {
        echo """
        ==========================================
        FLYEASY DEPLOYMENT SUCCESSFUL
        ==========================================

        Build: ${env.BUILD_NUMBER}

        Backend:
        ${env.ECR_REGISTRY}/${env.ECR_REPO}:backend-${env.IMAGE_TAG}

        Frontend:
        ${env.ECR_REGISTRY}/${env.ECR_REPO}:frontend-${env.IMAGE_TAG}

        Kubernetes:
        Cluster:   ${env.K8S_CLUSTER}
        Namespace: ${env.K8S_NAMESPACE}

        ==========================================
        """

        emailext(
            subject: "SUCCESS: FlyEasy Pipeline #${env.BUILD_NUMBER}",
            body: """
            FlyEasy deployment completed successfully.

            Build: ${env.BUILD_NUMBER}

            Backend Image:
            ${env.ECR_REGISTRY}/${env.ECR_REPO}:backend-${env.IMAGE_TAG}

            Frontend Image:
            ${env.ECR_REGISTRY}/${env.ECR_REPO}:frontend-${env.IMAGE_TAG}

            EKS Cluster:
            ${env.K8S_CLUSTER}

            Namespace:
            ${env.K8S_NAMESPACE}

            Jenkins:
            ${env.BUILD_URL}
            """,
            to: "${params.NOTIFY_EMAIL}"
        )
    }

    failure {
        echo """
        ==========================================
        FLYEASY DEPLOYMENT FAILED
        ==========================================

        Build: ${env.BUILD_NUMBER}

        Check the Jenkins console output.

        ==========================================
        """

        emailext(
            subject: "FAILED: FlyEasy Pipeline #${env.BUILD_NUMBER}",
            body: """
            FlyEasy CI/CD pipeline failed.

            Build: ${env.BUILD_NUMBER}

            Jenkins:
            ${env.BUILD_URL}

            Check the Jenkins console output for the failed stage.
            """,
            to: "${params.NOTIFY_EMAIL}"
        )
    }

    always {
        echo "FlyEasy pipeline completed."
    }
}
```

}
