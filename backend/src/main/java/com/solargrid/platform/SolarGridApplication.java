package com.solargrid.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class SolarGridApplication {

    public static void main(String[] args) {
        SpringApplication.run(SolarGridApplication.class, args);
    }
}

