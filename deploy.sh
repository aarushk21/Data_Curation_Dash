#!/bin/bash

# Data Pipeline Management System Deployment Script
# This script automates the build and deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="data-pipeline-manager"
DOCKER_REGISTRY="your-registry.com"
AWS_REGION="us-east-1"
ENVIRONMENT=${1:-development}

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Node.js is installed (for frontend)
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check if Java is installed (for backend)
    if ! command -v java &> /dev/null; then
        log_error "Java is not installed. Please install Java 17 or higher first."
        exit 1
    fi
    
    # Check if Maven is installed
    if ! command -v mvn &> /dev/null; then
        log_error "Maven is not installed. Please install Maven first."
        exit 1
    fi
    
    log_success "All prerequisites are satisfied"
}

build_frontend() {
    log_info "Building React frontend..."
    
    cd frontend
    
    # Install dependencies
    log_info "Installing frontend dependencies..."
    npm install
    
    # Build for production
    log_info "Building frontend for production..."
    npm run build
    
    # Build Docker image
    log_info "Building frontend Docker image..."
    docker build -t ${PROJECT_NAME}-frontend:latest .
    
    cd ..
    log_success "Frontend build completed"
}

build_backend() {
    log_info "Building Spring Boot backend..."
    
    cd backend
    
    # Clean and build with Maven
    log_info "Building backend with Maven..."
    mvn clean package -DskipTests
    
    # Build Docker image
    log_info "Building backend Docker image..."
    docker build -t ${PROJECT_NAME}-backend:latest .
    
    cd ..
    log_success "Backend build completed"
}

build_monitoring() {
    log_info "Building monitoring stack..."
    
    cd monitoring
    
    # Build Prometheus configuration
    log_info "Configuring Prometheus..."
    if [ ! -f "prometheus.yml" ]; then
        log_error "Prometheus configuration not found"
        exit 1
    fi
    
    # Build Grafana dashboards
    log_info "Setting up Grafana dashboards..."
    if [ ! -d "grafana/dashboards" ]; then
        mkdir -p grafana/dashboards
    fi
    
    cd ..
    log_success "Monitoring stack build completed"
}

deploy_local() {
    log_info "Deploying to local environment..."
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose -f docker/docker-compose.yml down
    
    # Build and start services
    log_info "Starting services..."
    docker-compose -f docker/docker-compose.yml up --build -d
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    check_service_health
    
    log_success "Local deployment completed"
}

deploy_aws() {
    log_info "Deploying to AWS..."
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install AWS CLI first."
        exit 1
    fi
    
    # Check if Terraform is installed
    if ! command -v terraform &> /dev/null; then
        log_error "Terraform is not installed. Please install Terraform first."
        exit 1
    fi
    
    cd infrastructure
    
    # Initialize Terraform
    log_info "Initializing Terraform..."
    terraform init
    
    # Plan deployment
    log_info "Planning Terraform deployment..."
    terraform plan -var="environment=${ENVIRONMENT}" -var="database_password=${DB_PASSWORD}"
    
    # Apply deployment
    log_info "Applying Terraform deployment..."
    terraform apply -var="environment=${ENVIRONMENT}" -var="database_password=${DB_PASSWORD}" -auto-approve
    
    # Get outputs
    log_info "Getting deployment outputs..."
    ALB_DNS=$(terraform output -raw alb_dns_name)
    RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
    
    cd ..
    
    log_success "AWS deployment completed"
    log_info "Application URL: http://${ALB_DNS}"
    log_info "RDS Endpoint: ${RDS_ENDPOINT}"
}

check_service_health() {
    log_info "Checking service health..."
    
    # Check backend health
    if curl -f http://localhost:8080/api/actuator/health > /dev/null 2>&1; then
        log_success "Backend is healthy"
    else
        log_error "Backend health check failed"
        return 1
    fi
    
    # Check frontend health
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_success "Frontend is healthy"
    else
        log_error "Frontend health check failed"
        return 1
    fi
    
    # Check database health
    if docker exec pipeline-postgres pg_isready -U postgres > /dev/null 2>&1; then
        log_success "Database is healthy"
    else
        log_error "Database health check failed"
        return 1
    fi
    
    # Check Prometheus health
    if curl -f http://localhost:9090/-/healthy > /dev/null 2>&1; then
        log_success "Prometheus is healthy"
    else
        log_error "Prometheus health check failed"
        return 1
    fi
    
    # Check Grafana health
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_success "Grafana is healthy"
    else
        log_error "Grafana health check failed"
        return 1
    fi
}

run_tests() {
    log_info "Running tests..."
    
    # Backend tests
    cd backend
    log_info "Running backend tests..."
    mvn test
    cd ..
    
    # Frontend tests
    cd frontend
    log_info "Running frontend tests..."
    npm test -- --watchAll=false
    cd ..
    
    log_success "All tests passed"
}

cleanup() {
    log_info "Cleaning up..."
    
    # Stop and remove containers
    docker-compose -f docker/docker-compose.yml down -v
    
    # Remove Docker images
    docker rmi ${PROJECT_NAME}-frontend:latest ${PROJECT_NAME}-backend:latest 2>/dev/null || true
    
    # Clean Maven cache
    cd backend
    mvn clean
    cd ..
    
    # Clean npm cache
    cd frontend
    npm run clean 2>/dev/null || true
    cd ..
    
    log_success "Cleanup completed"
}

show_help() {
    echo "Data Pipeline Management System Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND] [ENVIRONMENT]"
    echo ""
    echo "Commands:"
    echo "  build       Build all components"
    echo "  deploy      Deploy the application"
    echo "  local       Deploy to local environment"
    echo "  aws         Deploy to AWS"
    echo "  test        Run tests"
    echo "  health      Check service health"
    echo "  cleanup     Clean up resources"
    echo "  help        Show this help message"
    echo ""
    echo "Environments:"
    echo "  development (default)"
    echo "  staging"
    echo "  production"
    echo ""
    echo "Examples:"
    echo "  $0 build"
    echo "  $0 deploy local"
    echo "  $0 deploy aws production"
}

# Main script
case "${1:-help}" in
    "build")
        check_prerequisites
        build_frontend
        build_backend
        build_monitoring
        log_success "Build completed successfully"
        ;;
    "deploy")
        case "${2:-local}" in
            "local")
                check_prerequisites
                build_frontend
                build_backend
                build_monitoring
                deploy_local
                ;;
            "aws")
                check_prerequisites
                build_frontend
                build_backend
                build_monitoring
                deploy_aws
                ;;
            *)
                log_error "Invalid deployment target. Use 'local' or 'aws'"
                exit 1
                ;;
        esac
        ;;
    "local")
        deploy_local
        ;;
    "aws")
        deploy_aws
        ;;
    "test")
        run_tests
        ;;
    "health")
        check_service_health
        ;;
    "cleanup")
        cleanup
        ;;
    "help"|*)
        show_help
        ;;
esac 