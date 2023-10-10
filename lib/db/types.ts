import { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface Database {
    user: UserTable;
    guild: GuildTable;
    channel: ChannelTable;
    message: MessageTable;
    invite: InviteTable;
    role: RoleTable;
    emote: EmoteTable;
}

export interface Notification {
    type: 0 | 1 | 2 | 3 | 4;
    content: string | null;
    count: number;

    sender_id: number;
    channel_id: number | null;

    created_at: Generated<Date>;
};

export interface UserTable {
    id: Generated<number>;
    username: string;
    display_name: string;
    email: string | null;
    phone: string | null;

    avatar: string;
    banner: string | null;
    primary_color: string;
    accent_color: string;

    description: string | null;
    custom_status: string | null;

    password: string;
    refresh_tokens: string[];

    status: "online" | "idle" | "dnd" | "offline" | "invisible";
    system: boolean;
    verified: boolean;

    notifications: Notification[];

    guild_ids: number[];
    channel_ids: number[];
    friend_ids: number[];
    request_ids: number[];
    blocked_ids: number[];

    created_at: Generated<Date>;
}

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

export interface WelcomeScreen {
    title: string;
    subtitle: string;
    content: string[];

    links: string[];
    buttons: {
        text: string;
        color: string;
        url: string | null;
    }[];

    primary_color: string | null;
    accent_color: string    | null;

    background_url: string | null;
};

export interface GuildMember {
    user_id: number;
    nickname: string | null;
    avatar: string | null;
    role_ids: number[];

    deaf: boolean;
    mute: boolean;
    timeout_until: Date | null;

    joined_at: Generated<Date>;
};

export interface GuildTable {
    id: Generated<number>;
    name: string;
    icon: string | null;
    banner: string | null;
    description: string | null;

    welcome_screen: WelcomeScreen | null;
    vanity_url: string | null;
    vanity_url_uses: number;
    invite_ids: number[];

    system_channel_id: number | null;
    afk_channel_id: number | null;
    afk_timeout: number;

    owner_id: number;
    user_ids: number[];
    members: GuildMember[];

    channel_ids: number[];
    role_ids: number[];
    emote_ids: number[];

    created_at: Generated<Date>;
}

export type Guild = Selectable<GuildTable>;
export type NewGuild = Insertable<GuildTable>;
export type GuildUpdate = Updateable<GuildTable>;

export interface PermissionOverwrite {
    id: string;
    type: 0 | 1;
    allow: string[];
    deny: string[];
};

export interface ChannelTable {
    id: Generated<number>;
    type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
    name: string | null;
    topic: string | null;
    icon: string | null;

    nsfw: boolean;
    position: number | null;
    parent_id: number | null;

    last_message_id: number | null;
    last_pin_timestamp: Date | null;

    rate_limit: number | null;
    user_limit: number | null;
    bitrate: number | null;

    rtc_region: string | null;
    video_quality_mode: string | null;

    owner_id: number | null;
    guild_id: number | null;

    recipient_ids: number[] | null;

    permission_overwrites: PermissionOverwrite[] | null;

    created_at: Generated<Date>;
    updated_at: Generated<Date>;
}

export type Channel = Selectable<ChannelTable>;
export type NewChannel = Insertable<ChannelTable>;
export type ChannelUpdate = Updateable<ChannelTable>;

export interface Attachment {
    id: string;
    url: string;
    name: string;

    dimensions: {
        width: number;
        height: number;
    };
    size: number;

    isSpoiler: boolean;
    isImage: boolean;

    description: string | null;
};

export interface Embed {
    author: {
        name: string;
        url: string | null;
        iconUrl: string | null;
    } | null;

    title: string | null;
    url: string | null;
    thumbnail: string | null;
    description: string;

    fields: {
        name: string;
        value: string;
        inline: boolean;
    }[] | null;

    image: string | null;
    footer: {
        text: string;
        icon: string | null;
    } | null;

    color: string | null;
    timestamp: Date | null;
};

export interface Reaction {
    count: number;
    emote_id: number;
    user_ids: number[];
};

export interface MessageTable {
    id: Generated<number>;
    type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    content: string | null;
    attachments: Attachment[];
    embeds: Embed[];

    edited: Date | null;
    pinned: Date | null;

    reactions: Reaction[];
    mention_everyone: boolean;
    mention_channel_ids: number[];
    mention_role_ids: number[];
    mention_ids: number[];

    author_id: number;
    channel_id: number;

    message_reference_id: number | null;

    created_at: Generated<Date>;
}

export type Message = Selectable<MessageTable>;
export type NewMessage = Insertable<MessageTable>;
export type MessageUpdate = Updateable<MessageTable>;

export interface InviteTable {
    id: Generated<number>;
    code: string;
    uses: number;
    max_uses: number;
    max_age: number;
    temporary: boolean;

    inviter_id: number;
    channel_id: number;
    guild_id: number | null;

    expires_at: Generated<Date>;
    created_at: Generated<Date>;
}

export type Invite = Selectable<InviteTable>;
export type NewInvite = Insertable<InviteTable>;
export type InviteUpdate = Updateable<InviteTable>;

export interface RoleTable {
    id: Generated<number>;
    name: string;
    color: string;
    permissions: string[];
    position: number;
    mentionable: boolean;

    guild_id: number;
    member_ids: number[];

    created_at: Generated<Date>;
}

export type Role = Selectable<RoleTable>;
export type NewRole = Insertable<RoleTable>;
export type RoleUpdate = Updateable<RoleTable>;

export interface EmoteTable {
    id: Generated<number>;
    name: string;
    url: string;
    animated: boolean;

    guild_id: number;

    created_at: Generated<Date>;
}

export type Emote = Selectable<EmoteTable>;
export type NewEmote = Insertable<EmoteTable>;
export type EmoteUpdate = Updateable<EmoteTable>;
