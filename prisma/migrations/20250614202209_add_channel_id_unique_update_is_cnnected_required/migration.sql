/*
  Warnings:

  - A unique constraint covering the columns `[channel_id]` on the table `streamer` will be added. If there are existing duplicate values, this will fail.
  - Made the column `is_connected` on table `subscription` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `subscription` MODIFY `is_connected` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX `streamer_channel_id_key` ON `streamer`(`channel_id`);
