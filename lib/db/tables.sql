-- User Table

CREATE TABLE IF NOT EXISTS `users` (
	`id` BIGINT NOT NULL DEFAULT (UUID_SHORT()),

	-- Need this for case sensitivity
	`username` VARCHAR(32) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL UNIQUE,
	`display_name` VARCHAR(32) NOT NULL,

	`description` VARCHAR(190) NULL,
	`custom_status` VARCHAR(128) NULL,
	`status` enum('online', 'idle', 'dnd', 'invisible', 'offline') NOT NULL DEFAULT 'online',

	`avatar` VARCHAR(100) NULL,
	`banner` VARCHAR(100) NULL,

	`banner_color` VARCHAR(7) NOT NULL,
	`accent_color` VARCHAR(7) NULL,

	`password` VARCHAR(255) NOT NULL,
	`password_reset_token` VARCHAR(255) NULL,
	`password_reset_expires` DATETIME(3) NULL,

	`email` VARCHAR(255) UNIQUE,
	`email_verified` TINYINT(1) NOT NULL DEFAULT '0',
	`email_verification_link` VARCHAR(255),
	`email_verification_code` VARCHAR(255),
	`email_verification_expires` DATETIME(3),

	`phone` VARCHAR(15) UNIQUE,
	`phone_verified` TINYINT(1) NOT NULL DEFAULT '0',
	`phone_verification_code` VARCHAR(255),
	`phone_verification_expires` DATETIME(3),

	`system` TINYINT(1) NOT NULL DEFAULT '0',
	`verified` TINYINT(1) NOT NULL DEFAULT '0',

	`notes` JSON NOT NULL,
	`notifications` JSON NOT NULL,
	`settings` JSON NOT NULL,

	`created_at` DATETIME(3) NOT NULL DEFAULT current_timestamp(3),
	`is_deleted` TINYINT(1) NOT NULL DEFAULT '0',

	PRIMARY KEY (`id`),
	UNIQUE KEY `users_username_key` (`username`),
	UNIQUE KEY `users_email_key` (`email`),
	UNIQUE KEY `users_phone_key` (`phone`),
	KEY `users_email_verified_idx` (`email_verified`),
	KEY `users_phone_verified_idx` (`phone_verified`),
	KEY `users_is_deleted_idx` (`is_deleted`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- Channel Table

CREATE TABLE IF NOT EXISTS `channels` (
	`id` BIGINT NOT NULL DEFAULT (UUID_SHORT()),

	`type` INT NOT NULL,

	`name` VARCHAR(100),
	`topic` VARCHAR(1024),
	`icon` VARCHAR(100),
	`nsfw` TINYINT(1),

	`position` INT,
	`parent_id` BIGINT,

	`last_message_id` BIGINT,
	`last_pin_timestamp` DATETIME(3),

	`bitrate` INT,
	`rate_limit` INT,
	`user_limit` INT,

	`rtc_region` VARCHAR(191),
	`video_quality_mode` VARCHAR(191),

	`owner_id` BIGINT,
	`guild_id` BIGINT,

	`permission_overwrites` JSON NOT NULL,

	`createdAt` DATETIME(3) NOT NULL DEFAULT current_timestamp(3),
	`updated_at` DATETIME(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
	`is_deleted` TINYINT(1) NOT NULL DEFAULT '0',

	PRIMARY KEY (`id`),
    KEY `parent_id_idx` (`parent_id`),
    KEY `guild_id_idx` (`guild_id`),
	KEY `owner_id_idx` (`owner_id`),
	KEY `last_message_id_idx` (`last_message_id`),
	KEY `last_pin_timestamp_idx` (`last_pin_timestamp`),
	KEY `channel_type_idx` (`type`),
	KEY `channel_position_idx` (`position`),
	KEY `channel_is_deleted_idx` (`is_deleted`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- Guild Table

CREATE TABLE IF NOT EXISTS `guilds` (
	`id` BIGINT NOT NULL DEFAULT (UUID_SHORT()),

	`name` VARCHAR(100) NOT NULL,
	`icon` VARCHAR(100),
	`banner` VARCHAR(100),
	`description` VARCHAR(255),

	`system_channel_id` BIGINT,
	`afk_channel_id` BIGINT,
	`afk_timeout` INT,
    
	`vanity_url` VARCHAR(100),
	`vanity_url_uses` INT,
	`welcome_screen` JSON,

	`owner_id` BIGINT NOT NULL,

	`created_at` DATETIME(3) NOT NULL DEFAULT current_timestamp(3),
	`is_deleted` TINYINT(1) NOT NULL DEFAULT '0',

	PRIMARY KEY (`id`),
	KEY `owner_id_idx` (`owner_id`),
	KEY `guild_is_deleted_idx` (`is_deleted`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- Message Table

CREATE TABLE IF NOT EXISTS `messages` (
	`id` BIGINT NOT NULL DEFAULT (UUID_SHORT()),

	`type` INT NOT NULL,

	`content` VARCHAR(16000),
	`attachments` JSON NOT NULL,
	`embeds` JSON NOT NULL,

	`edited` DATETIME(3),
	`pinned` DATETIME(3),

	`reference_id` BIGINT,
	`mention_everyone` TINYINT(1) NOT NULL DEFAULT '0',

	`author_id` BIGINT NOT NULL,
	`channel_id` BIGINT NOT NULL,

	`created_at` DATETIME(3) NOT NULL DEFAULT current_timestamp(3),

	PRIMARY KEY (`id`),
    KEY `author_id_idx` (`author_id`),
    KEY `channel_id_idx` (`channel_id`),
    KEY `message_reference_id_idx` (`reference_id`),
	KEY `message_type_idx` (`type`),
	KEY `message_created_at_idx` (`created_at`),
	KEY `message_pinned_idx` (`pinned`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- Emoji Table

CREATE TABLE IF NOT EXISTS `emojis` (
	`id` BIGINT NOT NULL DEFAULT (UUID_SHORT()),

	`name` VARCHAR(32) NOT NULL,
	`url` VARCHAR(256) NOT NULL,
	`animated` TINYINT(1) NOT NULL DEFAULT '0',

	`guild_id` BIGINT NOT NULL,

	`created_at` DATETIME(3) NOT NULL DEFAULT current_timestamp(3),

	PRIMARY KEY (`id`),
    KEY `guild_id_idx` (`guild_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- Role Table

CREATE TABLE IF NOT EXISTS `roles` (
	`id` BIGINT NOT NULL DEFAULT (UUID_SHORT()),

	`name` VARCHAR(32) NOT NULL,
	`color` VARCHAR(7) NOT NULL DEFAULT '#99AAB5',

	`hoist` TINYINT(1) NOT NULL DEFAULT '0',
	`position` INT NOT NULL,

	`permissions` BIGINT NOT NULL,
	`mentionable` TINYINT(1) NOT NULL DEFAULT '0',

	`guild_id` BIGINT NOT NULL,

	`created_at` DATETIME(3) NOT NULL DEFAULT current_timestamp(3),

	PRIMARY KEY (`id`),
    KEY `guild_id_idx` (`guild_id`),
	KEY `role_position_idx` (`position`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- Invite Table

CREATE TABLE IF NOT EXISTS `invites` (
	`id` BIGINT NOT NULL DEFAULT (UUID_SHORT()),

	`code` VARCHAR(8) NOT NULL UNIQUE,
	`uses` INT NOT NULL DEFAULT '0',
	`temporary` TINYINT(1) NOT NULL DEFAULT '0',

	`max_age` INT NOT NULL DEFAULT '86400',
	`max_uses` INT NOT NULL DEFAULT '100',

	`inviter_id` BIGINT NOT NULL,
	`channel_id` BIGINT NOT NULL,
	`guild_id` BIGINT,

	`expires_at` DATETIME(3) NOT NULL,
	`created_at` DATETIME(3) NOT NULL DEFAULT current_timestamp(3),

	PRIMARY KEY (`id`),

	UNIQUE KEY `invites_code_key` (`code`),
    KEY `inviter_id_idx` (`inviter_id`),
    KEY `channel_id_idx` (`channel_id`),
    KEY `guild_id_idx` (`guild_id`),
	KEY `invites_expires_at_idx` (`expires_at`),
	KEY `invites_created_at_idx` (`created_at`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- User Tokens

CREATE TABLE IF NOT EXISTS `user_tokens` (
    user_id BIGINT,

    token VARCHAR(255),
    expires BIGINT,
    userAgent VARCHAR(255),
    ip VARCHAR(255),

    country VARCHAR(100),
    region VARCHAR(100),
    city VARCHAR(100),

    FOREIGN KEY (user_id) REFERENCES users(id)
	KEY `idx_user_tokens_user` (`user_id`)
	KEY `idx_user_tokens_token` (`token`)
);


-- Friends

CREATE TABLE IF NOT EXISTS `friends` (
    `A` BIGINT NOT NULL,
    `B` BIGINT NOT NULL,

    UNIQUE KEY `friends_AB_idx` (`A`, `B`),
    UNIQUE KEY `friends_BA_idx` (`B`, `A`),
	KEY `idx_friends_a` (`A`),
    KEY `idx_friends_b` (`B`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- Blocked

CREATE TABLE IF NOT EXISTS `blocked` (
    `blocker_id` BIGINT NOT NULL,
    `blocked_id` BIGINT NOT NULL,

    UNIQUE KEY `blocker_id_idx` (`blocker_id`, `blocked_id`),
	KEY `idx_blocked_blocker` (`blocker_id`),
	KEY `idx_blocked_blocked` (`blocked_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- Requests

CREATE TABLE IF NOT EXISTS `requests` (
    `requester_id` BIGINT NOT NULL,
    `requested_id` BIGINT NOT NULL,

    UNIQUE KEY `requester_id_idx` (`requester_id`, `requested_id`),
    UNIQUE KEY `requested_id_idx` (`requested_id`, `requester_id`),
	KEY `idx_requests_requester` (`requester_id`),
	KEY `idx_requests_requested` (`requested_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- ChannelRecipients

CREATE TABLE IF NOT EXISTS `channel_recipients` (
    `channel_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
	`is_hidden` TINYINT(1) NOT NULL DEFAULT '0',

    UNIQUE KEY `recipients_channel_id_idx` (`channel_id`, `user_id`),
	KEY `idx_recipients_channel` (`channel_id`),
	KEY `idx_recipients_user` (`user_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- GuildMembers

CREATE TABLE IF NOT EXISTS `guild_members` (
    `guild_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
	`profile` JSON NOT NULL,

    UNIQUE KEY `members_guild_id_idx` (`guild_id`, `user_id`),
    KEY `members_user_id_idx` (`user_id`),

	INDEX `idx_members_guild` (`guild_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- ChannelMessages

CREATE TABLE IF NOT EXISTS `channel_messages` (
    `channel_id` BIGINT NOT NULL,
    `message_id` BIGINT NOT NULL,

    UNIQUE KEY `messages_channel_id_idx` (`channel_id`, `message_id`),
    KEY `messages_message_id_idx` (`message_id`),
	KEY `idx_messages_channel` (`channel_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;

-- Message Mentions

CREATE TABLE IF NOT EXISTS `user_mentions` (
	`message_id` BIGINT NOT NULL,
	`user_id` BIGINT NOT NULL,

	UNIQUE KEY `mentions_message_id_idx` (`message_id`, `user_id`),
	KEY `mentions_user_id_idx` (`user_id`),
	KEY `idx_mentions_message` (`message_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `role_mentions` (
	`message_id` BIGINT NOT NULL,
	`role_id` BIGINT NOT NULL,

	UNIQUE KEY `mentions_message_id_idx` (`message_id`, `role_id`),
	KEY `mentions_role_id_idx` (`role_id`),
	KEY `idx_mentions_message` (`message_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `channel_mentions` (
	`message_id` BIGINT NOT NULL,
	`channel_id` BIGINT NOT NULL,

	UNIQUE KEY `mentions_message_id_idx` (`message_id`, `channel_id`),
	KEY `mentions_channel_id_idx` (`channel_id`),
	KEY `idx_mentions_message` (`message_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `message_reactions` (
	`message_id` BIGINT NOT NULL,
	`emoji_id` BIGINT NULL,
	`emoji_name` VARCHAR(128) NULL, -- for default emojis that are not in the database
	`user_id` BIGINT NOT NULL,

	UNIQUE KEY `reactions_message_id_idx` (`message_id`, `user_id`, `emoji_id`),
	KEY `reactions_user_id_idx` (`user_id`),
	KEY `reactions_emoji_id_idx` (`emoji_id`),
	KEY `idx_reactions_message` (`message_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;
