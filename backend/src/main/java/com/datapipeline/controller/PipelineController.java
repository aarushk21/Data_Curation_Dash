package com.datapipeline.controller;

import com.datapipeline.model.Pipeline;
import com.datapipeline.model.PipelineStatus;
import com.datapipeline.service.PipelineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pipelines")
@Tag(name = "Pipeline Management", description = "APIs for managing data pipelines")
public class PipelineController {

    @Autowired
    private PipelineService pipelineService;

    @GetMapping
    @Operation(summary = "Get all pipelines", description = "Retrieve a list of all data pipelines")
    public ResponseEntity<List<Pipeline>> getAllPipelines() {
        List<Pipeline> pipelines = pipelineService.getAllPipelines();
        return ResponseEntity.ok(pipelines);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get pipeline by ID", description = "Retrieve a specific pipeline by its ID")
    public ResponseEntity<Pipeline> getPipelineById(@PathVariable Long id) {
        Pipeline pipeline = pipelineService.getPipelineById(id);
        return ResponseEntity.ok(pipeline);
    }

    @PostMapping
    @Operation(summary = "Create pipeline", description = "Create a new data pipeline")
    public ResponseEntity<Pipeline> createPipeline(@RequestBody Pipeline pipeline) {
        Pipeline createdPipeline = pipelineService.createPipeline(pipeline);
        return ResponseEntity.ok(createdPipeline);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update pipeline", description = "Update an existing pipeline")
    public ResponseEntity<Pipeline> updatePipeline(@PathVariable Long id, @RequestBody Pipeline pipeline) {
        Pipeline updatedPipeline = pipelineService.updatePipeline(id, pipeline);
        return ResponseEntity.ok(updatedPipeline);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete pipeline", description = "Delete a pipeline by ID")
    public ResponseEntity<Void> deletePipeline(@PathVariable Long id) {
        pipelineService.deletePipeline(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/start")
    @Operation(summary = "Start pipeline", description = "Start a pipeline execution")
    public ResponseEntity<PipelineStatus> startPipeline(@PathVariable Long id) {
        PipelineStatus status = pipelineService.startPipeline(id);
        return ResponseEntity.ok(status);
    }

    @PostMapping("/{id}/stop")
    @Operation(summary = "Stop pipeline", description = "Stop a running pipeline")
    public ResponseEntity<PipelineStatus> stopPipeline(@PathVariable Long id) {
        PipelineStatus status = pipelineService.stopPipeline(id);
        return ResponseEntity.ok(status);
    }

    @GetMapping("/{id}/status")
    @Operation(summary = "Get pipeline status", description = "Get the current status of a pipeline")
    public ResponseEntity<PipelineStatus> getPipelineStatus(@PathVariable Long id) {
        PipelineStatus status = pipelineService.getPipelineStatus(id);
        return ResponseEntity.ok(status);
    }
} 