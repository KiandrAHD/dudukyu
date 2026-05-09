CREATE DATABASE IF NOT EXISTS dudukyu;
USE dudukyu;

CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    restaurant_name VARCHAR(255),
    table_number VARCHAR(50),
    reservation_date DATE,
    reservation_time TIME,
    people_count INT,
    seat_type VARCHAR(100),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
