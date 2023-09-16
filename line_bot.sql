CREATE DATABASE bot;
USE bot;

CREATE TABLE users (
	line_id VARCHAR(255) NOT NULL,
    user_id INT AUTO_INCREMENT,
    user_name VARCHAR(255) NOT NULL,
    role_id TINYINT NOT NULL,
    PRIMARY KEY (line_id, user_id)
);

CREATE TABLE scores (
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    score INT NOT NULL,
    PRIMARY KEY (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

CREATE TABLE courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    course_name VARCHAR(255) NOT NULL
);

CREATE TABLE roles(
	role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(255) NOT NULL
);

CREATE TABLE messages (
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);