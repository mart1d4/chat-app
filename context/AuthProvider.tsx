'use client';

import { ReactElement, ReactNode, createContext, useState } from 'react';

export const AuthContext = createContext<AuthContextType>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }): ReactElement => {
    const [auth, setAuth] = useState<AuthObjectType>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const value: AuthContextType = {
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
