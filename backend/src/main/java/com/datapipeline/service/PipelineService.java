package com.datapipeline.service;

import com.datapipeline.model.Pipeline;
import com.datapipeline.model.PipelineStatus;
import com.datapipeline.repository.PipelineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PipelineService {

    @Autowired
    private PipelineRepository pipelineRepository;

    public List<Pipeline> getAllPipelines() {
        return pipelineRepository.findAll();
    }

    public Pipeline getPipelineById(Long id) {
        Optional<Pipeline> pipeline = pipelineRepository.findById(id);
        if (pipeline.isPresent()) {
            return pipeline.get();
        } else {
            throw new RuntimeException("Pipeline not found with id: " + id);
        }
    }

    public Pipeline createPipeline(Pipeline pipeline) {
        pipeline.setCreatedAt(LocalDateTime.now());
        pipeline.setUpdatedAt(LocalDateTime.now());
        pipeline.setStatus(PipelineStatus.CREATED);
        return pipelineRepository.save(pipeline);
    }

    public Pipeline updatePipeline(Long id, Pipeline pipelineDetails) {
        Pipeline pipeline = getPipelineById(id);
        
        pipeline.setName(pipelineDetails.getName());
        pipeline.setDescription(pipelineDetails.getDescription());
        pipeline.setConfiguration(pipelineDetails.getConfiguration());
        pipeline.setSchedule(pipelineDetails.getSchedule());
        pipeline.setUpdatedAt(LocalDateTime.now());
        
        return pipelineRepository.save(pipeline);
    }

    public void deletePipeline(Long id) {
        Pipeline pipeline = getPipelineById(id);
        pipelineRepository.delete(pipeline);
    }

    public PipelineStatus startPipeline(Long id) {
        Pipeline pipeline = getPipelineById(id);
        pipeline.setStatus(PipelineStatus.RUNNING);
        pipeline.setStartedAt(LocalDateTime.now());
        pipeline.setUpdatedAt(LocalDateTime.now());
        pipelineRepository.save(pipeline);
        
        // TODO: Implement actual pipeline execution logic
        // This would involve calling Apache Airflow or other orchestration tools
        
        return pipeline.getStatus();
    }

    public PipelineStatus stopPipeline(Long id) {
        Pipeline pipeline = getPipelineById(id);
        pipeline.setStatus(PipelineStatus.STOPPED);
        pipeline.setStoppedAt(LocalDateTime.now());
        pipeline.setUpdatedAt(LocalDateTime.now());
        pipelineRepository.save(pipeline);
        
        // TODO: Implement actual pipeline stopping logic
        
        return pipeline.getStatus();
    }

    public PipelineStatus getPipelineStatus(Long id) {
        Pipeline pipeline = getPipelineById(id);
        return pipeline.getStatus();
    }
} 