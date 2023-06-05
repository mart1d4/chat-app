import {
    AppNav,
    Channels,
    Settings,
    UserProfile,
    Popup,
    FixedLayer,
    Loading,
} from '@/app/app-components';
import { ReactElement, ReactNode } from 'react';
import styles from './Layout.module.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Chat App | Friends',
};

const Layout = ({ children }: { children: ReactNode }): ReactElement => {
    return (
        // @ts-expect-error
        <Loading>
            <div className={styles.appContainer}>
                <AppNav />

                <Popup />
                <Settings />
                <FixedLayer />
                <UserProfile />

                <div className={styles.appWrapper}>
                    {/* <div className={styles.channelsContainer}>
                        @ts-expect-error Server Component
                        <Channels />

                        {children}
                    </div> */}
                </div>
            </div>
        </Loading>
    );
};

export default Layout;
