import UserListItemSmall from './UserListItemSmall';
import styles from './Channels.module.css';
import UserSection from './UserSection';
import { ReactElement } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Title from './Title';
import { axiosPrivate } from '@/lib/axios';

const getChannels = async (): Promise<ChannelType[]> => {
    const res = await axiosPrivate.get('/users/me/channels', {
        headers: {
            Authorization: `Bearer `,
        },
    });

    if (!res.data.success) {
        console.log(res.data.message);
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
