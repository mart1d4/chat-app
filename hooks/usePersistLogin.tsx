'use client';

import useRefreshToken from './useRefreshToken';
import useContextHook from './useContextHook';
import { useEffect, ReactNode } from 'react';

const PersistLogin = ({ children }: { children: ReactNode }): ReactNode => {
    const refresh = useRefreshToken();
    const { auth, setLoading }: any = useContextHook({
        context: 'auth',
    });

    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            const response = await refresh();
            isMounted && setLoading(false);
            response?.error && setLoading(false);
        };

        !auth?.accessToken ? verifyRefreshToken() : setLoading(false);

        return () => {
            isMounted = false;
        };
    }, []);

    return children;
};

export default PersistLogin;
