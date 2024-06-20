package com.example.mywebapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class MywebapiApplication {

	public static void main(String[] args) {
		SpringApplication.run(MywebapiApplication.class, args);
	}

}
