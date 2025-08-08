# Data Pipeline Management System - Quick Start Guide

This guide will help you get the Data Pipeline Management System up and running quickly.

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (v20.10+) and **Docker Compose** (v2.0+)
- **Node.js** (v18+) and **npm**
- **Java** (v17+) and **Maven** (v3.8+)
- **Git**

## 📋 System Requirements

- **RAM**: Minimum 8GB, Recommended 16GB
- **Storage**: At least 10GB free space
- **CPU**: 4 cores minimum, 8 cores recommended

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Data_Curation_Dash
```

### 2. Quick Start (Recommended)

The easiest way to get started is using our automated deployment script:

```bash
# Make the script executable (if not already done)
chmod +x deploy.sh

# Deploy to local environment
./deploy.sh deploy local
```

This will:
- Build the frontend and backend
- Start all services (PostgreSQL, Redis, Airflow, Prometheus, Grafana)
- Run health checks
- Provide access URLs

### 3. Manual Setup (Alternative)

If you prefer to set up components individually:

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

#### Backend Setup
```bash
cd backend
mvn spring-boot:run
```

#### Database Setup
```bash
# Using Docker
docker run --name pipeline-postgres \
  -e POSTGRES_DB=pipeline_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15
```

## 🌐 Access URLs

Once deployed, you can access the following services:

| Service | URL | Default Credentials |
|---------|-----|-------------------|
| **Frontend** | http://localhost:3000 | - |
| **Backend API** | http://localhost:8080/api | admin/admin123 |
| **API Documentation** | http://localhost:8080/api/swagger-ui.html | - |
| **Airflow** | http://localhost:8081 | airflow/airflow |
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3000 | admin/admin |
| **PostgreSQL** | localhost:5432 | postgres/password |

## 📊 Key Features

### 1. Pipeline Management
- **Visual Pipeline Builder**: Drag-and-drop interface for creating data pipelines
- **Schema Validation**: JSON Schema validation for data quality
- **Transformation Logic**: Built-in data transformation capabilities
- **Quality Checks**: Automated data quality monitoring

### 2. Monitoring & Observability
- **Real-time Metrics**: Prometheus integration for system metrics
- **Custom Dashboards**: Grafana dashboards for pipeline monitoring
- **Health Checks**: Automated health monitoring for all services
- **Alerting**: Configurable alerts for pipeline failures

### 3. Data Quality
- **Schema Management**: Visual schema editor with JSON Schema support
- **Quality Rules**: Customizable data quality rules
- **Validation Engine**: Real-time data validation
- **Quality Metrics**: Comprehensive quality scoring

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DB_USERNAME=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432

# AWS (for production)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Application
SPRING_PROFILES_ACTIVE=development
SERVER_PORT=8080
```

### Customizing the Application

#### Frontend Configuration
Edit `frontend/src/config/config.js`:
```javascript
export const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  environment: process.env.NODE_ENV || 'development'
};
```

#### Backend Configuration
Edit `backend/src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
```

## 🚀 Deployment Options

### Local Development
```bash
./deploy.sh deploy local
```

### AWS Production
```bash
# Set AWS credentials
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export DB_PASSWORD=your-secure-password

# Deploy to AWS
./deploy.sh deploy aws production
```

### Docker Only
```bash
docker-compose -f docker/docker-compose.yml up -d
```

## 📈 Monitoring Setup

### Prometheus Configuration
The system includes pre-configured Prometheus metrics for:
- Application performance
- Pipeline execution metrics
- System resource usage
- Database performance

### Grafana Dashboards
Pre-built dashboards include:
- **Pipeline Overview**: High-level pipeline metrics
- **System Health**: Infrastructure monitoring
- **Data Quality**: Quality check results
- **Performance**: Response times and throughput

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Conflicts
If you get port conflicts, check what's running on the required ports:
```bash
# Check ports in use
lsof -i :3000  # Frontend
lsof -i :8080  # Backend
lsof -i :5432  # Database
```

#### 2. Docker Issues
```bash
# Clean up Docker resources
docker system prune -a
docker volume prune

# Restart Docker services
docker-compose -f docker/docker-compose.yml down
docker-compose -f docker/docker-compose.yml up -d
```

#### 3. Database Connection Issues
```bash
# Check database status
docker exec pipeline-postgres pg_isready -U postgres

# Reset database
docker-compose -f docker/docker-compose.yml down -v
docker-compose -f docker/docker-compose.yml up -d
```

### Health Checks
```bash
# Check all services
./deploy.sh health

# Check individual services
curl http://localhost:8080/api/actuator/health
curl http://localhost:3000
curl http://localhost:9090/-/healthy
```

## 🧪 Testing

### Run All Tests
```bash
./deploy.sh test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
mvn test
```

## 📚 Next Steps

1. **Explore the UI**: Navigate to http://localhost:3000 and explore the dashboard
2. **Create Your First Pipeline**: Use the visual pipeline builder to create a data pipeline
3. **Set Up Monitoring**: Configure alerts and dashboards in Grafana
4. **Customize Schemas**: Create custom JSON schemas for your data validation
5. **Deploy to Production**: Use the AWS deployment option for production use

## 🤝 Support

- **Documentation**: Check the `/docs` directory for detailed documentation
- **Issues**: Report bugs and feature requests in the GitHub issues
- **Community**: Join our community discussions

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy Data Pipeline Management! 🎉** 