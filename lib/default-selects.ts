import type { Channel, Guild, Invite, Message, Role, User } from "@/type";

// User

export const DefaultUserKnownSelect: (keyof User)[] = [
    "id",
    "displayName",
    "username",
    "avatar",
    "customStatus",
    "status",
];

export const DefaultUserUnknownSelect: (keyof User)[] = ["id", "displayName", "avatar"];

export const DefaultUserProfileSelect: (keyof User)[] = [
    "id",
    "username",
    "displayName",
    "avatar",
    "banner",
    "description",
    "customStatus",
    "status",
    "bannerColor",
    "accentColor",
    "createdAt",
    "system",
];

// Channel

export const DefaultChannelSelect: (keyof Channel)[] = [
    "id",
    "type",
    "name",
    "icon",
    "topic",
    "ownerId",
];

export const DefaultChannelRecipientSelect: (keyof User)[] = [
    "id",
    "displayName",
    "username",
    "avatar",
    "customStatus",
    "status",
];

export const DefaultGuildChannelSelect: (keyof Channel)[] = [
    "id",
    "type",
    "name",
    "topic",
    "position",
    "parentId",
    "nsfw",
    "permissionOverwrites",
];

export const DefaultGuildChannelRecipientSelect: (keyof User)[] = [
    "id",
    "username",
    "displayName",
    "avatar",
    "status",
];

// Guild

export const DefaultGuildSelect: (keyof Guild)[] = [
    "id",
    "name",
    "icon",
    "ownerId",
    "systemChannelId",
];

export const DefaultGuildMemberSelect: (keyof User)[] = ["id", "displayName", "avatar", "status"];

// Message

export const DefaultMessageSelect: (keyof Message)[] = [
    "id",
    "type",
    "content",
    "attachments",
    "embeds",
    "edited",
    "pinned",
    "mentionEveryone",
    "createdAt",
];

export const DefaultMessageAuthorSelect: (keyof User)[] = ["id", "displayName", "avatar"];
export const DefaultMessageUserMentionSelect: (keyof User)[] = ["id", "displayName", "avatar"];

export const DefaultReferenceMessageSelect: (keyof Message)[] = [
    "id",
    "type",
    "content",
    "attachments",
    "embeds",
    "edited",
];

// Invite

export const DefaultInviteSelect: (keyof Invite)[] = [
    "code",
    "uses",
    "maxUses",
    "expiresAt",
    "inviterId",
];

export const DefaultInviteChannelSelect: (keyof Channel)[] = ["id", "name", "icon"];
export const DefaultInviteGuildSelect: (keyof Guild)[] = ["id", "name", "icon"];

// Role

export const DefaultGuildRoleSelect: (keyof Role)[] = [
    "id",
    "name",
    "color",
    "position",
    "hoist",
    "permissions",
];

export function GetSelectWithPrefix(
    select: string[],
    prefix: string,
    toSnakeCase: boolean = false
) {
    return select
        .map((s) => (toSnakeCase ? CamelCaseToSnakeCase(s) : s))
        .map((s) => `${prefix}.${s}`);
}

function CamelCaseToSnakeCase(str: string) {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}
