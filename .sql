CREATE TABLE IF NOT EXISTS users (
    id BIGINT NOT NULL PRIMARY KEY,

    username VARCHAR(32) NOT NULL,
    displayname VARCHAR(32) NOT NULL,

    email VARCHAR(254),
    phone VARCHAR(15),

    avatar VARCHAR(36) NOT NULL,
    banner VARCHAR(36),
    primary_color VARCHAR(7) NOT NULL,
    accent_color VARCHAR(7) NOT NULL,

    description VARCHAR(256),
    custom_status VARCHAR(256),

    password VARCHAR(128) NOT NULL,
    refresh_tokens JSON NOT NULL DEFAULT '[]',

    status ENUM('online', 'idle', 'dnd', 'offline', 'invisible') NOT NULL DEFAULT 'offline',
    system BOOLEAN NOT NULL DEFAULT FALSE,
    verified BOOLEAN NOT NULL DEFAULT FALSE,

    notifications JSON NOT NULL DEFAULT '[]',

    guild_ids INTEGER[],
    channel_ids INTEGER[],
    friend_ids INTEGER[],
    request_ids INTEGER[],
    blocked_ids INTEGER[],
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
