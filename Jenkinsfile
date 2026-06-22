pipeline {
    agent any

    environment {
        IMAGE_NAME = "taskflow-api"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Lint') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                sh 'npm run lint'
            }
        }
        
        stage('Test') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                sh 'npm test'
            }
        }
        
        stage('Build Docker') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:latest -t ${IMAGE_NAME}:build-${BUILD_NUMBER} ."
            }
        }
        
        stage('Deploy') {
            steps {
                withCredentials([string(credentialsId: 'MONGO_URI_SECRET', variable: 'MONGO_URI')]) {
                    sh """
                    echo "PORT=5000" > .env
                    echo "MONGO_URI=${MONGO_URI}" >> .env
                    docker compose up -d
                    """
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline terminé. Le résumé de la couverture des tests est affiché dans la console du stage Test."
        }
        success {
            echo "Succès ! L'application est déployée et accessible sur http://localhost/"
        }
        failure {
            echo "Échec du pipeline. Veuillez vérifier les logs pour identifier l'étape en erreur."
        }
    }
}
