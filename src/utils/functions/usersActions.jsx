import useUserData from "../../hooks/useUserData";
import { useRouter } from "next/router";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const userActions = ({ action, userID, setError }) => {
    const {
        auth,
        setFriends,
        setFriendRequests,
        setBlockedUsers,
    } = useUserData();
    const axiosPrivate = useAxiosPrivate();
    const router = useRouter();

    const removeFriend = async (auth, userID) => {
        try {
            const data = await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/remove`,
                { userID }
            );
            if (data.data.error) {
                setError(data.data.error);
            } else {
                setFriends(friends.filter((friend) => friend._id.toString() !== userID));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const blockUser = async (auth, userID) => {
        try {
            const data = await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/block`,
                { userID }
            );
            if (data.data.error) {
                setError(data.data.error);
            } else {
                setFriends(friends.filter((friend) => friend._id.toString() !== userID));
                setBlockedUsers((prev) => [...prev, data.data.user]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const startConversation = async (auth, userID) => {
        try {
            const data = await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/create`,
                { userID }
            );
            if (data.data.error) {
                setError(data.data.error);
            } else {
                router.push(`/channels/@me/${data.data.channelID}`);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const cancelRequest = async (auth, userID) => {
        try {
            const data = await axiosPrivate.post(
                `/users/${auth?.user?._id}/friends/cancel`,
                { userID },
            );
            if (data.data.error) {
                setError(data.data.error);
            } else {
                setFriendRequests(
                    friendRequests.filter((request) => request._id.toString() !== userID)
                );
            }
        } catch (err) {
            console.error(err);
        }
    };

    const acceptRequest = async (auth, userID) => {
        try {
            const data = await axiosPrivate.post(
                `/users/${auth?.user?._id}/friends/accept`,
                { userID },
            );
            if (data.data.error) {
                setError(data.data.error);
            } else {
                setFriendRequests(
                    friendRequests.filter((request) => request._id.toString() !== userID)
                ); userID
                setFriends([...friends, data.data.user]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const ignoreRequest = async (auth, userID) => {
        try {
            const data = await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/ignore`,
                { userID },
            );
            if (data.data.error) {
                setError(data.data.error);
            } else {
                setFriendRequests(
                    friendRequests.filter((request) => request._id.toString() !== userIDD)
                );
            }
        } catch (err) {
            console.error(err);
        }
    };

    const unblockUser = async (auth, userID) => {
        try {
            const data = await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/unblock`,
                { userID }
            );
            if (data.data.error) {
                setError(data.data.error);
            } else {
                setBlockedUsers(blockedUsers.filter((user) => user._id.toString() !== userID));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const actions = {
        remove: removeFriend,
        block: blockUser,
        start: startConversation,
        cancel: cancelRequest,
        accept: acceptRequest,
        ignore: ignoreRequest,
        unblock: unblockUser
    };

    return actions[action](
        auth,
        userID,
        setError,
        setFriends,
        setFriendRequests,
        setBlockedUsers,
        router,
    );
}

export default userActions;
