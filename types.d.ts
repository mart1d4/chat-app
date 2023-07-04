// Enums

enum EUserStatus {
    ONLINE = 'ONLINE',
    IDLE = 'IDLE',
    DO_NOT_DISTURB = 'DO_NOT_DISTURB',
    INVISIBLE = 'INVISIBLE',
    OFFLINE = 'OFFLINE',
}

enum ETChannel {
    DM = 'DM',
    GROUP_DM = 'GROUP_DM',
    GUILD_TEXT = 'GUILD_TEXT',
    GUILD_VOICE = 'GUILD_VOICE',
    GUILD_CATEGORY = 'GUILD_CATEGORY',
    FORUM = 'FORUM',
}

enum ETMessage {
    DEFAULT = 'DEFAULT',
    REPLY = 'REPLY',
    RECIPIENT_ADD = 'RECIPIENT_ADD',
    RECIPIENT_REMOVE = 'RECIPIENT_REMOVE',
    CALL = 'CALL',
    CHANNEL_NAME_CHANGE = 'CHANNEL_NAME_CHANGE',
    CHANNEL_ICON_CHANGE = 'CHANNEL_ICON_CHANGE',
    CHANNEL_PINNED_MESSAGE = 'CHANNEL_PINNED_MESSAGE',
    GUILD_MEMBER_JOIN = 'GUILD_MEMBER_JOIN',
    OWNER_CHANGE = 'OWNER_CHANGE',
}

enum ENotificationType {
    REQUEST = 'REQUEST',
    MESSAGE = 'MESSAGE',
    MENTION = 'MENTION',
    CALL = 'CALL',
    OTHER = 'OTHER',
}

// Types

type TUser = readonly {
    id: string;
    username: string;
    displayName: string;
    email?: string;
    avatar: string;
    banner?: string;
    primaryColor: string;
    accentColor: string;
    description?: string;
    customStatus?: string;
    password: string;
    refreshToken?: string;
    status: EUserStatus;
    system: boolean;
    verified: boolean;
    notifications: TNotification[];

    guildIds: TGuild.id[];
    guilds?: TGuild[];

    ownedGuildIds: TGuild.id[];
    ownedGuilds?: TGuild[];

    channelIds: TChannel.id[];
    channels?: TChannel[];

    ownedChannelIds: TChannel.id[];
    ownedChannels?: TChannel[];

    ownedRoleIds: TRole.id[];
    ownedRoles?: TRole[];

    messages: TMessage[];

    friendIds: TUser.id[];
    friends?: TUser[];

    friendOfIds: TUser.id[];
    friendOf?: TUser[];

    requestReceivedIds: TUser.id[];
    requestsReceived?: TUser[];

    requestSentIds: TUser.id[];
    requestsSent?: TUser[];

    blockedUserIds: TUser.id[];
    blockedUsers?: TUser[];

    blockedByUserIds: TUser.id[];
    blockedByUsers?: TUser[];

    createdAt: DateTime;
    updatedAt: DateTime;
};

type TCleanUser = readonly {
    id: string;
    username: string;
    displayName: string;
    email?: string;
    avatar: string;
    banner?: string;
    primaryColor: string;
    accentColor: string;
    description?: string;
    customStatus?: string;
    status: EUserStatus;
    system?: boolean;
    verified?: boolean;
    notifications?: TNotification[];

    guildIds: TGuild.id[];
    guilds?: TGuild[];

    channelIds: TChannel.id[];
    channels?: TChannel[];

    friendIds: TUser.id[];
    friends?: TUser[];

    requestReceivedIds?: TUser.id[];
    requestsReceived?: TUser[];

    requestSentIds?: TUser.id[];
    requestsSent?: TUser[];

    blockedUserIds?: TUser.id[];
    blockedUsers?: TUser[];

    createdAt: DateTime;
};

type TSensitiveUser = readonly {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    banner?: string;
    primaryColor: string;
    accentColor: string;

    createdAt: DateTime;
};

type TGuild = readonly {
    id: string;
    name: string;
    icon: string;
    banner?: string;
    description?: string;
    welcomeScreen?: TWelcomeScreen;
    vanityUrl?: string;
    vanityUrlUses?: number;
    invites?: TInvite[];
    afkChannelId?: TChannel.id;
    afkTimout?: number;

    ownerId: TUser.id;
    owner: TUser;

    memberIds: TUser.id[];
    members: TUser[];

    channels: TChannel[];
    roles: TRole[];

    createdAt: DateTime;
    updatedAt: DateTime;
};

