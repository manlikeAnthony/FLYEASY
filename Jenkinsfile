pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'flyeasy'
    }

    stages {

        stage("Checkout") {
            steps {
                checkout scm
            }
        }

        stage("Stop existing containers") {
            steps {
                sh '''
                    docker-compose down || true
                    docker-compose up --build -d
                '''
            }
        }

        stage("Build and deploy") {
            steps {
                sh "docker-compose up --build -d"
            }
        }

        stage("Verify running containers") {
            steps {
                sh "docker ps"
            }
        }

        stage("Cleanup old images") {
            steps {
                sh "docker image prune -f"
            }
        }
    }

    post {
        success {
            echo "Deployment successful!"
        }
        failure {
            echo "Deployment failed. Check logs."
        }
        always {
            echo "Pipeline finished."
        }
    }
}