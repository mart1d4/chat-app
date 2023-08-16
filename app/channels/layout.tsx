import { AppNav, Settings, UserProfile, Popup, FixedLayer, Tooltip, Loading } from '@components';
import { getGuilds, getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import styles from './Layout.module.css';
import { ReactNode } from 'react';
import { Metadata } from 'next';
import { headers } from 'next/headers';

export const metadata: Metadata = {
    title: 'Chat App | Friends',
};

const Layout = async ({ children }: { children: ReactNode }) => {
    const user = await getUser();
    const guilds = await getGuilds();

    console.log(headers().get('Authorization'));

    if (!user) return redirect('/login');

    return (
        <Loading user={user}>
            <div className={styles.appContainer}>
                <AppNav
                    user={user}
                    guilds={guilds}
                />

                <div className={styles.appWrapper}>
                    <div className={styles.channelsContainer}>{children}</div>
                </div>

                <div className={styles.layers}>
                    <Popup />
                    <Settings />
                    <FixedLayer />
                    <UserProfile />
                    <Tooltip />
                </div>
            </div>
        </Loading>
    );
};

export default Layout;
