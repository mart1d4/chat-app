const cleanUser = (user: UserType): CleanUserType => {
    return {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        banner: user.banner,
        primaryColor: user.primaryColor,
        accentColor: user.accentColor,
        description: user.description,
        customStatus: user.customStatus,
        status: user.status,
        system: user.system,
        verified: user.verified,
        notifications: user.notifications,

        guildIds: user.guildIds,
        guilds: user.guilds,

        ownedGuildIds: user.ownedGuildIds,
        ownedGuilds: user.ownedGuilds,

        channelIds: user.channelIds,
        channels: user.channels,

        ownedChannelIds: user.ownedChannelIds,
        ownedChannels: user.ownedChannels,

        friendIds: user.friendIds,
        friends: user.friends,

        requestReceivedIds: user.requestReceivedIds,
        requestsReceived: user.requestsReceived,

        requestSentIds: user.requestSentIds,
        requestsSent: user.requestsSent,

        blockedUserIds: user.blockedUserIds,
        blockedUsers: user.blockedUsers,

        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};

const cleanOtherUser = (user: UserType): CleanOtherUserType => {
    return {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        banner: user.banner,
        primaryColor: user.primaryColor,
        accentColor: user.accentColor,
        description: user.description,
        customStatus: user.customStatus,
        status: user.status,
        system: user.system,

        guildIds: user.guildIds,
        channelIds: user.channelIds,
        friendIds: user.friendIds,

        createdAt: user.createdAt,
    };
};

export { cleanUser, cleanOtherUser };
