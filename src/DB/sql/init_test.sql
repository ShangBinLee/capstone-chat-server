CREATE DATABASE bit_chat_test DEFAULT CHARACTER SET utf8mb4;

USE bit_chat_test;

CREATE TABLE `chat_room` (
	`id` BIGINT	NOT NULL,
	`create_date` DATETIME NOT NULL,
	`modified_date`	DATETIME NOT NULL,
	`product_id` BIGINT NOT NULL,
	`check_transaction`	BOOLEAN NOT	NULL,
	`buyer_id` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`id`)
);

CREATE TABLE `chat` (
	`id` BIGINT NOT NULL,
	`chat_content` VARCHAR(255)	NOT NULL,
	`create_date` DATETIME NOT NULL,
	`modified_date` DATETIME NOT NULL,
	`chat_room_id` BIGINT NOT NULL,
	`sender_id` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`id`),
	CONSTRAINT fk_chat_chat_room_id_chat_room FOREIGN KEY(`chat_room_id`)
	REFERENCES `chat_room`(`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE USER 'bit_chat_test'@'localhost' IDENTIFIED by '1234';
GRANT ALL PRIVILEGES ON bit_chat_test.* TO 'bit_chat_test'@'localhost';