'use client';

import { ReactElement, ReactNode, createContext, useState } from 'react';

export const AuthContext = createContext<AuthContextValueType>(null);

const AuthProvider = ({ children }: { children: ReactNode }): ReactElement => {
    const [auth, setAuth] = useState<AuthObjectType>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const value: AuthContextValueType = {
        auth,
        setAuth,
        loading,
        setLoading,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export default AuthProvider;
