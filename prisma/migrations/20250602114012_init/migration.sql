/*
  Warnings:

  - You are about to drop the column `platform_channel_id` on the `LiveSession` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Recording` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `LiveSession` DROP COLUMN `platform_channel_id`;

-- AlterTable
ALTER TABLE `Recording` DROP COLUMN `title`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `name`;

-- CreateIndex
CREATE INDEX `LiveSession_title_idx` ON `LiveSession`(`title`);

-- CreateIndex
CREATE INDEX `LiveSession_started_at_idx` ON `LiveSession`(`started_at`);

-- CreateIndex
CREATE INDEX `Recording_live_session_id_idx` ON `Recording`(`live_session_id`);

-- CreateIndex
CREATE INDEX `Subscription_streamer_id_idx` ON `Subscription`(`streamer_id`);
