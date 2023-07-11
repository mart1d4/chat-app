'use client';

import { ReactElement, ReactNode, createContext, useState, Dispatch, SetStateAction } from 'react';

export const AuthContext = createContext<AuthProviderValue | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }): ReactElement => {
    const [auth, setAuth] = useState<TAuth>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const value: AuthProviderValue = {
        auth,
        setAuth,
        loading,
        setLoading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
