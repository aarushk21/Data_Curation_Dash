package com.datapipeline.repository;

import com.datapipeline.model.Pipeline;
import com.datapipeline.model.PipelineStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PipelineRepository extends JpaRepository<Pipeline, Long> {
    
    List<Pipeline> findByStatus(PipelineStatus status);
    
    List<Pipeline> findByNameContainingIgnoreCase(String name);
    
    @Query("SELECT p FROM Pipeline p WHERE p.status = :status AND p.createdAt >= :since")
    List<Pipeline> findActivePipelinesSince(@Param("status") PipelineStatus status, @Param("since") java.time.LocalDateTime since);
    
    @Query("SELECT COUNT(p) FROM Pipeline p WHERE p.status = :status")
    long countByStatus(@Param("status") PipelineStatus status);
} 