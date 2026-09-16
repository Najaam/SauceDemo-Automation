pipeline {
    agent any

    triggers {
        // Automatically triggers build when code is pushed to GitHub repository
        githubPush()
    }

    environment {
        DOCKER_CONFIG = 'C:\\Users\\SP23BSCS0013-NAJMURR\\.docker'
        PATH = "C:\\Users\\SP23BSCS0013-NAJMURR\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin;C:\\Program Files\\Git\\cmd;${env.PATH}"
        IMAGE_NAME = 'saucedemo-automation'
        COMPOSE_PROJECT_NAME = 'saucedemo'
        CI = 'true'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        ansiColor('xterm')
    }

    stages {
        stage('Checkout SCM') {
            steps {
                echo '=== Stage 1: Checking out source code from Git ==='
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                echo '=== Stage 2: Building Docker test runner image ==='
                script {
                    if (isUnix()) {
                        sh 'docker compose build || docker-compose build'
                    } else {
                        bat 'set "DOCKER_CONFIG=C:\\Users\\SP23BSCS0013-NAJMURR\\.docker" && set "PATH=C:\\Users\\SP23BSCS0013-NAJMURR\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin;C:\\Program Files\\Git\\cmd;%PATH%" && docker-compose build'
                    }
                }
            }
        }

        stage('Run CI Tests (Docker)') {
            steps {
                echo '=== Stage 3: Executing Playwright UI & API Test Suite ==='
                script {
                    def exitCode = 0
                    if (isUnix()) {
                        exitCode = sh(
                            script: 'docker compose up --exit-code-from playwright-tests playwright-tests || docker-compose up --exit-code-from playwright-tests playwright-tests',
                            returnStatus: true
                        )
                    } else {
                        exitCode = bat(
                            script: 'set "DOCKER_CONFIG=C:\\Users\\SP23BSCS0013-NAJMURR\\.docker" && set "PATH=C:\\Users\\SP23BSCS0013-NAJMURR\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin;C:\\Program Files\\Git\\cmd;%PATH%" && docker-compose up --exit-code-from playwright-tests playwright-tests',
                            returnStatus: true
                        )
                    }

                    if (exitCode != 0) {
                        currentBuild.result = 'UNSTABLE'
                        echo "⚠️ Tests failed with exit code: ${exitCode}. Marking build as UNSTABLE to publish reports."
                    } else {
                        echo "✅ All tests passed successfully!"
                    }
                }
            }
        }

        stage('Publish Reports & Artifacts') {
            steps {
                echo '=== Stage 4: Archiving and publishing test reports ==='
                script {
                    // 1. Archive raw test results, traces, and screenshots
                    archiveArtifacts artifacts: 'test-results/**, playwright-report/**, allure-results/**', allowEmptyArchive: true

                    // 2. Publish Playwright HTML Report if HTML Publisher plugin is installed
                    try {
                        publishHTML([
                            allowMissing: true,
                            alwaysLinkToLastBuild: true,
                            keepAll: true,
                            reportDir: 'playwright-report',
                            reportFiles: 'index.html',
                            reportName: 'Playwright HTML Report',
                            reportTitles: 'Playwright Test Report'
                        ])
                    } catch (Throwable e) {
                        echo "ℹ️ HTML Publisher step skipped: ${e.message}"
                    }

                    // 3. Publish Allure Report if Allure Jenkins plugin is installed
                    try {
                        allure([
                            includeProperties: false,
                            jdk: '',
                            properties: [],
                            reportBuildPolicy: 'ALWAYS',
                            results: [[path: 'allure-results']]
                        ])
                    } catch (Throwable e) {
                        echo "ℹ️ Allure step skipped: ${e.message}"
                    }
                }
            }
        }

        stage('Deploy on Docker') {
            when {
                // Deploys only when CI tests pass completely
                expression {
                    return currentBuild.result == null || currentBuild.result == 'SUCCESS'
                }
            }
            steps {
                echo '=== Stage 5: CI Passed! Deploying services on Docker ==='
                script {
                    if (isUnix()) {
                        sh "docker tag ${IMAGE_NAME}:latest ${IMAGE_NAME}:deployed || true"
                        sh 'docker compose up -d allure-report playwright-report || docker-compose up -d allure-report playwright-report'
                        sh 'docker compose ps || docker-compose ps'
                    } else {
                        bat "set \"DOCKER_CONFIG=C:\\Users\\SP23BSCS0013-NAJMURR\\.docker\" && set \"PATH=C:\\Users\\SP23BSCS0013-NAJMURR\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin;C:\\Program Files\\Git\\cmd;%PATH%\" && docker tag ${IMAGE_NAME}:latest ${IMAGE_NAME}:deployed || echo Tagging skipped"
                        bat 'set "DOCKER_CONFIG=C:\\Users\\SP23BSCS0013-NAJMURR\\.docker\" && set "PATH=C:\\Users\\SP23BSCS0013-NAJMURR\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin;C:\\Program Files\\Git\\cmd;%PATH%\" && docker-compose up -d allure-report playwright-report'
                        bat 'set "DOCKER_CONFIG=C:\\Users\\SP23BSCS0013-NAJMURR\\.docker\" && set "PATH=C:\\Users\\SP23BSCS0013-NAJMURR\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin;C:\\Program Files\\Git\\cmd;%PATH%\" && docker-compose ps'
                    }

                    echo """
                    ======================================================
                    🚀 Docker Deployment Successful!
                    - Allure Report Dashboard: http://<server-ip>:5050
                    - Playwright HTML Server:  http://<server-ip>:9323
                    ======================================================
                    """
                }
            }
        }
    }

    post {
        always {
            script {
                echo '=== Cleaning up ephemeral test runner container ==='
                if (isUnix()) {
                    sh 'docker compose rm -f playwright-tests || docker-compose rm -f playwright-tests || true'
                } else {
                    bat 'set "DOCKER_CONFIG=C:\\Users\\SP23BSCS0013-NAJMURR\\.docker\" && set "PATH=C:\\Users\\SP23BSCS0013-NAJMURR\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin;C:\\Program Files\\Git\\cmd;%PATH%\" && docker-compose rm -f playwright-tests || ver>nul'
                }
            }
        }
        success {
            echo '🎉 Pipeline completed successfully and deployed to Docker!'
        }
        unstable {
            echo '⚠️ Pipeline completed with test failures. Deployment was skipped.'
        }
        failure {
            echo '❌ Pipeline failed during build or execution. Deployment was skipped.'
        }
    }
}
