-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(36) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone_number` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `profile` VARCHAR(191) NOT NULL DEFAULT '',
    `fackbook_id` VARCHAR(191) NOT NULL DEFAULT '',
    `google_id` VARCHAR(191) NOT NULL DEFAULT '',
    `device_token` VARCHAR(191) NOT NULL DEFAULT '',
    `login_version` INTEGER NOT NULL DEFAULT 0,
    `is_vertified` BOOLEAN NOT NULL DEFAULT false,
    `role` ENUM('customer', 'admin', 'superadmin') NOT NULL DEFAULT 'customer',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `users_username_idx`(`username`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_phone_number_idx`(`phone_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `location` (
    `id` VARCHAR(36) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `user_id` VARCHAR(191) NOT NULL,
    `tag` VARCHAR(191) NOT NULL,
    `street` VARCHAR(191) NOT NULL,
    `point` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `detail` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `banners` (
    `id` VARCHAR(36) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_public` BOOLEAN NOT NULL DEFAULT true,
    `image` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promotions` (
    `id` VARCHAR(36) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_public` BOOLEAN NOT NULL DEFAULT true,
    `code` VARCHAR(191) NOT NULL,
    `price` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL,
    `count_use` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallet` (
    `id` VARCHAR(36) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `user_id` VARCHAR(36) NOT NULL,
    `promotion_id` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `wallet_user_id_idx`(`user_id`),
    INDEX `wallet_promotion_id_idx`(`promotion_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review` (
    `id` VARCHAR(36) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `user_id` VARCHAR(36) NOT NULL,
    `post_id` VARCHAR(36) NOT NULL,
    `star` DOUBLE NOT NULL DEFAULT 0.0,
    `comment` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `review_post_id_idx`(`post_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_status` (
    `id` VARCHAR(36) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `car_types` (
    `id` VARCHAR(36) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `name` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NOT NULL,
    `detail` VARCHAR(191) NOT NULL,
    `wheel` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `labels` (
    `id` VARCHAR(36) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `name` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `labels_data` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` VARCHAR(36) NOT NULL,
    `label_id` VARCHAR(36) NOT NULL,

    INDEX `labels_data_post_id_idx`(`post_id`),
    UNIQUE INDEX `labels_data_post_id_label_id_key`(`post_id`, `label_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `car_brands` (
    `id` VARCHAR(36) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `name` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `level_insurances` (
    `id` VARCHAR(36) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `insurance_companies` (
    `id` VARCHAR(36) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `name` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `type_of_fuals` (
    `id` VARCHAR(36) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `name` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `like_post` (
    `user_id` VARCHAR(36) NOT NULL,
    `post_id` VARCHAR(36) NOT NULL,

    INDEX `like_post_post_id_idx`(`post_id`),
    PRIMARY KEY (`user_id`, `post_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posts` (
    `id` VARCHAR(36) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `car_type_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `star` DOUBLE NOT NULL DEFAULT 0.0,
    `frist_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `birth_day` DATE NOT NULL,
    `nationnality` VARCHAR(191) NOT NULL,
    `doc_type` VARCHAR(191) NOT NULL,
    `car_insurance` BOOLEAN NOT NULL,
    `insurance_company_id` VARCHAR(36) NULL,
    `level_insurance_id` VARCHAR(36) NULL,
    `car_brand_id` VARCHAR(36) NULL,
    `car_brand` VARCHAR(191) NULL,
    `car_version` VARCHAR(191) NOT NULL,
    `car_year` VARCHAR(191) NOT NULL,
    `car_resgistration` VARCHAR(191) NOT NULL,
    `door` INTEGER NOT NULL DEFAULT 2,
    `type_of_fual_id` VARCHAR(36) NOT NULL,
    `driver_system` VARCHAR(191) NOT NULL,
    `seat` VARCHAR(191) NOT NULL,
    `car_color` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `street` VARCHAR(191) NULL,
    `point` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `detail_address` VARCHAR(191) NULL,
    `deposits_fee` DOUBLE NOT NULL,
    `status_id` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `posts_car_type_id_idx`(`car_type_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_doc_image` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` VARCHAR(36) NOT NULL,
    `url` VARCHAR(191) NOT NULL,

    INDEX `post_doc_image_post_id_idx`(`post_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_driver_license_image` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` VARCHAR(36) NOT NULL,
    `url` VARCHAR(191) NOT NULL,

    INDEX `post_driver_license_image_post_id_idx`(`post_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_car_image` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` VARCHAR(36) NOT NULL,
    `url` VARCHAR(191) NOT NULL,

    INDEX `post_car_image_post_id_idx`(`post_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_insurance_image` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` VARCHAR(36) NOT NULL,
    `url` VARCHAR(191) NOT NULL,

    INDEX `post_insurance_image_post_id_idx`(`post_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_rent_data` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `deposit` DOUBLE NOT NULL,
    `system_cost` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,

    INDEX `post_rent_data_post_id_idx`(`post_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `car_rent_status` (
    `id` VARCHAR(36) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `car_rent` (
    `id` VARCHAR(36) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `user_id` VARCHAR(36) NOT NULL,
    `post_id` VARCHAR(36) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `frist_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone_number` VARCHAR(191) NOT NULL,
    `doc_type` VARCHAR(191) NOT NULL,
    `description` LONGTEXT NULL,
    `promotion_id` VARCHAR(36) NULL,
    `booking_fee` DOUBLE NOT NULL,
    `pay_destination` DOUBLE NOT NULL,
    `pay_type` VARCHAR(191) NOT NULL,
    `bank_no` VARCHAR(17) NOT NULL,
    `pay_status` BOOLEAN NOT NULL DEFAULT false,
    `reason` LONGTEXT NULL,
    `status_id` VARCHAR(36) NOT NULL,
    `is_success` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `car_rent_doc_image` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `car_rent_id` VARCHAR(36) NOT NULL,
    `url` VARCHAR(191) NOT NULL,

    INDEX `car_rent_doc_image_car_rent_id_idx`(`car_rent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `car_rent_payment_image` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `car_rent_id` VARCHAR(36) NOT NULL,
    `url` VARCHAR(191) NOT NULL,

    INDEX `car_rent_payment_image_car_rent_id_idx`(`car_rent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `car_rent_visa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `car_rent_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `exp_date` DATE NOT NULL,
    `cvv` VARCHAR(3) NOT NULL,

    UNIQUE INDEX `car_rent_visa_car_rent_id_key`(`car_rent_id`),
    INDEX `car_rent_visa_car_rent_id_idx`(`car_rent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reels` (
    `id` VARCHAR(36) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `title` VARCHAR(191) NOT NULL,
    `detail` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `like_reel` (
    `user_id` VARCHAR(36) NOT NULL,
    `reels_id` VARCHAR(36) NOT NULL,

    PRIMARY KEY (`user_id`, `reels_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comments` (
    `id` VARCHAR(36) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `user_id` VARCHAR(36) NOT NULL,
    `reels_id` VARCHAR(36) NOT NULL,
    `comment_text` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `like_comment` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `comment_id` VARCHAR(36) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `replys` (
    `id` VARCHAR(36) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `user_id` VARCHAR(36) NOT NULL,
    `comment_id` VARCHAR(36) NOT NULL,
    `reply_text` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `like_reply` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `reply_id` VARCHAR(36) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `location` ADD CONSTRAINT `location_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet` ADD CONSTRAINT `wallet_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet` ADD CONSTRAINT `wallet_promotion_id_fkey` FOREIGN KEY (`promotion_id`) REFERENCES `promotions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review` ADD CONSTRAINT `review_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review` ADD CONSTRAINT `review_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `labels_data` ADD CONSTRAINT `labels_data_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `labels_data` ADD CONSTRAINT `labels_data_label_id_fkey` FOREIGN KEY (`label_id`) REFERENCES `labels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `like_post` ADD CONSTRAINT `like_post_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `like_post` ADD CONSTRAINT `like_post_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_car_type_id_fkey` FOREIGN KEY (`car_type_id`) REFERENCES `car_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_insurance_company_id_fkey` FOREIGN KEY (`insurance_company_id`) REFERENCES `insurance_companies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_level_insurance_id_fkey` FOREIGN KEY (`level_insurance_id`) REFERENCES `level_insurances`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_car_brand_id_fkey` FOREIGN KEY (`car_brand_id`) REFERENCES `car_brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_type_of_fual_id_fkey` FOREIGN KEY (`type_of_fual_id`) REFERENCES `type_of_fuals`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `post_status`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_doc_image` ADD CONSTRAINT `post_doc_image_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_driver_license_image` ADD CONSTRAINT `post_driver_license_image_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_car_image` ADD CONSTRAINT `post_car_image_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_insurance_image` ADD CONSTRAINT `post_insurance_image_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_rent_data` ADD CONSTRAINT `post_rent_data_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `car_rent` ADD CONSTRAINT `car_rent_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `car_rent` ADD CONSTRAINT `car_rent_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `car_rent` ADD CONSTRAINT `car_rent_promotion_id_fkey` FOREIGN KEY (`promotion_id`) REFERENCES `promotions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `car_rent` ADD CONSTRAINT `car_rent_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `car_rent_status`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `car_rent_doc_image` ADD CONSTRAINT `car_rent_doc_image_car_rent_id_fkey` FOREIGN KEY (`car_rent_id`) REFERENCES `car_rent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `car_rent_payment_image` ADD CONSTRAINT `car_rent_payment_image_car_rent_id_fkey` FOREIGN KEY (`car_rent_id`) REFERENCES `car_rent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `car_rent_visa` ADD CONSTRAINT `car_rent_visa_car_rent_id_fkey` FOREIGN KEY (`car_rent_id`) REFERENCES `car_rent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reels` ADD CONSTRAINT `reels_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `like_reel` ADD CONSTRAINT `like_reel_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `like_reel` ADD CONSTRAINT `like_reel_reels_id_fkey` FOREIGN KEY (`reels_id`) REFERENCES `reels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_reels_id_fkey` FOREIGN KEY (`reels_id`) REFERENCES `reels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `like_comment` ADD CONSTRAINT `like_comment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `like_comment` ADD CONSTRAINT `like_comment_comment_id_fkey` FOREIGN KEY (`comment_id`) REFERENCES `reels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `replys` ADD CONSTRAINT `replys_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `like_reply` ADD CONSTRAINT `like_reply_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `like_reply` ADD CONSTRAINT `like_reply_reply_id_fkey` FOREIGN KEY (`reply_id`) REFERENCES `reels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
