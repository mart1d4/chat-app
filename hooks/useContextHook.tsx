'use client';

import { AuthContext } from '@/context/AuthProvider';
import { useContext } from 'react';

const useContextHook = ({ context }: { context: string }) => {
    if (context === 'auth') {
        const { auth, setAuth, isLoading, setIsLoading }: AuthContextType =
            useContext<AuthContextType>(AuthContext);
        return { auth, setAuth, isLoading, setIsLoading };
    }

    return null;
};

export default useContextHook;
