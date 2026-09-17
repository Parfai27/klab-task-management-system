package com.klab.taskmanagement.common;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Turns Render/Heroku-style DATABASE_URL (postgres://user:pass@host:port/db)
 * into Spring datasource properties.
 */
public class DatabaseUrlProcessor implements EnvironmentPostProcessor {
    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String databaseUrl = firstNonBlank(
                environment.getProperty("DATABASE_URL"),
                environment.getProperty("DB_URL")
        );
        if (databaseUrl == null) {
            return;
        }
        if (!databaseUrl.startsWith("postgres://") && !databaseUrl.startsWith("postgresql://")) {
            return;
        }

        try {
            URI uri = URI.create(databaseUrl.replaceFirst("^postgres(ql)?://", "http://"));
            String userInfo = uri.getUserInfo() == null ? "" : URLDecoder.decode(uri.getUserInfo(), StandardCharsets.UTF_8);
            String[] parts = userInfo.split(":", 2);
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String host = uri.getHost();
            if (host != null && !host.contains(".")) {
                host = host + ".oregon-postgres.render.com";
            }
            String jdbc = "jdbc:postgresql://" + host + ":" + port + uri.getPath();
            if (!jdbc.contains("sslmode=")) {
                jdbc += jdbc.contains("?") ? "&sslmode=require" : "?sslmode=require";
            }

            Map<String, Object> props = new HashMap<>();
            props.put("spring.datasource.url", jdbc);
            if (parts.length > 0 && !parts[0].isBlank()) {
                props.put("spring.datasource.username", parts[0]);
            }
            if (parts.length > 1) {
                props.put("spring.datasource.password", parts[1]);
            }
            environment.getPropertySources().addFirst(new MapPropertySource("databaseUrl", props));
        } catch (RuntimeException ignored) {
            // Fall through to application.yml defaults if the URL cannot be parsed.
        }
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank() && !value.startsWith("jdbc:")) {
                return value;
            }
        }
        return null;
    }
}
