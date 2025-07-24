/*
  Warnings:

  - A unique constraint covering the columns `[provider,email]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `user_provider_email_key` ON `user`(`provider`, `email`);
