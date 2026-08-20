pipeline {
    agent any

    options {
        disableConcurrentBuilds()
    }

    parameters {
        string(name: 'IMAGE_TAG_OVERRIDE', defaultValue: '', description: 'Optional custom image tag. Leave blank to use the Jenkins build number.')
        booleanParam(name: 'SKIP_TESTS', defaultValue: false, description: 'Skip the Run Tests stage (use only for emergency/debug builds).')
        string(name: 'K8S_NAMESPACE', defaultValue: 'flyeasy', description: 'Kubernetes namespace to deploy to.')
        string(name: 'NOTIFY_EMAIL', defaultValue: 'ayomi.kifodah@gmail.com', description: 'Email address to notify on build success/failure.')
    }

    environment {
        COMPOSE_PROJECT_NAME = 'flyeasy'
        AWS_REGION            = 'us-east-2'
        AWS_ACCOUNT_ID         = '847776737366'
        ECR_REPO               = 'flyeasy-backend'
        ECR_REGISTRY            = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        IMAGE_TAG                = "${params.IMAGE_TAG_OVERRIDE?.trim() ? params.IMAGE_TAG_OVERRIDE.trim() : env.BUILD_NUMBER}"
	K8S_NAMESPACE             = "${params.K8S_NAMESPACE}"
    }

    stages {

        stage("Pull from GitHub") {
            steps {
                checkout scm
            }
        }

        stage("Install Dependencies") {
            steps {
                sh '''
                    docker run --rm \
                        -v "$WORKSPACE/backend":/app \
                        -w /app \
                        node:20-alpine \
                        npm ci
                '''
            }
        }

        stage("Run Tests") {
            when {
                expression { return !params.SKIP_TESTS }
            }
            steps {
                sh '''
                    docker run --rm \
                        -v "$WORKSPACE/backend":/app \
                        -w /app \
                        node:20-alpine \
                        npm test
                '''
            }
        }

        stage("Build Docker Image") {
            steps {
                sh '''
                    docker compose build
                '''
            }
        }

        stage("Tag Image for ECR") {
            steps {
                sh '''
                    docker tag flyeasy-backend:latest ${ECR_REGISTRY}/${ECR_REPO}:${IMAGE_TAG}
                    docker tag flyeasy-backend:latest ${ECR_REGISTRY}/${ECR_REPO}:latest
                '''
            }
        }

        stage("Push Image to Amazon ECR") {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'aws-ecr-creds',
                    usernameVariable: 'AWS_ACCESS_KEY_ID',
                    passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                )]) {
                    sh '''
                        aws ecr get-login-password --region ${AWS_REGION} | \
                            docker login --username AWS --password-stdin ${ECR_REGISTRY}

                        docker push ${ECR_REGISTRY}/${ECR_REPO}:${IMAGE_TAG}
                        docker push ${ECR_REGISTRY}/${ECR_REPO}:latest
                    '''
                }
            }
        }

        stage("Refresh K8s ECR Pull Secret") {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'aws-ecr-creds',
                    usernameVariable: 'AWS_ACCESS_KEY_ID',
                    passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                )]) {
                      sh '''
                        kubectl create secret docker-registry ecr-secret \
                            -n ${K8S_NAMESPACE} \
                            --docker-server=${ECR_REGISTRY} \
                            --docker-username=AWS \
                            --docker-password=$(aws ecr get-login-password --region ${AWS_REGION}) \
                            --dry-run=client -o yaml | kubectl apply -f -
                    '''
                }
            }
        }

        stage("Deploy to Kubernetes") {
            steps {
                sh '''
                    kubectl set image deployment/flyeasy-backend \
                        flyeasy-backend=${ECR_REGISTRY}/${ECR_REPO}:${IMAGE_TAG} \
                        -n ${K8S_NAMESPACE}

                    kubectl rollout status deployment/flyeasy-backend -n ${K8S_NAMESPACE} --timeout=120s
                '''
            }
        }

        stage("Verify Deployment") {
            steps {
                sh '''
                    kubectl get pods -n ${K8S_NAMESPACE}
                    kubectl logs -n ${K8S_NAMESPACE} -l app=flyeasy-backend --tail=30
                '''
            }
        }
    }

    post {
        success {
            echo "FlyEasy deployment successful! Image tag: ${IMAGE_TAG}"
            emailext (
                subject: "SUCCESS: FlyEasy Pipeline #${env.BUILD_NUMBER}",
                body: "FlyEasy deployed successfully.\n\nBuild: ${env.BUILD_NUMBER}\nImage: ${ECR_REGISTRY}/${ECR_REPO}:${IMAGE_TAG}\nNamespace: ${params.K8S_NAMESPACE}\nJob URL: ${env.BUILD_URL}",
                to: "${params.NOTIFY_EMAIL}"
            )
        }
        failure {
            echo "Deployment failed. Check Jenkins logs."
            emailext (
                subject: "FAILED: FlyEasy Pipeline #${env.BUILD_NUMBER}",
                body: "FlyEasy build/deploy failed.\n\nBuild: ${env.BUILD_NUMBER}\nJob URL: ${env.BUILD_URL}\nCheck console output for details.",
                to: "${params.NOTIFY_EMAIL}"
            )
        }
        always {
            echo "Pipeline completed."
        }
    }
}
