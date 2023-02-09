import { createContext, useState } from 'react';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState({});
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [blocked, setBlocked] = useState([]);
    const [channels, setChannels] = useState([]);
    const [erros, setErros] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    const value = {
        auth,
        setAuth,
        friends,
        setFriends,
        requests,
        setRequests,
        blocked,
        setBlocked,
        channels,
        setChannels,
        erros,
        setErros,
        isLoading,
        setIsLoading,
        showSettings,
        setShowSettings,
        userProfile,
        setUserProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
