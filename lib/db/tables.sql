-- User Table

CREATE TABLE IF NOT EXISTS `users` (
	`id` BIGINT NOT NULL DEFAULT (UUID_SHORT()),

	-- Need this for case sensitivity
	`username` VARCHAR(32) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL UNIQUE,
	`display_name` VARCHAR(32) NOT NULL,
	`email` VARCHAR(255) UNIQUE,
	`phone` VARCHAR(15) UNIQUE,

	`avatar` VARCHAR(100) NOT NULL,
	`banner` VARCHAR(100),
	`primary_color` VARCHAR(7) NOT NULL,
	`accent_color` VARCHAR(7) NOT NULL,

	`description` VARCHAR(190),
	`custom_status` VARCHAR(128),
	`status` enum('online', 'idle', 'dnd', 'invisible', 'offline') NOT NULL DEFAULT 'offline',

	`password` VARCHAR(256) NOT NULL,
	`tokens` JSON NOT NULL,

	`system` TINYINT(1) NOT NULL DEFAULT '0',
	`verified` TINYINT(1) NOT NULL DEFAULT '0',

	`notes` JSON NOT NULL,
	`notifications` JSON NOT NULL,

	`created_at` DATETIME(3) NOT NULL DEFAULT current_timestamp(3),
	`is_deleted` TINYINT(1) NOT NULL DEFAULT '0',

	PRIMARY KEY (`id`),
	UNIQUE KEY `users_username_key` (`username`),
	UNIQUE KEY `users_email_key` (`email`),
	UNIQUE KEY `users_phone_key` (`phone`)
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
    KEY `last_message_id_idx` (`last_message_id`),
    KEY `guild_id_idx` (`guild_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- Guild Table

CREATE TABLE IF NOT EXISTS `guilds` (
	`id` BIGINT NOT NULL DEFAULT (UUID_SHORT()),

	`name` VARCHAR(100) NOT NULL,
	`icon` VARCHAR(100),
	`banner` VARCHAR(100),
	`description` VARCHAR(256),

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
    KEY `afk_channel_id_idx` (`afk_channel_id`),
    KEY `system_channel_id_idx` (`system_channel_id`)
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

	`reactions` JSON NOT NULL,
	`message_reference_id` BIGINT,

	`user_mentions` JSON NOT NULL,
	`role_mentions` JSON NOT NULL,
	`channel_mentions` JSON NOT NULL,
	`mention_everyone` TINYINT(1) NOT NULL DEFAULT '0',

	`author_id` BIGINT NOT NULL,
	`channel_id` BIGINT NOT NULL,

	`created_at` DATETIME(3) NOT NULL DEFAULT current_timestamp(3),

	PRIMARY KEY (`id`),
    KEY `author_id_idx` (`author_id`),
    KEY `channel_id_idx` (`channel_id`),
    KEY `message_reference_id_idx` (`message_reference_id`)
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
    KEY `guild_id_idx` (`guild_id`)
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
    KEY `guild_id_idx` (`guild_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- Friends

CREATE TABLE IF NOT EXISTS `friends` (
    `A` BIGINT NOT NULL,
    `B` BIGINT NOT NULL,

    UNIQUE KEY `friends_AB_idx` (`A`, `B`),
    UNIQUE KEY `friends_BA_idx` (`B`, `A`),

	INDEX `idx_friends_a` (`A`),
    INDEX `idx_friends_b` (`B`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- Blocked

CREATE TABLE IF NOT EXISTS `blocked` (
    `blocker_id` BIGINT NOT NULL,
    `blocked_id` BIGINT NOT NULL,

    UNIQUE KEY `blocker_id_idx` (`blocker_id`, `blocked_id`),
    KEY `blocked_id_idx` (`blocked_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- Requests

CREATE TABLE IF NOT EXISTS `requests` (
    `requester_id` BIGINT NOT NULL,
    `requested_id` BIGINT NOT NULL,

    UNIQUE KEY `requester_id_idx` (`requester_id`, `requested_id`),
    UNIQUE KEY `requested_id_idx` (`requested_id`, `requester_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- ChannelRecipients

CREATE TABLE IF NOT EXISTS `channelrecipients` (
    `channel_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
	`is_hidden` TINYINT(1) NOT NULL DEFAULT '0',

    UNIQUE KEY `recipients_channel_id_idx` (`channel_id`, `user_id`),
    KEY `recipients_user_id_idx` (`user_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- GuildMembers

CREATE TABLE IF NOT EXISTS `guildmembers` (
    `guild_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
	`profile` JSON NOT NULL,

    UNIQUE KEY `members_guild_id_idx` (`guild_id`, `user_id`),
    KEY `members_user_id_idx` (`user_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- ChannelMessages

CREATE TABLE IF NOT EXISTS `channelmessages` (
    `channel_id` BIGINT NOT NULL,
    `message_id` BIGINT NOT NULL,

    UNIQUE KEY `messages_channel_id_idx` (`channel_id`, `message_id`),
    KEY `messages_message_id_idx` (`message_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;

  
-- Message Mentions

CREATE TABLE IF NOT EXISTS `usermentions` (
	`message_id` BIGINT NOT NULL,
	`user_id` BIGINT NOT NULL,

	UNIQUE KEY `mentions_message_id_idx` (`message_id`, `user_id`),
	KEY `mentions_user_id_idx` (`user_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rolementions` (
	`message_id` BIGINT NOT NULL,
	`role_id` BIGINT NOT NULL,

	UNIQUE KEY `mentions_message_id_idx` (`message_id`, `role_id`),
	KEY `mentions_role_id_idx` (`role_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `channelmentions` (
	`message_id` BIGINT NOT NULL,
	`channel_id` BIGINT NOT NULL,

	UNIQUE KEY `mentions_message_id_idx` (`message_id`, `channel_id`),
	KEY `mentions_channel_id_idx` (`channel_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `messagereactions` (
	`message_id` BIGINT NOT NULL,
	`user_id` BIGINT NOT NULL,
	`emoji_id` BIGINT NOT NULL,

	UNIQUE KEY `reactions_message_id_idx` (`message_id`, `user_id`, `emoji_id`),
	KEY `reactions_user_id_idx` (`user_id`),
	KEY `reactions_emoji_id_idx` (`emoji_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;
