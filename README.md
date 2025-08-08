# Data Pipeline Management System

A comprehensive data pipeline management platform built with React frontend, Java Spring Boot backend, and AWS infrastructure with Prometheus monitoring.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React UI      │    │  Spring Boot    │    │   AWS Services  │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Infra)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Pipeline      │    │   Data          │    │   Prometheus    │
│   Visualization  │    │   Processing    │    │   Monitoring    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Features

### Frontend (React)
- **Pipeline Visualization**: Interactive DAG diagrams for data pipelines
- **Schema Management**: Visual schema editor and validation
- **Transformation Builder**: Drag-and-drop transformation logic
- **Quality Monitoring**: Real-time data quality dashboards
- **Deployment Management**: One-click pipeline deployment

### Backend (Java Spring Boot)
- **Pipeline Orchestration**: Apache Airflow integration
- **Schema Validation**: JSON Schema and custom validation rules
- **Data Transformation**: Apache Spark integration for ETL
- **Quality Checks**: Automated data quality validation
- **API Management**: RESTful APIs for pipeline operations

### Infrastructure (AWS)
- **ECS/Fargate**: Containerized application deployment
- **RDS**: PostgreSQL for metadata storage
- **S3**: Data lake storage
- **CloudWatch**: Logging and basic monitoring
- **ALB**: Load balancing

### Monitoring (Prometheus)
- **System Metrics**: CPU, memory, disk usage
- **Application Metrics**: API response times, error rates
- **Pipeline Metrics**: Execution times, success rates
- **Grafana Dashboards**: Custom visualization dashboards

## Project Structure

```
Data_Curation_Dash/
├── frontend/                 # React application
├── backend/                  # Java Spring Boot application
├── infrastructure/           # Terraform configurations
├── monitoring/              # Prometheus and Grafana configs
├── docker/                  # Docker configurations
└── docs/                    # Documentation
```

## Quick Start

### Prerequisites
- Node.js 18+
- Java 17+
- Docker
- AWS CLI configured
- Terraform

### Local Development

1. **Start Backend**:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Deploy Infrastructure**:
   ```bash
   cd infrastructure
   terraform init
   terraform plan
   terraform apply
   ```

## API Documentation

The backend provides RESTful APIs for:
- Pipeline CRUD operations
- Schema validation
- Data transformation
- Quality checks
- Monitoring metrics

API documentation is available at `http://localhost:8080/swagger-ui.html` when running locally.

## Monitoring

Access monitoring dashboards:
- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3000` (admin/admin)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details 