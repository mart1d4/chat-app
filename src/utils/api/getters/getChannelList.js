import User from "../../models/User";

const getChannelList = async (userID) => {
    if (!userID) return { error: "No user ID provided" };

    const user = await User.findById(userID).populate("privateChannels").populate({
        path: "privateChannels",
        populate: {
            path: "members",
            model: "User",
        },
    });
    if (!user) return { error: "No user found" };

    const channelList = user.privateChannels;
    if (!channelList) return { error: "No channels found" };

    // Clean the users so there's no sensitive data being sent
    const cleanChannelList = channelList.map((channel) => {
        const cleanChannel = {
            _id: channel._id,
            members: channel.members.map((member) => {
                const cleanMember = {
                    _id: member._id,
                    username: member.username,
                    avatar: member.avatar,
                    description: member.description,
                    customStatus: member.customStatus,
                    status: member.status,
                    createdAt: member.createdAt,
                };
                return cleanMember;
            }).filter((member) => member._id.toString() !== userID.toString()),
        };
        return cleanChannel;
    });

    return cleanChannelList;
};

export default getChannelList;
