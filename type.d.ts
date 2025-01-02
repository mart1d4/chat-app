import { Channels, Emojis, Guilds, Invites, Messages, Roles, Users } from "@lib/db/db.type.js";
import { Selectable } from "kysely";
import type { Embeds } from "./lib/db/db.types";

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
        EMAIL_TOKEN_SECRET: string;

        NEXT_PUBLIC_CDN_URL: string;
        UPLOADTHING_TOKEN: string;

        RESEND_TOKEN: string;
    }
}

// User

export type User = Selectable<Users>;
export type OptionalUser = Partial<User>;
export type LightUser = Pick<User, "id" | "displayName" | "avatar">;
export type UnknownUser = LightUser & Pick<User, "username">;
export type Friend = UnknownUser & { status: User["status"] };
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
    | "createdAt"
>;

export type AppUser = UserProfile & { email: string; phone: string; twoFactorEnabled: boolean };

// Channel

export type Channel = Selectable<Channels>;
export type OptionalChannel = Partial<Channel>;
export type LightChannel = Pick<Channel, "id" | "type" | "name" | "icon" | "topic" | "ownerId">;
export type ChannelRecipient = UnknownUser & { status: User["status"] };
export type LightChannelWithRecipients = LightChannel & { recipients: ChannelRecipient[] };

export type AppChannel = LightChannelWithRecipients;

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
export type ResponseMessage = Pick<
    Message,
    "id" | "type" | "content" | "edited" | "pinned" | "mentionEveryone" | "createdAt"
> & {
    attachments: ResponseAttachment[];
} & {
    embeds: Embeds[];
} & { author: LightUser } & { reference: ResponseMessage | null } & { mentions: LightUser[] } & {
    roleMentions: RoleResponse[];
} & { channelMentions: LightChannel[] };

// Message object from TextArea before being sent to the API

export type AttachmentType = "image" | "video" | "audio" | "file";

export type ResponseAttachment = {
    id: string;
    ext: string;
    type: AttachmentType;

    size: number;
    filename: string;
    spoiler: boolean;
    description: string;

    width: number | null;
    height: number | null;
};

export type Attachment = Omit<ResponseAttachment, "id"> & {
    id: number;

    file: File;
    url: string;
};

export type TextAreaMessage = Omit<ResponseMessage, "attachments" | "reference"> & {
    attachments: Attachment[];
    reference: number | null;

    send: boolean;
    error: boolean;
    loading: boolean;
};

export type EitherAttachment = ResponseAttachment | Attachment;
export type AppMessage = ResponseMessage | TextAreaMessage;

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
