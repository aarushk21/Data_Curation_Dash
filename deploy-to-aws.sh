#!/bin/bash

# Data Pipeline Management System - AWS Deployment Script
# This script will deploy your entire application to AWS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="data-pipeline-manager"
AWS_REGION="us-east-1"
ENVIRONMENT="production"
S3_BUCKET_NAME="data-pipeline-terraform-state-$(date +%s)"

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
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check Terraform
    if ! command -v terraform &> /dev/null; then
        log_error "Terraform is not installed. Please install it first."
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    log_success "All prerequisites are satisfied"
}

setup_aws_resources() {
    log_info "Setting up AWS resources..."
    
    # Create S3 bucket for Terraform state
    log_info "Creating S3 bucket for Terraform state..."
    aws s3 mb s3://${S3_BUCKET_NAME} --region ${AWS_REGION}
    aws s3api put-bucket-versioning --bucket ${S3_BUCKET_NAME} --versioning-configuration Status=Enabled
    
    # Create DynamoDB table for state locking
    log_info "Creating DynamoDB table for state locking..."
    aws dynamodb create-table \
        --table-name terraform-state-lock \
        --attribute-definitions AttributeName=LockID,AttributeType=S \
        --key-schema AttributeName=LockID,KeyType=HASH \
        --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
        --region ${AWS_REGION} 2>/dev/null || true
    
    log_success "AWS resources created"
}

build_docker_images() {
    log_info "Building Docker images..."
    
    # Build backend image
    log_info "Building backend Docker image..."
    cd backend
    docker build -t ${PROJECT_NAME}-backend:latest .
    cd ..
    
    # Build frontend image
    log_info "Building frontend Docker image..."
    cd frontend
    docker build -t ${PROJECT_NAME}-frontend:latest .
    cd ..
    
    log_success "Docker images built successfully"
}

deploy_infrastructure() {
    log_info "Deploying infrastructure with Terraform..."
    
    cd infrastructure
    
    # Initialize Terraform
    log_info "Initializing Terraform..."
    terraform init \
        -backend-config="bucket=${S3_BUCKET_NAME}" \
        -backend-config="key=terraform.tfstate" \
        -backend-config="region=${AWS_REGION}" \
        -backend-config="dynamodb_table=terraform-state-lock"
    
    # Plan deployment
    log_info "Planning Terraform deployment..."
    terraform plan \
        -var="environment=${ENVIRONMENT}" \
        -var="database_password=${DB_PASSWORD}" \
        -var="aws_region=${AWS_REGION}" \
        -out=tfplan
    
    # Apply deployment
    log_info "Applying Terraform deployment..."
    terraform apply tfplan
    
    # Get outputs
    log_info "Getting deployment outputs..."
    ALB_DNS=$(terraform output -raw alb_dns_name 2>/dev/null || echo "Not available yet")
    RDS_ENDPOINT=$(terraform output -raw rds_endpoint 2>/dev/null || echo "Not available yet")
    S3_BUCKET=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "Not available yet")
    
    cd ..
    
    log_success "Infrastructure deployed successfully"
    log_info "Application Load Balancer: http://${ALB_DNS}"
    log_info "RDS Endpoint: ${RDS_ENDPOINT}"
    log_info "S3 Bucket: ${S3_BUCKET}"
}

deploy_application() {
    log_info "Deploying application to ECS..."
    
    # Get ECS cluster and service names
    CLUSTER_NAME="${ENVIRONMENT}-pipeline-cluster"
    SERVICE_NAME="${ENVIRONMENT}-pipeline-service"
    
    # Update ECS service
    log_info "Updating ECS service..."
    aws ecs update-service \
        --cluster ${CLUSTER_NAME} \
        --service ${SERVICE_NAME} \
        --force-new-deployment \
        --region ${AWS_REGION}
    
    # Wait for service to be stable
    log_info "Waiting for service to be stable..."
    aws ecs wait services-stable \
        --cluster ${CLUSTER_NAME} \
        --services ${SERVICE_NAME} \
        --region ${AWS_REGION}
    
    log_success "Application deployed successfully"
}

setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # Get monitoring URLs
    MONITORING_ALB=$(aws elbv2 describe-load-balancers \
        --names "${ENVIRONMENT}-monitoring-alb" \
        --region ${AWS_REGION} \
        --query 'LoadBalancers[0].DNSName' \
        --output text 2>/dev/null || echo "Not available yet")
    
    log_info "Prometheus: http://${MONITORING_ALB}/prometheus"
    log_info "Grafana: http://${MONITORING_ALB}/grafana (admin/admin)"
    
    log_success "Monitoring setup completed"
}

run_health_checks() {
    log_info "Running health checks..."
    
    # Get ALB DNS name
    ALB_DNS=$(aws elbv2 describe-load-balancers \
        --names "${ENVIRONMENT}-pipeline-alb" \
        --region ${AWS_REGION} \
        --query 'LoadBalancers[0].DNSName' \
        --output text 2>/dev/null || echo "")
    
    if [ -n "${ALB_DNS}" ]; then
        log_info "Checking application health..."
        if curl -f http://${ALB_DNS}/actuator/health > /dev/null 2>&1; then
            log_success "Application is healthy"
        else
            log_warning "Application health check failed"
        fi
    else
        log_warning "ALB DNS name not available yet"
    fi
    
    log_success "Health checks completed"
}

show_deployment_summary() {
    log_info "=== DEPLOYMENT SUMMARY ==="
    log_info "Project: ${PROJECT_NAME}"
    log_info "Environment: ${ENVIRONMENT}"
    log_info "Region: ${AWS_REGION}"
    log_info "Terraform State Bucket: ${S3_BUCKET_NAME}"
    
    # Get outputs
    ALB_DNS=$(aws elbv2 describe-load-balancers \
        --names "${ENVIRONMENT}-pipeline-alb" \
        --region ${AWS_REGION} \
        --query 'LoadBalancers[0].DNSName' \
        --output text 2>/dev/null || echo "Not available yet")
    
    MONITORING_ALB=$(aws elbv2 describe-load-balancers \
        --names "${ENVIRONMENT}-monitoring-alb" \
        --region ${AWS_REGION} \
        --query 'LoadBalancers[0].DNSName' \
        --output text 2>/dev/null || echo "Not available yet")
    
    log_info ""
    log_info "=== ACCESS URLs ==="
    log_info "Application: http://${ALB_DNS}"
    log_info "API Documentation: http://${ALB_DNS}/api/swagger-ui.html"
    log_info "Prometheus: http://${MONITORING_ALB}/prometheus"
    log_info "Grafana: http://${MONITORING_ALB}/grafana (admin/admin)"
    
    log_info ""
    log_info "=== NEXT STEPS ==="
    log_info "1. Access the application at the URLs above"
    log_info "2. Set up monitoring dashboards in Grafana"
    log_info "3. Configure alerts in CloudWatch"
    log_info "4. Test pipeline creation and execution"
    log_info "5. Review security settings and compliance"
    
    log_success "Deployment completed successfully!"
}

cleanup() {
    log_info "Cleaning up temporary files..."
    rm -f infrastructure/tfplan
    log_success "Cleanup completed"
}

show_help() {
    echo "Data Pipeline Management System - AWS Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy      Full deployment (default)"
    echo "  infrastructure  Deploy only infrastructure"
    echo "  application     Deploy only application"
    echo "  monitoring      Setup monitoring"
    echo "  health          Run health checks"
    echo "  cleanup         Clean up temporary files"
    echo "  help           Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  DB_PASSWORD    Database password (required)"
    echo "  AWS_REGION     AWS region (default: us-east-1)"
    echo "  ENVIRONMENT    Environment name (default: production)"
    echo ""
    echo "Example:"
    echo "  DB_PASSWORD=YourSecurePassword123! $0 deploy"
}

# Main script
case "${1:-deploy}" in
    "deploy")
        check_prerequisites
        setup_aws_resources
        build_docker_images
        deploy_infrastructure
        deploy_application
        setup_monitoring
        run_health_checks
        show_deployment_summary
        cleanup
        ;;
    "infrastructure")
        check_prerequisites
        setup_aws_resources
        deploy_infrastructure
        ;;
    "application")
        check_prerequisites
        build_docker_images
        deploy_application
        ;;
    "monitoring")
        setup_monitoring
        ;;
    "health")
        run_health_checks
        ;;
    "cleanup")
        cleanup
        ;;
    "help"|*)
        show_help
        ;;
esac 