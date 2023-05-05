import UserListItemSmall from './UserListItemSmall';
import styles from './Channels.module.css';
import UserSection from './UserSection';
import { ReactElement } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Title from './Title';
import { axiosPrivate } from '@/lib/axios';
// import { cookies } from 'next/headers';

const getChannels = async (): Promise<ChannelType[]> => {
    // const cookieStore = cookies();
    // const token = cookieStore.get('token')?.value;

    // if (!token) {
    //     throw new Error('No token found');
    // }

    const res = await axiosPrivate.get('/users/me/channels', {
        headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzZGRkZTExZGFlYWFlOGM2ZTY4ZDQzYiIsImlhdCI6MTY4MzIzNTE5NywiZXhwIjoxNjgzMzIxNTk3fQ.6BRqaolenkv49djM08YTqdrPP2vU3eoq4s46k-bQOrY`,
        },
    });

    console.log(res);

    if (!res.data.success) {
        throw new Error('Failed to fetch data');
    }

    return res.data.channels;
};

const Channels = async (): Promise<ReactElement> => {
    const channels: ChannelType[] = await getChannels();

    return (
        <div className={styles.nav}>
            <div className={styles.privateChannels}>
                <div className={styles.searchContainer}>
                    <button className={styles.searchButton}>
                        Find or start a conversation
                    </button>
                </div>

                <div className={styles.scroller + ' scrollbar'}>
                    <ul className={styles.channelList}>
                        <div></div>

                        <UserListItemSmall special />

                        <Title />

                        {channels?.length ? (
                            channels?.map((channel) => (
                                <UserListItemSmall
                                    key={uuidv4()}
                                    channel={channel}
                                />
                            ))
                        ) : (
                            <img
                                src='/assets/app/no-channels.svg'
                                alt='No Channels'
                            />
                        )}
                    </ul>
                </div>
            </div>

            <UserSection />
        </div>
    );
};

export default Channels;
