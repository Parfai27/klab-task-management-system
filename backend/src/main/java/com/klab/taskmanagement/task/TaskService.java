package com.klab.taskmanagement.task;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TaskService {
    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> findAll(TaskStatus status) {
        return status == null ? taskRepository.findAllByOrderByCreatedAtDesc()
                : taskRepository.findAllByStatusOrderByCreatedAtDesc(status);
    }

    public Task findById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
    }

    public Task create(TaskRequest request) {
        return taskRepository.save(new Task(clean(request.title()), clean(request.description()), request.status(), request.priority()));
    }

    public Task update(Long id, TaskRequest request) {
        Task task = findById(id);
        task.update(clean(request.title()), clean(request.description()), request.status(), request.priority());
        return taskRepository.save(task);
    }

    public void delete(Long id) {
        taskRepository.delete(findById(id));
    }

    private String clean(String value) { return value.trim(); }
}
