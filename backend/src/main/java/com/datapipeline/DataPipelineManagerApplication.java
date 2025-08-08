package com.datapipeline;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main Spring Boot application class for the Data Pipeline Management System.
 * 
 * This application provides:
 * - RESTful APIs for pipeline management
 * - Schema validation and data quality checks
 * - Integration with Apache Airflow for orchestration
 * - Apache Spark for data processing
 * - Prometheus metrics for monitoring
 * - AWS integration for cloud deployment
 */
@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableScheduling
public class DataPipelineManagerApplication {

    public static void main(String[] args) {
        SpringApplication.run(DataPipelineManagerApplication.class, args);
    }
} 