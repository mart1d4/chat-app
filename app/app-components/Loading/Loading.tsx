'use client';

import useContextHook from '@/hooks/useContextHook';
import { ReactElement, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Loading.module.css';

type Props = {
    children: ReactElement;
};

// If auth is loading, show loading screen
// If auth is not loading, check if user is logged in
// If user is not logged in, redirect to login page
// If user is logged in, show children

const Loading = ({ children }: Props): ReactElement => {
    const { auth, loading }: any = useContextHook({ context: 'auth' });
    const router = useRouter();

    useEffect(() => {
        if (!loading && !auth?.accessToken) {
            router.push('/login');
        }
    }, [auth, loading]);

    if (auth?.accessToken && !loading) {
        return children;
    }

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
};

export default Loading;
