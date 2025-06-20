-- AlterTable
ALTER TABLE `LiveSession` ADD COLUMN `channel_id` VARCHAR(191) NULL,
    ADD COLUMN `platform` ENUM('CHZZK', 'YOUTUBE') NULL DEFAULT 'CHZZK',
    MODIFY `channel_name` VARCHAR(191) NULL;
