//#//#//#//#//#//#//
// Database Types //
//#//#//#//#//#//#//

type UserType = {
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
    status: 'Online' | 'Offline' | 'Idle' | 'Do Not Disturb' | 'Invisible';
    system: boolean;
    verified: boolean;
    notifications: {
        type?: string;
        message?: string;
        channel?: string;
        count?: number;
        new?: boolean;
    }[];

    guildIds: string[];
    guilds?: GuildType[];

    channelIds: string[];
    channels?: ChannelType[];

    friendIds: string[];
    friends?: User[];

    requestReceivedIds: string[];
    requestsReceived?: User[];

    requestSentIds: string[];
    requestsSent?: User[];

    blockedUserIds: string[];
    blockedUsers?: User[];

    createdAt: DateTime;
};

type ChannelType = {
    id: string;
    recipientIds: UserType.id[];
    recipients: UserType[];
    type: 'DM' | 'GROUP_DM' | 'GUILD_TEXT' | 'GUILD_VOICE' | 'GUILD_CATEGORY';
    guild?: GuildType.id;
    position?: number;
    name?: string;
    topic?: string;
    nsfw?: boolean;
    icon?: string;
    ownerId?: UserType.id;
    owner?: UserType;
    rateLimit?: number;
    permissions?: string[];
    parent?: ChannelType.id;
    messageIds: MessageType.id[];
    messages: MessageType[];
    pinnedMessageIds: MessageType.id[];
    pinnedMessages: MessageType[];
    createdAt: Date;
};

type GuildType = {
    id: string;
    name: string;
    icon: string;
    banner?: string;
    memberIds: UserType.id[];
    members: UserType[];
    channelIds: ChannelType.id[];
    channels: ChannelType[];
    ownerId: string;
    owner: UserType;
    createdAt: DateTime;
    updatedAt: DateTime;
};

enum MessageTypes {
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

type EmbedType = {
    author?: {
        name: string;
        url: string;
        icon: string;
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
        icon: string;
    };
    color?: string;
    timestamp?: Date;
};

type ReactionType = {
    id: string;
    guildId: GuildType.id;
    count: number;
    me: boolean;
};

type RoleType = {
    id: string;
    guildId: GuildType.id;
    name: string;
    color: string;
    hoist: boolean;
    position: number;
    permissions: string[];
    mentionable: boolean;
};

type MessageType = {
    id: string;
    type: MessageTypes;
    content: string;
    attachments: File[];
    embeds: EmbedType[];
    messageReferenceId?: MessageType.id;
    messageReference?: MessageType;
    edited: boolean;
    pinned: boolean;
    reactionIds: ReactionType.id[];
    reactions: ReactionType[];
    mentionEveryone: boolean;
    mentionChannelIds: ChannelType.id[];
    mentionRoleIds: RoleType.id[];
    mentionUserIds: UserType.id[];

    authorId: UserType.id;
    author: UserType;

    channelId: ChannelType.id;
    channel: ChannelType;

    createdAt: Date;
    updatedAt: Date;

    // Not in database
    waiting?: boolean;
    error?: boolean;
};

type MessageEditObject =
    | {}
    | {
          messageId: string;
          content: string;
      };

type MessageReplyObject =
    | {}
    | {
          channelId: string;
          messageId: string;
          author: UserType;
      };

//#//#//#//#//#//#//
// Context. Types //
//#//#//#//#//#//#//

// AuthProvider

type AuthObjectType = null | {
    user: UserType;
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

//#//#//#//#//#//#//
// Context. Types //
//#//#//#//#//#//#//
