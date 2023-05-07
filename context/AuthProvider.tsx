'use client';

import { ReactElement, ReactNode, createContext, useState } from 'react';

export const AuthContext = createContext<AuthContextValueType>(null);

const AuthProvider = ({ children }: { children: ReactNode }): ReactElement => {
    const [auth, setAuth] = useState<AuthObjectType>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const value: AuthContextValueType = {
        auth,
        setAuth,
        isLoading,
        setIsLoading,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export default AuthProvider;
