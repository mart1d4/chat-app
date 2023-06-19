import {
    AppNav,
    Channels,
    Settings,
    UserProfile,
    Popup,
    FixedLayer,
    Loading,
    TooltipLayer,
} from '@/app/app-components';
import { ReactElement, ReactNode } from 'react';
import styles from './Layout.module.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Chat App | Friends',
};

const Layout = ({ children }: { children: ReactNode }): ReactElement => {
    return (
        <Loading>
            <div className={styles.appContainer}>
                <AppNav />

                <Popup />
                <Settings />
                <FixedLayer />
                <UserProfile />
                <TooltipLayer />

                <div className={styles.appWrapper}>
                    <div className={styles.channelsContainer}>
                        <Channels />
                        {children}
                    </div>
                </div>
            </div>
        </Loading>
    );
};

export default Layout;
