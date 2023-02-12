import { createContext, useState } from 'react';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const value = {
        auth,
        setAuth,
        isLoading,
        setIsLoading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
