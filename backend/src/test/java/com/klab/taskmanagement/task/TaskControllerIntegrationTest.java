package com.klab.taskmanagement.task;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TaskControllerIntegrationTest {
    @Autowired MockMvc mockMvc;
    @Autowired TaskRepository taskRepository;

    @BeforeEach
    void clearTasks() {
        taskRepository.deleteAll();
    }

    @Test
    void createsAndFiltersTasksByStatus() throws Exception {
        String body = "{\"title\":\"Prepare demo\",\"description\":\"Walk through the application\",\"status\":\"PENDING\",\"priority\":\"HIGH\"}";
        mockMvc.perform(post("/tasks").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.priority").value("HIGH"))
                .andExpect(jsonPath("$.createdAt").isNotEmpty());

        mockMvc.perform(get("/tasks").param("status", "PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Prepare demo"));
    }

    @Test
    void rejectsTaskWithBlankTitle() throws Exception {
        String body = "{\"title\":\" \",\"description\":\"Details\",\"status\":\"PENDING\",\"priority\":\"LOW\"}";
        mockMvc.perform(post("/tasks").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Title is required"));
    }

    @Test
    void getsUpdatesAndDeletesATask() throws Exception {
        String createBody = "{\"title\":\"Write README\",\"description\":\"Document setup steps\",\"status\":\"PENDING\",\"priority\":\"MEDIUM\"}";
        MvcResult created = mockMvc.perform(post("/tasks").contentType(MediaType.APPLICATION_JSON).content(createBody))
                .andExpect(status().isCreated())
                .andReturn();

        String id = created.getResponse().getContentAsString().replaceAll(".*\"id\":(\\d+).*", "$1");

        mockMvc.perform(get("/tasks/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Write README"));

        String updateBody = "{\"title\":\"Write README\",\"description\":\"Document setup and decisions\",\"status\":\"COMPLETED\",\"priority\":\"HIGH\"}";
        mockMvc.perform(put("/tasks/" + id).contentType(MediaType.APPLICATION_JSON).content(updateBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.priority").value("HIGH"));

        mockMvc.perform(delete("/tasks/" + id))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/tasks/" + id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Task with id " + id + " was not found"));
    }

    @Test
    void returnsEmptyListWhenNoTasksMatchFilter() throws Exception {
        mockMvc.perform(get("/tasks").param("status", "COMPLETED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }
}
