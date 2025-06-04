-- AlterTable
ALTER TABLE `Subscription` MODIFY `is_connected` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `User` MODIFY `nickname` VARCHAR(191) NULL,
    MODIFY `email` VARCHAR(191) NULL,
    MODIFY `provider` ENUM('NAVER', 'KAKAO', 'GOOGLE') NULL,
    MODIFY `is_deleted` BOOLEAN NULL DEFAULT false;
