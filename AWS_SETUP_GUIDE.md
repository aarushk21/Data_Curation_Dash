# 🚀 Quick AWS Deployment Guide

## **Step-by-Step Process to Deploy Your Data Pipeline Management System**

### **Prerequisites Checklist**
- [x] **AWS CLI** installed ✅
- [x] **Terraform** installed ✅
- [x] **Docker** installed ✅
- [ ] **AWS Account** with billing enabled
- [ ] **AWS Credentials** configured

---

## **Step 1: AWS Account Setup**

### 1.1 Create AWS Account (if you don't have one)
1. Go to [AWS Console](https://aws.amazon.com/)
2. Click "Create an AWS Account"
3. Follow the signup process
4. **Important**: Add a credit card for billing (you'll get free tier benefits)

### 1.2 Create IAM User
1. Go to AWS Console → **IAM**
2. Click "Users" → "Create user"
3. Name: `data-pipeline-admin`
4. Select "Attach policies directly"
5. Choose **"AdministratorAccess"** (for initial setup)
6. Click "Create user"
7. **Save the Access Key ID and Secret Access Key**

### 1.3 Configure AWS CLI
```bash
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Enter region: us-east-1
# Enter output format: json
```

**Test your configuration:**
```bash
aws sts get-caller-identity
```

---

## **Step 2: Deploy to AWS**

### 2.1 Set Database Password
```bash
export DB_PASSWORD="YourSecurePassword123!"
```

### 2.2 Run Full Deployment
```bash
./deploy-to-aws.sh deploy
```

**This will:**
- ✅ Create S3 bucket for Terraform state
- ✅ Deploy complete infrastructure (VPC, RDS, ECS, ALB, S3, CloudWatch)
- ✅ Build and deploy Docker images
- ✅ Set up monitoring (Prometheus, Grafana)
- ✅ Run health checks
- ✅ Provide access URLs

---

## **Step 3: Access Your Application**

After deployment, you'll get URLs like:
- **Application**: `http://your-alb-dns-name`
- **API Docs**: `http://your-alb-dns-name/api/swagger-ui.html`
- **Prometheus**: `http://your-monitoring-alb/prometheus`
- **Grafana**: `http://your-monitoring-alb/grafana` (admin/admin)

---

## **Step 4: Verify Everything Works**

### 4.1 Check Application Health
```bash
./deploy-to-aws.sh health
```

### 4.2 Access Monitoring
1. Open Grafana URL
2. Login with `admin/admin`
3. Add Prometheus as data source
4. Import dashboards

### 4.3 Test API Endpoints
```bash
# Test health endpoint
curl http://your-alb-dns-name/actuator/health

# Test API endpoints
curl http://your-alb-dns-name/api/pipelines
```

---

## **Step 5: Next Steps**

### 5.1 Complete Backend Implementation
- [ ] Implement authentication service
- [ ] Complete pipeline execution engine
- [ ] Add data quality validation
- [ ] Integrate with Apache Airflow

### 5.2 Complete Frontend Implementation
- [ ] Build pipeline visualization UI
- [ ] Create monitoring dashboards
- [ ] Add user authentication
- [ ] Implement settings pages

### 5.3 Security Hardening
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up proper IAM roles (least privilege)
- [ ] Enable CloudTrail logging
- [ ] Configure security groups properly

### 5.4 Monitoring & Alerting
- [ ] Set up CloudWatch alarms
- [ ] Configure Grafana dashboards
- [ ] Set up log aggregation
- [ ] Create operational runbooks

---

## **Cost Estimation**

### Monthly Costs (us-east-1)
- **RDS PostgreSQL**: ~$25-50/month
- **ECS Fargate**: ~$30-60/month
- **Application Load Balancer**: ~$20/month
- **S3 Storage**: ~$5-10/month
- **CloudWatch**: ~$10-20/month
- **Data Transfer**: ~$5-15/month

**Total Estimated Cost**: ~$95-175/month

*Note: Costs vary based on usage and instance sizes*

---

## **Troubleshooting**

### Common Issues

#### 1. AWS Credentials Error
```bash
aws configure
# Re-enter your credentials
```

#### 2. Terraform State Error
```bash
cd infrastructure
terraform init -reconfigure
```

#### 3. Docker Build Issues
```bash
# Check Docker is running
docker info

# Try building manually
cd backend && docker build -t test .
```

#### 4. ECS Service Issues
```bash
# Check service status
aws ecs describe-services --cluster production-pipeline-cluster --services production-pipeline-service

# Check logs
aws logs describe-log-groups --log-group-name-prefix "/ecs/"
```

---

## **Cleanup (When Done)**

### Remove All Resources
```bash
cd infrastructure
terraform destroy -auto-approve

# Remove S3 bucket manually
aws s3 rb s3://your-terraform-state-bucket --force
```

---

## **Support**

If you encounter issues:
1. Check the logs in CloudWatch
2. Review the troubleshooting section above
3. Check AWS service limits and quotas
4. Ensure your AWS account has sufficient permissions

---

**🎉 You're ready to deploy your Data Pipeline Management System to AWS!**

Just follow the steps above and you'll have a production-ready application running in the cloud with full monitoring and scalability. 