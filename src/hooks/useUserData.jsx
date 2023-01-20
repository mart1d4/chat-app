import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";

export default function useUserData() {
    const {
        auth,
        setAuth,
        friends,
        setFriends,
        getFriends,
        friendRequests,
        setFriendRequests,
        getFriendRequests,
        blockedUsers,
        setBlockedUsers,
        getBlockedUsers,
        channelList,
        setChannelList,
        getChannelList,
        persist,
        setPersist,
        loading,
        setLoading,
    } = useContext(AuthContext);
    return useContext(AuthContext);
}
