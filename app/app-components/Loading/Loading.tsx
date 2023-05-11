'use client';

import useContextHook from '@/hooks/useContextHook';
import { useRouter } from 'next/navigation';
import styles from './Loading.module.css';
import { ReactNode } from 'react';

type Props = {
    children: ReactNode;
};

// If auth is loading, show loading screen
// If auth is not loading, check if user is logged in
// If user is not logged in, redirect to login page
// If user is logged in, show children

const Loading = ({ children }: Props): ReactNode => {
    const { auth, loading }: any = useContextHook({
        context: 'auth',
    });

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

    if (!auth?.accessToken) {
        const router = useRouter();
        router.push('/login');
        return <div></div>;
    }

    return children;
};

export default Loading;
