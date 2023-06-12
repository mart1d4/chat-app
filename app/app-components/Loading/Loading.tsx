'use client';

import useContextHook from '@/hooks/useContextHook';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Loading.module.css';

type Props = {
    children: ReactNode;
};

// If auth is loading, show loading screen
// If auth is not loading, check if user is logged in
// If user is not logged in, redirect to login page
// If user is logged in, show children

const Loading = ({ children }: Props): ReactNode => {
    const { auth, loading }: any = useContextHook({ context: 'auth' });

    useEffect(() => {
        if (!loading && !auth?.accessToken) {
            useRouter().push('/login');
        }
    }, [loading]);

    if (loading) {
        return (
            <div className={styles.container}>
                <video
                    autoPlay
                    loop
                >
                    <source
                        src='/assets/app/spinner.webm'
                        type='video/webm'
                    />
                </video>
            </div>
        );
    }

    return (
        <div
            onDragStart={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
        >
            {children}
        </div>
    );
};

export default Loading;
