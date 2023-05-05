// import { AppHeader, UserLists, AddFriend, Aside } from '@/app/app-components';
import styles from './FriendsPage.module.css';
import { ReactElement } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Chat App | Friends',
};

const FriendsPage = (): ReactElement => {
    // const [content, setContent] = useState('online');

    // useEffect(() => {
    //     setContent(localStorage.getItem('friends-tab') || 'online');

    //     localStorage.setItem('channel-url', '/channels/@me');
    // }, []);

    // const handleContent = (content: any) => {
    //     setContent(content);
    //     localStorage.setItem('friends-tab', content);
    // };

    // const { friends, requests, blocked }: any = [];

    // const lists = {
    //     online: friends?.filter((friend: any) => {
    //         return ['Online', 'Idle', 'Do Not Disturb'].includes(
    //             friend?.status
    //         );
    //     }),
    //     all: friends,
    //     pending: requests,
    //     blocked: blocked,
    // };

    return (
        <div className={styles.main}>
            {/* <AppHeader
                setContent={handleContent}
                content={content}
            />

            <div className={styles.content}>
                {content === 'add' ? (
                    <AddFriend />
                ) : (
                    <UserLists
                        list={lists[content]}
                        content={content}
                    />
                )}

                <Aside />
            </div> */}
        </div>
    );
};

export default FriendsPage;
