import { createContext, useState } from 'react';

export const UserDataContext = createContext({});

export function UserDataProvider({ children }) {
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [blocked, setBlocked] = useState([]);
    const [channels, setChannels] = useState([]);

    const value = {
        friends,
        setFriends,
        requests,
        setRequests,
        blocked,
        setBlocked,
        channels,
        setChannels,
    };

    return (
        <UserDataContext.Provider value={value}>
            {children}
        </UserDataContext.Provider>
    );
}
