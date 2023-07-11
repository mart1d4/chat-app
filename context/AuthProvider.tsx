'use client';

import { ReactElement, ReactNode, createContext, useState, Dispatch, SetStateAction } from 'react';

type TAuth = null | {
    user: TCleanUser;
    accessToken: string;
};

type ProviderValue = {
    auth: TAuth;
    setAuth: Dispatch<SetStateAction<TAuth>>;
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
};

export const AuthContext = createContext<ProviderValue | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }): ReactElement => {
    const [auth, setAuth] = useState<TAuth>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const value: ProviderValue = {
        auth,
        setAuth,
        loading,
        setLoading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
