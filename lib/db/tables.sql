-- User Table

CREATE TABLE `users` (
	`id` bigint NOT NULL,

	`username` varchar(32) NOT NULL,
	`display_name` varchar(32) NOT NULL,
	`email` varchar(255),
	`phone` varchar(15),

	`avatar` varchar(36) NOT NULL,
	`banner` varchar(36),
	`primary_color` varchar(7) NOT NULL,
	`accent_color` varchar(7) NOT NULL,

	`description` varchar(190),
	`custom_status` varchar(128),
	`status` enum('online', 'idle', 'dnd', 'invisible', 'offline') NOT NULL DEFAULT 'offline',

	`password` varchar(256) NOT NULL,
	`refresh_tokens` json NOT NULL,

	`system` tinyint(1) NOT NULL DEFAULT '0',
	`verified` tinyint(1) NOT NULL DEFAULT '0',

	`notes` json NOT NULL,
	`notifications` json NOT NULL,
	`hidden_channel_ids` json NOT NULL,

	`created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
	`is_deleted` tinyint(1) NOT NULL DEFAULT '0',

	PRIMARY KEY (`id`),
	UNIQUE KEY `users_username_key` (`username`),
	UNIQUE KEY `users_email_key` (`email`),
	UNIQUE KEY `users_phone_key` (`phone`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- Channel Table

CREATE TABLE `channels` (
	`id` bigint NOT NULL,
	`type` int NOT NULL,

	`name` varchar(100),
	`topic` varchar(100),
	`icon` varchar(36),
	`nsfw` tinyint(1),

	`position` int,
	`parent_id` bigint,

	`last_message_id` bigint,
	`last_pin_timestamp` datetime(3),

	`bitrate` int,
	`rate_limit` int,
	`user_limit` int,

	`rtc_region` varchar(191),
	`video_quality_mode` varchar(191),

	`owner_id` bigint,
	`guild_id` bigint,

	`permission_overwrites` json NOT NULL,

	`createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
	`updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
	`is_deleted` tinyint(1) NOT NULL DEFAULT '0',

	PRIMARY KEY (`id`),
    KEY `parent_id_idx` (`parent_id`),
    KEY `last_message_id_idx` (`last_message_id`),
    KEY `guild_id_idx` (`guild_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- Guild Table

CREATE TABLE `guilds` (
	`id` bigint NOT NULL,

	`name` varchar(100) NOT NULL,
	`icon` varchar(36),
	`banner` varchar(36),
	`description` varchar(256),

	`system_channel_id` bigint,
	`afk_channel_id` bigint,
	`afk_timeout` int,
    
	`vanity_url` varchar(32),
	`vanity_url_uses` int,
	`welcome_screen` json,

	`owner_id` bigint NOT NULL,
	`members` json NOT NULL,

	`created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
	`is_deleted` tinyint(1) NOT NULL DEFAULT '0',

	PRIMARY KEY (`id`),
    KEY `owner_id_idx` (`owner_id`),
    KEY `afk_channel_id_idx` (`afk_channel_id`),
    KEY `system_channel_id_idx` (`system_channel_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- Message Table

CREATE TABLE `messages` (
	`id` bigint NOT NULL,
	`type` int NOT NULL,

	`content` varchar(4000),
	`attachments` json,
	`embeds` json,

	`edited` datetime(3),
	`pinned` datetime(3),

	`reactions` json,
	`message_reference_id` bigint,

	`mentions` json,
	`mention_role_ids` json,
	`mention_channel_ids` json,
	`mention_everyone` tinyint(1) NOT NULL DEFAULT '0',

	`author_id` bigint NOT NULL,
	`channel_id` bigint NOT NULL,

	`created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),

	PRIMARY KEY (`id`),
    KEY `author_id_idx` (`author_id`),
    KEY `channel_id_idx` (`channel_id`),
    KEY `message_reference_id_idx` (`message_reference_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- Emoji Table

CREATE TABLE `emojis` (
	`id` bigint NOT NULL,

	`name` varchar(32) NOT NULL,
	`url` varchar(256) NOT NULL,
	`animated` tinyint(1) NOT NULL DEFAULT '0',

	`guild_id` bigint NOT NULL,

	`created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),

	PRIMARY KEY (`id`),
    KEY `guild_id_idx` (`guild_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- Role Table

CREATE TABLE `roles` (
	`id` bigint NOT NULL,

	`name` varchar(32) NOT NULL,
	`color` varchar(7) NOT NULL,

	`hoist` tinyint(1) NOT NULL DEFAULT '0',
	`position` int NOT NULL,

	`permissions` json NOT NULL,
	`mentionable` tinyint(1) NOT NULL DEFAULT '0',

	`guild_id` bigint NOT NULL,

	`created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),

	PRIMARY KEY (`id`),
    KEY `guild_id_idx` (`guild_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- Invite Table

CREATE TABLE `invites` (
	`id` bigint NOT NULL,

	`code` varchar(8) NOT NULL,
	`uses` int NOT NULL DEFAULT '0',
	`temporary` tinyint(1) NOT NULL DEFAULT '0',

	`max_age` int NOT NULL DEFAULT '86400',
	`max_uses` int NOT NULL DEFAULT '100',

	`inviter_id` bigint NOT NULL,
	`channel_id` bigint NOT NULL,
	`guild_id` bigint,

	`expires_at` datetime(3) NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),

	PRIMARY KEY (`id`),

	UNIQUE KEY `invites_code_key` (`code`),
    KEY `inviter_id_idx` (`inviter_id`),
    KEY `channel_id_idx` (`channel_id`),
    KEY `guild_id_idx` (`guild_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;



--------------------
--    Relations   --
--------------------


-- Friends

CREATE TABLE `friends` (
    `A` bigint NOT NULL,
    `B` bigint NOT NULL,

    UNIQUE KEY `friends_AB_idx` (`A`, `B`),
    UNIQUE KEY `friends_BA_idx` (`B`, `A`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- Blocked

CREATE TABLE `blocked` (
    `blocker_id` bigint NOT NULL,
    `blocked_id` bigint NOT NULL,

    UNIQUE KEY `blocker_id_idx` (`blocker_id`, `blocked_id`),
    KEY `blocked_id_idx` (`blocked_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- Requests

CREATE TABLE `requests` (
    `requester_id` bigint NOT NULL,
    `requested_id` bigint NOT NULL,

    UNIQUE KEY `requester_id_idx` (`requester_id`, `requested_id`),
    UNIQUE KEY `requested_id_idx` (`requested_id`, `requester_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- ChannelRecipients

CREATE TABLE `channelrecipients` (
    `channel_id` bigint NOT NULL,
    `user_id` bigint NOT NULL,

    UNIQUE KEY `recipients_channel_id_idx` (`channel_id`, `user_id`),
    KEY `recipients_user_id_idx` (`user_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- GuildMembers

CREATE TABLE `guildmembers` (
    `guild_id` bigint NOT NULL,
    `user_id` bigint NOT NULL,

    UNIQUE KEY `members_guild_id_idx` (`guild_id`, `user_id`),
    KEY `members_user_id_idx` (`user_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;


-- ChannelMessages

CREATE TABLE `channelmessages` (
    `channel_id` bigint NOT NULL,
    `message_id` bigint NOT NULL,

    UNIQUE KEY `messages_channel_id_idx` (`channel_id`, `message_id`),
    KEY `messages_message_id_idx` (`message_id`)
) ENGINE InnoDB,
  CHARSET utf8mb4,
  COLLATE utf8mb4_unicode_ci;
