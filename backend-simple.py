#!/usr/bin/env python3
"""
Simple Data Pipeline Management System Backend
This is a demonstration backend that simulates the Spring Boot API
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import time
from datetime import datetime, timedelta
import random

app = Flask(__name__)
CORS(app)

# Mock data storage
pipelines = [
    {
        "id": 1,
        "name": "Customer Data ETL",
        "description": "ETL pipeline for customer data processing",
        "status": "active",
        "lastRun": "2024-01-15 10:30:00",
        "nextRun": "2024-01-15 11:30:00",
        "successRate": 95,
        "avgDuration": "2m 15s",
        "schedule": "hourly",
        "owner": "admin",
        "createdAt": "2024-01-01"
    },
    {
        "id": 2,
        "name": "Sales Analytics",
        "description": "Analytics pipeline for sales data",
        "status": "paused",
        "lastRun": "2024-01-15 09:00:00",
        "nextRun": "2024-01-16 09:00:00",
        "successRate": 88,
        "avgDuration": "5m 30s",
        "schedule": "daily",
        "owner": "analytics-team",
        "createdAt": "2024-01-05"
    }
]

schemas = [
    {
        "id": 1,
        "name": "Customer Schema",
        "version": "1.0.0",
        "description": "Schema for customer data validation",
        "status": "active",
        "fields": 15,
        "lastUpdated": "2024-01-15 10:30:00",
        "owner": "admin"
    }
]

quality_checks = [
    {
        "id": 1,
        "name": "Customer Email Validation",
        "description": "Validates customer email format and uniqueness",
        "type": "completeness",
        "status": "active",
        "threshold": 95,
        "currentScore": 98,
        "lastRun": "2024-01-15 10:30:00",
        "owner": "admin"
    }
]

@app.route('/api/actuator/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "UP",
        "components": {
            "database": {"status": "UP"},
            "redis": {"status": "UP"},
            "diskSpace": {"status": "UP"}
        }
    })

@app.route('/api/pipelines')
def get_pipelines():
    """Get all pipelines"""
    return jsonify(pipelines)

@app.route('/api/pipelines/<int:pipeline_id>')
def get_pipeline(pipeline_id):
    """Get a specific pipeline"""
    pipeline = next((p for p in pipelines if p["id"] == pipeline_id), None)
    if pipeline:
        return jsonify(pipeline)
    return jsonify({"error": "Pipeline not found"}), 404

@app.route('/api/pipelines', methods=['POST'])
def create_pipeline():
    """Create a new pipeline"""
    data = request.get_json()
    new_pipeline = {
        "id": len(pipelines) + 1,
        "name": data.get("name", "New Pipeline"),
        "description": data.get("description", ""),
        "status": "draft",
        "lastRun": None,
        "nextRun": None,
        "successRate": 0,
        "avgDuration": "0s",
        "schedule": "manual",
        "owner": "admin",
        "createdAt": datetime.now().strftime("%Y-%m-%d")
    }
    pipelines.append(new_pipeline)
    return jsonify(new_pipeline), 201

@app.route('/api/schemas')
def get_schemas():
    """Get all schemas"""
    return jsonify(schemas)

@app.route('/api/quality-checks')
def get_quality_checks():
    """Get all quality checks"""
    return jsonify(quality_checks)

@app.route('/api/metrics/pipeline')
def get_pipeline_metrics():
    """Get pipeline metrics for Prometheus"""
    metrics = {
        "pipeline_executions_total": len(pipelines),
        "pipeline_success_rate": sum(p["successRate"] for p in pipelines) / len(pipelines) if pipelines else 0,
        "active_pipelines": len([p for p in pipelines if p["status"] == "active"]),
        "failed_pipelines": len([p for p in pipelines if p["status"] == "failed"])
    }
    return jsonify(metrics)

@app.route('/api/dashboard/stats')
def get_dashboard_stats():
    """Get dashboard statistics"""
    return jsonify({
        "totalPipelines": len(pipelines),
        "activePipelines": len([p for p in pipelines if p["status"] == "active"]),
        "failedPipelines": len([p for p in pipelines if p["status"] == "failed"]),
        "pendingPipelines": len([p for p in pipelines if p["status"] == "draft"]),
        "successRate": sum(p["successRate"] for p in pipelines) / len(pipelines) if pipelines else 0,
        "avgExecutionTime": "2m 15s"
    })

@app.route('/api/executions/recent')
def get_recent_executions():
    """Get recent pipeline executions"""
    executions = []
    for pipeline in pipelines:
        if pipeline["lastRun"]:
            executions.append({
                "id": pipeline["id"],
                "pipelineName": pipeline["name"],
                "status": pipeline["status"],
                "startTime": pipeline["lastRun"],
                "endTime": (datetime.strptime(pipeline["lastRun"], "%Y-%m-%d %H:%M:%S") + timedelta(minutes=2)).strftime("%Y-%m-%d %H:%M:%S"),
                "duration": pipeline["avgDuration"],
                "recordsProcessed": random.randint(1000, 100000)
            })
    return jsonify(executions)

@app.route('/api/quality/trends')
def get_quality_trends():
    """Get quality trends data"""
    trends = []
    for i in range(7):
        date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
        trends.append({
            "date": date,
            "completeness": random.randint(90, 100),
            "accuracy": random.randint(85, 95),
            "consistency": random.randint(88, 98)
        })
    return jsonify(trends)

@app.route('/api/system/metrics')
def get_system_metrics():
    """Get system metrics"""
    return jsonify({
        "cpuUsage": random.randint(20, 80),
        "memoryUsage": random.randint(40, 90),
        "diskUsage": random.randint(10, 50),
        "networkThroughput": random.randint(100, 200),
        "activeConnections": random.randint(50, 300),
        "errorRate": random.uniform(0, 2),
        "responseTime": random.randint(100, 500),
        "throughput": random.randint(1000, 2000)
    })

@app.route('/api/alerts')
def get_alerts():
    """Get system alerts"""
    alerts = [
        {
            "id": 1,
            "severity": "warning",
            "message": "Memory usage approaching threshold",
            "timestamp": "2024-01-15 10:25:00",
            "status": "active"
        },
        {
            "id": 2,
            "severity": "info",
            "message": "Pipeline 'Inventory Sync' completed with warnings",
            "timestamp": "2024-01-15 10:20:00",
            "status": "resolved"
        }
    ]
    return jsonify(alerts)

@app.route('/')
def index():
    """API documentation"""
    return jsonify({
        "message": "Data Pipeline Management System API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/api/actuator/health",
            "pipelines": "/api/pipelines",
            "schemas": "/api/schemas",
            "quality-checks": "/api/quality-checks",
            "metrics": "/api/metrics/pipeline",
            "dashboard": "/api/dashboard/stats",
            "executions": "/api/executions/recent",
            "quality-trends": "/api/quality/trends",
            "system-metrics": "/api/system/metrics",
            "alerts": "/api/alerts"
        }
    })

if __name__ == '__main__':
    print("🚀 Starting Data Pipeline Management System Backend...")
    print("📊 API Documentation: http://localhost:8080")
    print("🔧 Health Check: http://localhost:8080/api/actuator/health")
    print("📈 Dashboard Stats: http://localhost:8080/api/dashboard/stats")
    print("")
    app.run(host='0.0.0.0', port=8080, debug=True) 