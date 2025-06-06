/*
  Warnings:

  - You are about to drop the `livesession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `livesession`;

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

-- RenameIndex
ALTER TABLE `recording` RENAME INDEX `Recording_live_session_id_idx` TO `recording_live_session_id_idx`;

-- RenameIndex
ALTER TABLE `subscription` RENAME INDEX `Subscription_streamer_id_idx` TO `subscription_streamer_id_idx`;
