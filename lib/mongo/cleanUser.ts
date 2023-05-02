const cleanUser = (user: UncleanUserType): UserType => {
    return {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        banner: user.banner,
        description: user.description,
        customStatus: user.customStatus,
        status: user.status,
        accentColor: user.accentColor,
        system: user.system,
        verified: user.verified,
        requests: user.requests,
        friends: user.friends,
        blocked: user.blocked,
        channels: user.channels,
        guilds: user.guilds,
        createdAt: user.createdAt,
    }
};

export default cleanUser;
