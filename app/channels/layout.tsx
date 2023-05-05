import { AppNav, Channels } from '@/app/app-components';
import { ReactElement, ReactNode } from 'react';
import styles from './Layout.module.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Chat App | Friends',
};

const Layout = ({ children }: { children: ReactNode }): ReactElement => {
    return (
        <div
            className={styles.appContainer}
            // onDragStart={(e) => e.preventDefault()}
            // onContextMenu={(e) => e.preventDefault()}
        >
            <AppNav />
            {/* <Settings />
            <UserProfile />
            <Popup />
            <FixedLayer /> */}

            <div className={styles.appWrapper}>
                <div className={styles.channelsContainer}>
                    {/* @ts-expect-error Server Component */}
                    <Channels />

                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
