'use client';

import { ReactElement, useEffect, useRef } from 'react';
import useContextHook from '@/hooks/useContextHook';
import styles from './Loading.module.css';

type Props = {
    children: ReactElement;
    user: TCleanUser;
};

export const Loading = ({ children, user }: Props): ReactElement => {
    const { auth, setAuth }: any = useContextHook({ context: 'auth' });
    const hasRendered = useRef(false);

    useEffect(() => {
        const env = process.env.NODE_ENV;

        const setAuthContext = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/refresh`, {
                method: 'GET',
                credentials: 'include',
            }).then((res) => res.json());

            if (!response.token) return;

            setAuth({
                user: user,
                token: response.token,
            });
        };

        if (env == 'development') {
            if (hasRendered.current) {
                setAuthContext();
            }

            return () => {
                hasRendered.current = true;
            };
        } else if (env == 'production') {
            setAuthContext();
        }
    }, []);

    return (
        <div
            onDrag={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            onDragEnd={(e) => e.preventDefault()}
            onDragOver={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
        >
            {auth?.user && auth?.token ? (
                children
            ) : (
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

                    <div className={styles.textContent}>
                        <div className='smallTitle'>Did you know</div>
                        <div>
                            Use{' '}
                            <div className='keybind'>
                                <span>CTRL /</span>
                            </div>{' '}
                            to bring up the list of keyboard shortcuts.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
