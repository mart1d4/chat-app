import { AppHeader, UserChannels } from '@/app/app-components';
import { getUser, getChannels } from '@/lib/auth';
import styles from './FriendsPage.module.css';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import Content from './Content';
import Aside from './Aside';

export const metadata: Metadata = {
    title: 'Chat App | Friends',
};

const FriendsPage = async () => {
    const user = await getUser();
    const channels = await getChannels();

    if (!user) {
        redirect('/login');
    }

    return (
        <>
            <UserChannels
                user={user}
                channels={channels}
            />

            <div className={styles.main}>
                <AppHeader />

                <div className={styles.content}>
                    <Content />
                    <Aside />
                </div>
            </div>
        </>
    );
};

export default FriendsPage;
