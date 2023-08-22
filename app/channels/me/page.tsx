import { AppHeader, UserChannels } from '@components';
import { useUser, getChannels, getRequests, getBlocked, getFriends } from '@/lib/auth';
import styles from './FriendsPage.module.css';
import { Metadata } from 'next';
import Content from './Content';
import Aside from './Aside';

export const metadata: Metadata = {
    title: 'Chat App | Friends',
};

const FriendsPage = async () => {
    const user = (await useUser()) as TCleanUser;
    const channels = await getChannels();

    const friends = await getFriends();
    const requestsReceived = await getRequests(0);
    const requestsSent = await getRequests(1);
    const blockedUsers = await getBlocked();

    return (
        <>
            <UserChannels
                user={user}
                channels={channels}
            />

            <div className={styles.main}>
                <AppHeader />

                <div className={styles.content}>
                    <Content
                        data={{
                            friends,
                            requestsReceived,
                            requestsSent,
                            blockedUsers,
                        }}
                    />
                    <Aside />
                </div>
            </div>
        </>
    );
};

export default FriendsPage;
