import { createContext, useState, useEffect } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState({});
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [channelList, setChannelList] = useState([]);
    const [persist, setPersist] = useState(true);

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        if (!auth?.accessToken) return;

        getFriends();
        getFriendRequests();
        getBlockedUsers();
        getChannelList();
    }, [auth]);

    const getFriends = async () => {
        const res = await axiosPrivate.get(`/users/${auth?.user?._id}/friends`);
        setFriends(res.data);
    };

    const getFriendRequests = async () => {
        const res = await axiosPrivate.get(`/users/${auth?.user?._id}/friendRequests`);
        setFriendRequests(res.data);
    };

    const getBlockedUsers = async () => {
        const res = await axiosPrivate.get(`/users/${auth?.user?._id}//blocked`);
        setBlockedUsers(res.data);
    };

    const getChannelList = async () => {
        const res = await axiosPrivate.get(`/users/${auth?.user?._id}/private/channels`);
        setChannelList(res.data);
    };

    const value = {
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
        setPersist
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
