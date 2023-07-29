'use client';

import { ReactNode, createContext, useState } from 'react';

export const AuthContext = createContext<AuthProviderValue | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [auth, setAuth] = useState<TAuth>({
        user: {
            id: '999',
            username: 'mart1d4',
            email: '',
            avatar: '',
            primaryColor: '#000000',
            accentColor: '#000000',
            description: '',
            createdAt: '',
            updatedAt: '',
            displayName: '',
        },
    });

    return <AuthContext.Provider value={{ auth, setAuth } as AuthProviderValue}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
