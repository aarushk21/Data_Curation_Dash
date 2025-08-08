package com.datapipeline.model;

/**
 * Enum representing the different scheduling options for pipeline execution.
 */
public enum PipelineSchedule {
    /**
     * Pipeline runs only when manually triggered
     */
    MANUAL("Manual"),
    
    /**
     * Pipeline runs every hour
     */
    HOURLY("Hourly"),
    
    /**
     * Pipeline runs every day at a specified time
     */
    DAILY("Daily"),
    
    /**
     * Pipeline runs every week on a specified day and time
     */
    WEEKLY("Weekly"),
    
    /**
     * Pipeline runs every month on a specified date and time
     */
    MONTHLY("Monthly"),
    
    /**
     * Pipeline runs every 30 minutes
     */
    THIRTY_MINUTES("30 Minutes"),
    
    /**
     * Pipeline runs every 15 minutes
     */
    FIFTEEN_MINUTES("15 Minutes"),
    
    /**
     * Pipeline runs every 5 minutes
     */
    FIVE_MINUTES("5 Minutes"),
    
    /**
     * Pipeline runs based on a custom cron expression
     */
    CUSTOM("Custom");

    private final String displayName;

    PipelineSchedule(String displayName) {
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