type TChannel = readonly {
    id: string;
    type: ETChannel;
    name?: string;
    description?: string;
    icon?: string;
    nsfw: boolean;
    position?: number;
    parentId?: TChannel.id;
    rateLimit?: number;
    permissions: string[];

    guildId: TGuild.id;
    guild: TGuild;

    ownerId: TUser.id;
    owner: TUser;

    recipientIds: TUser.id[];
    recipients: TUser[];

    messageIds: TMessage.id[];
    messages: TMessage[];

    createdAt: DateTime;
    updatedAt: DateTime;
};

type TMessage = readonly {
    id: string;
    type: ETMessage;
    content: string;
    attachments: File[];
    embeds: TEmbed[];
    edited: boolean;
    pinned: boolean;
    reactions: TReaction[];
    mentionEveryone: boolean;
    mentionChannelIds: TChannel.id[];
    mentionRoleIds: TRole.id[];
    mentionUserIds: TUser.id[];

    authorId: TUser.id;
    author: TUser;

    channelId: TChannel.id;
    channel: TChannel;

    messageReferenceId?: TMessage.id;
    messageReference: TMessage;

    referencedByIds: TMessage.id[];
    referencedBy: TMessage[];

    createdAt: DateTime;
    updatedAt: DateTime;

    // Not in database
    waiting?: boolean;
    error?: boolean;
};

type TEmbed = readonly {
    author?: {
        name: string;
        url?: string;
        iconUrl?: string;
    };
    title?: string;
    url?: string;
    thumbnail?: string;
    description: string;
    fields?: {
        name: string;
        value: string;
        inline: boolean;
    }[];
    image?: string;
    footer?: {
        text: string;
        icon?: string;
    };
    color?: string;
    timestamp?: Date;
};

type TInvite = readonly {
    code: string;
    uses: number;
    maxUses: number;
    expiresAt: Date;
    createdAt: Date;
};

type TRole = readonly {
    id: string;
    name: string;
    color: string;
    permissions: string[];
    position: number;
    mentionable: boolean;

    guildId: TGuild.id;
    guild: TGuild;

    memberIds: TUser.id[];
    members: TUser[];

    createdAt: DateTime;
    updatedAt: DateTime;
};

type TNotification = readonly {
    type: ENotification;
    senderId: TUser.id;
    channelId?: TChannel.id;
    content?: string;
    count: number;
    createdAt: Date;
};

type TReaction = readonly {
    count: number;

    messageId: TMessage.id;
    emoteId: TEmote.id;
    userIds: TUser.id[];

    createdAt: DateTime;
    updatedAt: DateTime;
};

type TEmote = readonly {
    id: string;
    name: string;
    url: string;
    animated: boolean;

    guildId: TGuild.id;
    guild: TGuild;

    createdAt: DateTime;
    updatedAt: DateTime;
};

type MessageEditObject = {
    messageId: TMessage.id;
    content: string;
};

type MessageReplyObject = {
    channelId: TChannel.id;
    messageId: TMessage.id;
    author: TUser;
};

//#//#//#//#//#//#//
// Context. Types //
//#//#//#//#//#//#//

// AuthProvider

type AuthObjectType = null | {
    user: TCleanUser;
    accessToken: string;
};

type AuthContextValueType = null | {
    auth: AuthObjectType;
    setAuth: Dispatch<SetStateAction<AuthObjectType>>;
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
};

// LayerProvider

type UserProfileObjectType = null | {};

type PopupObjectType = null | {};

type FixedLayerObjectType = {
    type: string;
    event: MouseEvent;
    element: Element;
    firstSide: string;
    secondSide: string;
    gap: number;
};

type LayerContextValueType = null | {
    showSettings: boolean | {};
    setShowSettings: Dispatch<SetStateAction<boolean | {}>>;
    userProfile: UserProfileObjectType;
    setUserProfile: Dispatch<SetStateAction<UserProfileObjectType>>;
    popup: PopupObjectType;
    setPopup: Dispatch<SetStateAction<PopupObjectType>>;
    fixedLayer: null | FixedLayerObjectType;
    setFixedLayer: (content: null | FixedLayerObjectType) => void;
};

// SettingsProvider

type UserSettingsObjectType = null | {
    language: string;
    microphone: boolean;
    sound: boolean;
    camera: boolean;
    notifications: boolean;
    appearance: string;
    font: string;
    theme: string;
    friendTab: 'all' | 'online' | 'add' | 'pending' | 'blocked';
    sendButton: boolean;
    showUsers: boolean;
};

type UserSettingsContextValueType = null | {
    userSettings: UserSettingsObjectType;
    setUserSettings: Dispatch<SetStateAction<UserSettingsObjectType>>;
};
