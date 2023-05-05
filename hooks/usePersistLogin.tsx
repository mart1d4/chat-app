'use client';

import useRefreshToken from './useRefreshToken';
import useContextHook from './useContextHook';
import { useEffect, ReactElement } from 'react';

const PersistLogin = ({
    children,
}: {
    children: ReactElement;
}): ReactElement => {
    const refresh = useRefreshToken();
    const { auth, setIsLoading }: any = useContextHook({
        context: 'auth',
    });

    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            const response = await refresh();
            isMounted && setIsLoading(false);
            response?.error && setIsLoading(false);
        };

        !auth?.accessToken ? verifyRefreshToken() : setIsLoading(false);

        return () => {
            isMounted = false;
        };
    }, []);

    return children;
};

export default PersistLogin;
