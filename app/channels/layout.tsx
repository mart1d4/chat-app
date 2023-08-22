import { AppNav, Settings, UserProfile, Layers, Tooltip, Loading } from '@components';
import { getFriends, getGuilds, useUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import styles from './Layout.module.css';
import { ReactElement } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Chat App | Friends',
};

const Layout = async ({ children }: { children: ReactElement }) => {
    const user = await useUser();
    if (!user) return redirect('/login');

    const guilds = await getGuilds();
    const friends = await getFriends();

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
                    <Settings />
                    <Layers friends={friends} />
                    <Tooltip />
                </div>
            </div>
        </Loading>
    );
};

export default Layout;
