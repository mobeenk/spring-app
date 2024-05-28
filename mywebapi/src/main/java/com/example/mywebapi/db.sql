CREATE DATABASE university;

USE university;

CREATE TABLE userinfo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(45),
    email VARCHAR(45),
    password VARCHAR(45),
    roles VARCHAR(45)
);
