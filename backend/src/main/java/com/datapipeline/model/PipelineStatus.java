package com.datapipeline.model;

/**
 * Enum representing the different statuses a pipeline can have.
 */
public enum PipelineStatus {
    /**
     * Pipeline is in draft mode and not yet ready for execution
     */
    DRAFT("Draft"),
    
    /**
     * Pipeline is active and can be executed
     */
    ACTIVE("Active"),
    
    /**
     * Pipeline execution is currently running
     */
    RUNNING("Running"),
    
    /**
     * Pipeline execution has completed successfully
     */
    COMPLETED("Completed"),
    
    /**
     * Pipeline execution has failed
     */
    FAILED("Failed"),
    
    /**
     * Pipeline is paused and will not execute
     */
    PAUSED("Paused"),
    
    /**
     * Pipeline is deprecated and should not be used
     */
    DEPRECATED("Deprecated");

    private final String displayName;

    PipelineStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }
} 