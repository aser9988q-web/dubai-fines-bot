CREATE TABLE `fine_queries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`plateSource` varchar(100) NOT NULL,
	`plateNumber` varchar(50) NOT NULL,
	`plateCode` varchar(50) NOT NULL,
	`status` enum('pending','success','failed','no_fines') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`totalFines` int DEFAULT 0,
	`totalAmount` decimal(10,2),
	`rawResults` json,
	`userId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fine_queries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`queryId` int NOT NULL,
	`fineNumber` varchar(100),
	`fineDate` varchar(50),
	`description` text,
	`amount` decimal(10,2),
	`blackPoints` int DEFAULT 0,
	`isPaid` enum('paid','unpaid','partial') DEFAULT 'unpaid',
	`location` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fines_id` PRIMARY KEY(`id`)
);
