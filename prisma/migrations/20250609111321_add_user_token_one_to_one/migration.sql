/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `token` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `token_user_id_key` ON `token`(`user_id`);
