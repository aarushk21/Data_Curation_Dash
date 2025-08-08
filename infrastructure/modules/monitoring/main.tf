# Monitoring Module for Data Pipeline Management System

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs"
  type        = list(string)
}

variable "prometheus_image" {
  description = "Prometheus Docker image"
  type        = string
  default     = "prom/prometheus:latest"
}

variable "grafana_image" {
  description = "Grafana Docker image"
  type        = string
  default     = "grafana/grafana:latest"
}

# ECS Cluster for Monitoring
resource "aws_ecs_cluster" "monitoring" {
  name = "${var.environment}-monitoring-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name        = "${var.environment}-monitoring-cluster"
    Environment = var.environment
  }
}

# Prometheus Task Definition
resource "aws_ecs_task_definition" "prometheus" {
  family                   = "${var.environment}-prometheus-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.monitoring_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "prometheus"
      image = var.prometheus_image

      portMappings = [
        {
          containerPort = 9090
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "PROMETHEUS_CONFIG"
          value = "/etc/prometheus/prometheus.yml"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.prometheus.name
          awslogs-region        = data.aws_region.current.name
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])

  tags = {
    Name        = "${var.environment}-prometheus-task"
    Environment = var.environment
  }
}

# Grafana Task Definition
resource "aws_ecs_task_definition" "grafana" {
  family                   = "${var.environment}-grafana-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.monitoring_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "grafana"
      image = var.grafana_image

      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "GF_SECURITY_ADMIN_PASSWORD"
          value = "admin"
        },
        {
          name  = "GF_USERS_ALLOW_SIGN_UP"
          value = "false"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.grafana.name
          awslogs-region        = data.aws_region.current.name
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])

  tags = {
    Name        = "${var.environment}-grafana-task"
    Environment = var.environment
  }
}

# Prometheus Service
resource "aws_ecs_service" "prometheus" {
  name            = "${var.environment}-prometheus-service"
  cluster         = aws_ecs_cluster.monitoring.id
  task_definition = aws_ecs_task_definition.prometheus.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.monitoring.id]
    subnets          = var.subnet_ids
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.prometheus.arn
    container_name   = "prometheus"
    container_port   = 9090
  }

  depends_on = [aws_lb_listener.monitoring]

  tags = {
    Name        = "${var.environment}-prometheus-service"
    Environment = var.environment
  }
}

# Grafana Service
resource "aws_ecs_service" "grafana" {
  name            = "${var.environment}-grafana-service"
  cluster         = aws_ecs_cluster.monitoring.id
  task_definition = aws_ecs_task_definition.grafana.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.monitoring.id]
    subnets          = var.subnet_ids
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.grafana.arn
    container_name   = "grafana"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.monitoring]

  tags = {
    Name        = "${var.environment}-grafana-service"
    Environment = var.environment
  }
}

# Application Load Balancer for Monitoring
resource "aws_lb" "monitoring" {
  name               = "${var.environment}-monitoring-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.monitoring_alb.id]
  subnets            = var.subnet_ids

  enable_deletion_protection = false

  tags = {
    Name        = "${var.environment}-monitoring-alb"
    Environment = var.environment
  }
}

# ALB Target Groups
resource "aws_lb_target_group" "prometheus" {
  name        = "${var.environment}-prometheus-tg"
  port        = 9090
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 10
    timeout             = 5
    interval            = 30
    path                = "/-/healthy"
    matcher             = "200"
  }

  tags = {
    Name        = "${var.environment}-prometheus-tg"
    Environment = var.environment
  }
}

resource "aws_lb_target_group" "grafana" {
  name        = "${var.environment}-grafana-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 10
    timeout             = 5
    interval            = 30
    path                = "/api/health"
    matcher             = "200"
  }

  tags = {
    Name        = "${var.environment}-grafana-tg"
    Environment = var.environment
  }
}

# ALB Listener Rules
resource "aws_lb_listener" "monitoring" {
  load_balancer_arn = aws_lb.monitoring.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "Not Found"
      status_code  = "404"
    }
  }
}

resource "aws_lb_listener_rule" "prometheus" {
  listener_arn = aws_lb_listener.monitoring.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.prometheus.arn
  }

  condition {
    path_pattern {
      values = ["/prometheus", "/prometheus/*"]
    }
  }
}

resource "aws_lb_listener_rule" "grafana" {
  listener_arn = aws_lb_listener.monitoring.arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.grafana.arn
  }

  condition {
    path_pattern {
      values = ["/grafana", "/grafana/*"]
    }
  }
}

# Security Groups
resource "aws_security_group" "monitoring_alb" {
  name        = "${var.environment}-monitoring-alb-sg"
  description = "Security group for monitoring ALB"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.environment}-monitoring-alb-sg"
    Environment = var.environment
  }
}

resource "aws_security_group" "monitoring" {
  name        = "${var.environment}-monitoring-sg"
  description = "Security group for monitoring services"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 9090
    to_port         = 9090
    protocol        = "tcp"
    security_groups = [aws_security_group.monitoring_alb.id]
  }

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.monitoring_alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.environment}-monitoring-sg"
    Environment = var.environment
  }
}

# IAM Roles
resource "aws_iam_role" "monitoring_execution_role" {
  name = "${var.environment}-monitoring-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "monitoring_execution_role_policy" {
  role       = aws_iam_role.monitoring_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "prometheus" {
  name              = "/ecs/${var.environment}-prometheus"
  retention_in_days = 30

  tags = {
    Name        = "${var.environment}-prometheus-logs"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "grafana" {
  name              = "/ecs/${var.environment}-grafana"
  retention_in_days = 30

  tags = {
    Name        = "${var.environment}-grafana-logs"
    Environment = var.environment
  }
}

# Data source for current region
data "aws_region" "current" {}

# Outputs
output "prometheus_url" {
  description = "The URL of the Prometheus server"
  value       = "http://${aws_lb.monitoring.dns_name}/prometheus"
}

output "grafana_url" {
  description = "The URL of the Grafana dashboard"
  value       = "http://${aws_lb.monitoring.dns_name}/grafana"
}

output "monitoring_alb_dns_name" {
  description = "The DNS name of the monitoring load balancer"
  value       = aws_lb.monitoring.dns_name
} 