/*
  Warnings:

  - You are about to drop the `LiveSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Recording` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Streamer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Token` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `LiveSession`;

-- DropTable
DROP TABLE `Notification`;

-- DropTable
DROP TABLE `Recording`;

-- DropTable
DROP TABLE `Streamer`;

-- DropTable
DROP TABLE `Subscription`;

-- DropTable
DROP TABLE `Token`;

-- DropTable
DROP TABLE `User`;

-- CreateTable
CREATE TABLE `user` (
    `user_id` BIGINT NOT NULL AUTO_INCREMENT,
    `nickname` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `provider` ENUM('NAVER', 'KAKAO', 'GOOGLE') NULL,
    `is_deleted` BOOLEAN NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `streamer` (
    `streamer_id` BIGINT NOT NULL AUTO_INCREMENT,
    `platform` ENUM('CHZZK', 'YOUTUBE') NOT NULL,
    `channel_id` VARCHAR(191) NOT NULL,
    `channel_name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `is_live` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`streamer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscription` (
    `subscription_id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `streamer_id` BIGINT NOT NULL,
    `is_connected` BOOLEAN NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `subscription_streamer_id_idx`(`streamer_id`),
    PRIMARY KEY (`subscription_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `token` (
    `token_id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `refresh_token` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`token_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `live_session` (
    `live_session_id` BIGINT NOT NULL AUTO_INCREMENT,
    `streamer_id` BIGINT NOT NULL,
    `channel_name` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ended_at` DATETIME(3) NULL,
    `status` ENUM('LIVE', 'COMPLETED', 'FAILED') NULL DEFAULT 'LIVE',
    `channel_id` VARCHAR(191) NULL,
    `platform` ENUM('CHZZK', 'YOUTUBE') NULL DEFAULT 'CHZZK',

    INDEX `live_session_title_idx`(`title`),
    INDEX `live_session_started_at_idx`(`started_at`),
    PRIMARY KEY (`live_session_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recording` (
    `recording_id` BIGINT NOT NULL AUTO_INCREMENT,
    `live_session_id` BIGINT NOT NULL,
    `video_url` VARCHAR(191) NULL,
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completed_at` DATETIME(3) NULL,
    `status` ENUM('RECORDING', 'COMPLETED', 'FAILED') NULL DEFAULT 'RECORDING',

    INDEX `recording_live_session_id_idx`(`live_session_id`),
    PRIMARY KEY (`recording_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification` (
    `notification_id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`notification_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
