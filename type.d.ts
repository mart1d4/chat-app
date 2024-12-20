import { Channels, Emojis, Guilds, Invites, Messages, Roles, Users } from "@lib/db/db.type.js";
import { Selectable } from "kysely";

// Environment variables

declare module "bun" {
    interface Env {
        BASE_URL: string;
        NEXT_PUBLIC_API_URL: string;

        DB_NAME: string;
        DB_HOST: string;
        DB_USER: string;
        DB_PASSWORD: string;
        DB_PORT: number;
        DB_CONNECTION_LIMIT: number;

        ACCESS_TOKEN_SECRET: string;
        REFRESH_TOKEN_SECRET: string;

        NEXT_PUBLIC_CDN_URL: string;
        UPLOADTHING_TOKEN: string;
    }
}

// User

export type User = Selectable<Users>;
export type OptionalUser = Partial<User>;
export type LightUser = Pick<User, "id" | "displayName" | "avatar">;
export type LightUserWithUsername = LightUser & Pick<User, "username">;
export type UserProfile = Pick<
    User,
    | "id"
    | "username"
    | "displayName"
    | "description"
    | "customStatus"
    | "status"
    | "avatar"
    | "banner"
    | "primaryColor"
    | "accentColor"
>;

// Channel

export type Channel = Selectable<Channels>;
export type OptionalChannel = Partial<Channel>;
export type LightChannel = Pick<Channel, "id" | "name" | "icon">;
export type LightChannelWithTopic = LightChannel & Pick<Channel, "topic">;
export type LightChannelWithRecipients = LightChannel & { recipients: LightUser[] };
export type LightChannelWithTopicAndRecipients = LightChannelWithTopic & {
    recipients: LightUser[];
};

// Guild

export type Guild = Selectable<Guilds>;
export type OptionalGuild = Partial<Guild>;
export type LightGuild = Pick<Guild, "id" | "name" | "icon">;
export type LightGuildWithChannels = LightGuild & { channels: LightChannel[] };
export type GuildMember = LightUser & { nickname: string; joinedAt: Date };
export type LightGuildWithMembers = LightGuild & { members: GuildMember[] };
export type LightGuildWithChannelsAndMembers = LightGuild & {
    channels: LightChannel[];
    members: GuildMember[];
};

// Message

export type Message = Selectable<Messages>;
export type OptionalMessage = Partial<Message>;

// Message object being sent from the API when fetching messages
export type ReponseMessage = Pick<
    Message,
    | "id"
    | "type"
    | "content"
    | "attachments"
    | "embeds"
    | "edited"
    | "pinned"
    | "mentionEveryone"
    | "createdAt"
> & { author: LightUser } & { reference: ReponseMessage | null } & { userMentions: LightUser[] } & {
    roleMentions: RoleResponse[];
} & { channelMentions: LightChannel[] };

// Message object from TextArea before being sent to the API
export type TextAreaMessage = Pick<Message, "id" | "content" | "createdAt"> & {
    attachments: {
        id: number;

        file: File;
        type: "image" | "video" | "audio" | "file";

        size: number;
        filename: string;
        alt: string;
        spoiler: boolean;

        width: number | null;
        height: number | null;
    }[];

    userMentions: LightUser[];

    sending?: boolean;
    loading?: boolean;
    errored?: boolean;
};

// Emoji

export type Emoji = Selectable<Emojis>;
export type OptionalEmoji = Partial<Emoji>;
export type EmojiResponse = Pick<Emoji, "id" | "name" | "url" | "animated">;

// Role

export type Role = Selectable<Roles>;
export type OptionalRole = Partial<Role>;
export type RoleResponse = Pick<
    Role,
    "id" | "name" | "color" | "hoist" | "position" | "permissions" | "mentionable"
>;

// Invite

export type Invite = Selectable<Invites>;
export type OptionalInvite = Partial<Invite>;
export type InviteResponse = Pick<Invite, "code" | "uses" | "maxUses" | "expiresAt"> & {
    inviter: LightUser;
} & { channel: LightChannel } & {
    guild:
        | (LightGuild & {
              memberCount: {
                  all: number;
                  online: number;
              };
          })
        | null;
};
