'use client';

import { ReactNode, createContext, useState } from 'react';

export const AuthContext = createContext<AuthProviderValue | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [auth, setAuth] = useState<TAuth>(null);

    return <AuthContext.Provider value={{ auth, setAuth } as AuthProviderValue}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
