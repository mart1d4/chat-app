'use client';

import useRefreshToken from './useRefreshToken';
import useContextHook from './useContextHook';
import { useEffect, ReactNode } from 'react';

const PersistLogin = ({ children }: { children: ReactNode }): ReactNode => {
    const refresh = useRefreshToken();
    const { auth, setLoading }: any = useContextHook({ context: 'auth' });

    useEffect(() => {
        setLoading(true);

        const verifyRefreshToken = async () => {
            await refresh();
            setLoading(false);
        };

        !auth?.accessToken ? verifyRefreshToken() : setLoading(false);
    }, []);

    return children;
};

export default PersistLogin;
