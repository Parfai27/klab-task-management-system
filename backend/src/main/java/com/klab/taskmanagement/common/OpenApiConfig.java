package com.klab.taskmanagement.common;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI taskApi() {
        return new OpenAPI().info(new Info()
                .title("Task API")
                .version("1.0.0")
                .description("REST API for creating, listing, updating, and deleting tasks."));
    }
}
