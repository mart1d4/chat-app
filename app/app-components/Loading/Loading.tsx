'use client';

import useContextHook from '@/hooks/useContextHook';
import { ReactElement, useEffect } from 'react';

type Props = {
    children: ReactElement;
    user: TCleanUser;
};

const Loading = ({ children, user }: Props): ReactElement => {
    const { setAuth }: any = useContextHook({ context: 'auth' });

    useEffect(() => {
        const setAuthContext = async () => {
            // const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/refresh`, {
            //     method: 'GET',
            //     credentials: 'include',
            // }).then((res) => res.json());

            setAuth({
                user: user,
                // token: response.token,
                token: '',
            });
        };

        setAuthContext();
    }, []);

    return (
        <div
            onDrag={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            onDragEnd={(e) => e.preventDefault()}
            onDragOver={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
        >
            {children}
        </div>
    );
};

export default Loading;
