package com.klab.taskmanagement.task;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/tasks")
@Tag(name = "Tasks", description = "Create, read, update, and delete tasks")
public class TaskController {
    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    @Operation(summary = "List tasks", description = "Returns all tasks, or only those matching PENDING / COMPLETED.")
    public List<Task> getTasks(@RequestParam(required = false) TaskStatus status) {
        return taskService.findAll(status);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get one task")
    public Task getTask(@PathVariable Long id) {
        return taskService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a task")
    public Task createTask(@Valid @RequestBody TaskRequest request) {
        return taskService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a task")
    public Task updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequest request) {
        return taskService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a task")
    public void deleteTask(@PathVariable Long id) {
        taskService.delete(id);
    }
}
