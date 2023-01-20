import { createContext, useState } from 'react';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState({});
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [channelList, setChannelList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const value = {
        auth,
        setAuth,
        friends,
        setFriends,
        friendRequests,
        setFriendRequests,
        blockedUsers,
        setBlockedUsers,
        channelList,
        setChannelList,
        isLoading,
        setIsLoading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}