import { createContext, useState, useEffect } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState({});
    const [friends, setFriends] = useState([]);
    const [friendRequestsSent, setFriendRequestsSent] = useState([]);
    const [friendRequestsReceived, setFriendRequestsReceived] = useState([]);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [channels, setChannels] = useState([]);
    const [persist, setPersist] = useState(true);

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        if (!auth?.accessToken) return;

        getFriends();
        getFriendRequestsSent();
        getFriendRequestsReceived();
        getBlockedUsers();
        getChannels();
    }, [auth]);

    const getFriends = async () => {
        const res = await axiosPrivate.get(`/users/${auth?.user?._id}/friends`);
        setFriends(res.data);
    };

    const getFriendRequestsSent = async () => {
        const res = await axiosPrivate.get(`/users/${auth?.user?._id}/friends/sent`);
        setFriendRequestsSent(res.data);
    };

    const getFriendRequestsReceived = async () => {
        const res = await axiosPrivate.get(`/users/${auth?.user?._id}/friends/received`);
        setFriendRequestsReceived(res.data);
    };

    const getBlockedUsers = async () => {
        const res = await axiosPrivate.get(`/users/${auth?.user?._id}/friends/blocked`);
        setBlockedUsers(res.data);
    };

    const getChannels = async () => {
        const res = await axiosPrivate.get(`/users/${auth?.user?._id}/channels`);
        setChannels(res.data);
    };

    const value = {
        auth,
        setAuth,
        friends,
        setFriends,
        getFriends,
        friendRequestsSent,
        setFriendRequestsSent,
        getFriendRequestsSent,
        friendRequestsReceived,
        setFriendRequestsReceived,
        getFriendRequestsReceived,
        blockedUsers,
        setBlockedUsers,
        getBlockedUsers,
        channels,
        setChannels,
        getChannels,
        persist,
        setPersist
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
