import { useContext } from "react";
import { UserDataContext } from "../context/UserDataProvider";

export default function useUserData() {
    const {
        friends,
        setFriends,
        requests,
        setRequests,
        blocked,
        setBlocked,
        channels,
        setChannels,
    } = useContext(UserDataContext);
    return useContext(UserDataContext);
}
