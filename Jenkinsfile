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


        stage("Build Docker Images") {
            steps {
                sh '''
                    docker compose build
                '''
            }
        }


        stage("Deploy with Ansible") {
            steps {
                sh '''
                    ansible-playbook -i ansible/inventory ansible/deploy.yml
                '''
            }
        }


        stage("Verify Deployment") {
            steps {
                sh '''
                    docker ps
                '''
            }
        }

    }


    post {

        success {
            echo "FlyEasy deployment successful!"
        }

        failure {
            echo "Deployment failed. Check Jenkins logs."
        }

        always {
            echo "Pipeline completed."
        }

    }

}