package com.klab.taskmanagement.task;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findAllByStatusOrderByCreatedAtDesc(TaskStatus status);
    List<Task> findAllByOrderByCreatedAtDesc();
}
