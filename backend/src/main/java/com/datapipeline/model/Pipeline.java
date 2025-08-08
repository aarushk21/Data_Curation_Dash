package com.datapipeline.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a data pipeline in the system.
 * 
 * A pipeline consists of multiple nodes (data sources, transformations, sinks)
 * connected by edges, and can be scheduled for execution.
 */
@Entity
@Table(name = "pipelines")
public class Pipeline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Pipeline name is required")
    @Size(max = 255, message = "Pipeline name must be less than 255 characters")
    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Size(max = 1000, message = "Description must be less than 1000 characters")
    @Column(name = "description", length = 1000)
    private String description;

    @NotNull(message = "Pipeline status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PipelineStatus status = PipelineStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "schedule")
    private PipelineSchedule schedule = PipelineSchedule.MANUAL;

    @Column(name = "cron_expression")
    private String cronExpression;

    @Column(name = "max_retries")
    private Integer maxRetries = 3;

    @Column(name = "timeout_seconds")
    private Integer timeoutSeconds = 3600;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_run")
    private LocalDateTime lastRun;

    @Column(name = "next_run")
    private LocalDateTime nextRun;

    @Column(name = "success_rate")
    private Double successRate = 0.0;

    @Column(name = "avg_duration_seconds")
    private Long avgDurationSeconds = 0L;

    @Column(name = "total_runs")
    private Long totalRuns = 0L;

    @Column(name = "successful_runs")
    private Long successfulRuns = 0L;

    @Column(name = "failed_runs")
    private Long failedRuns = 0L;

    @Column(name = "owner")
    private String owner;

    @Column(name = "version")
    private String version = "1.0.0";

    @Column(name = "is_active")
    private Boolean isActive = true;

    // Pipeline configuration as JSON
    @Column(name = "configuration", columnDefinition = "TEXT")
    private String configuration;

    // Relationships
    @OneToMany(mappedBy = "pipeline", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PipelineNode> nodes = new ArrayList<>();

    @OneToMany(mappedBy = "pipeline", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PipelineEdge> edges = new ArrayList<>();

    @OneToMany(mappedBy = "pipeline", cascade = CascadeType.ALL)
    private List<PipelineExecution> executions = new ArrayList<>();

    @OneToMany(mappedBy = "pipeline", cascade = CascadeType.ALL)
    private List<QualityCheck> qualityChecks = new ArrayList<>();

    // JPA Lifecycle methods
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Pipeline() {}

    public Pipeline(String name, String description) {
        this.name = name;
        this.description = description;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public PipelineStatus getStatus() {
        return status;
    }

    public void setStatus(PipelineStatus status) {
        this.status = status;
    }

    public PipelineSchedule getSchedule() {
        return schedule;
    }

    public void setSchedule(PipelineSchedule schedule) {
        this.schedule = schedule;
    }

    public String getCronExpression() {
        return cronExpression;
    }

    public void setCronExpression(String cronExpression) {
        this.cronExpression = cronExpression;
    }

    public Integer getMaxRetries() {
        return maxRetries;
    }

    public void setMaxRetries(Integer maxRetries) {
        this.maxRetries = maxRetries;
    }

    public Integer getTimeoutSeconds() {
        return timeoutSeconds;
    }

    public void setTimeoutSeconds(Integer timeoutSeconds) {
        this.timeoutSeconds = timeoutSeconds;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getLastRun() {
        return lastRun;
    }

    public void setLastRun(LocalDateTime lastRun) {
        this.lastRun = lastRun;
    }

    public LocalDateTime getNextRun() {
        return nextRun;
    }

    public void setNextRun(LocalDateTime nextRun) {
        this.nextRun = nextRun;
    }

    public Double getSuccessRate() {
        return successRate;
    }

    public void setSuccessRate(Double successRate) {
        this.successRate = successRate;
    }

    public Long getAvgDurationSeconds() {
        return avgDurationSeconds;
    }

    public void setAvgDurationSeconds(Long avgDurationSeconds) {
        this.avgDurationSeconds = avgDurationSeconds;
    }

    public Long getTotalRuns() {
        return totalRuns;
    }

    public void setTotalRuns(Long totalRuns) {
        this.totalRuns = totalRuns;
    }

    public Long getSuccessfulRuns() {
        return successfulRuns;
    }

    public void setSuccessfulRuns(Long successfulRuns) {
        this.successfulRuns = successfulRuns;
    }

    public Long getFailedRuns() {
        return failedRuns;
    }

    public void setFailedRuns(Long failedRuns) {
        this.failedRuns = failedRuns;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getConfiguration() {
        return configuration;
    }

    public void setConfiguration(String configuration) {
        this.configuration = configuration;
    }

    public List<PipelineNode> getNodes() {
        return nodes;
    }

    public void setNodes(List<PipelineNode> nodes) {
        this.nodes = nodes;
    }

    public List<PipelineEdge> getEdges() {
        return edges;
    }

    public void setEdges(List<PipelineEdge> edges) {
        this.edges = edges;
    }

    public List<PipelineExecution> getExecutions() {
        return executions;
    }

    public void setExecutions(List<PipelineExecution> executions) {
        this.executions = executions;
    }

    public List<QualityCheck> getQualityChecks() {
        return qualityChecks;
    }

    public void setQualityChecks(List<QualityCheck> qualityChecks) {
        this.qualityChecks = qualityChecks;
    }

    // Helper methods
    public void addNode(PipelineNode node) {
        nodes.add(node);
        node.setPipeline(this);
    }

    public void removeNode(PipelineNode node) {
        nodes.remove(node);
        node.setPipeline(null);
    }

    public void addEdge(PipelineEdge edge) {
        edges.add(edge);
        edge.setPipeline(this);
    }

    public void removeEdge(PipelineEdge edge) {
        edges.remove(edge);
        edge.setPipeline(null);
    }

    public void updateSuccessRate() {
        if (totalRuns > 0) {
            this.successRate = (double) successfulRuns / totalRuns * 100;
        }
    }

    @Override
    public String toString() {
        return "Pipeline{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", status=" + status +
                ", schedule=" + schedule +
                ", successRate=" + successRate +
                ", totalRuns=" + totalRuns +
                '}';
    }
} 