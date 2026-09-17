package com.klab.taskmanagement.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TaskRequest(
        @NotBlank(message = "Title is required") @Size(max = 120, message = "Title must be at most 120 characters") String title,
        @NotBlank(message = "Description is required") @Size(max = 2000, message = "Description must be at most 2000 characters") String description,
        @NotNull(message = "Status is required") TaskStatus status,
        @NotNull(message = "Priority is required") TaskPriority priority
) { }
