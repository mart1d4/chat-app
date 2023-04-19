export default function cleanUser(user) {
    return {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        banner: user.banner || null,
        description: user.description || null,
        customStatus: user.customStatus || null,
        status: user.status,
        accentColor: user.accentColor,
        createdAt: user.createdAt,
        system: user.system,
        verified: user.verified,
        friends: user.friends,
        channels: user.channels,
        guilds: user.guilds,
    }
};
