'use client';

import useAuthSWR from '@/hooks/useAuthSWR';
import styles from './Channels.module.css';
import UserSection from './UserSection';
import { ReactElement } from 'react';
import { v4 as uuidv4 } from 'uuid';
import UserItem from './UserItem';
import Title from './Title';

const Channels = (): ReactElement => {
    const { data, isLoading } = useAuthSWR('/users/me/channels');

    return (
        <div className={styles.nav}>
            <div className={styles.privateChannels}>
                <div className={styles.searchContainer}>
                    <button className={styles.searchButton}>Find or start a conversation</button>
                </div>

                <div className={styles.scroller + ' scrollbar'}>
                    <ul className={styles.channelList}>
                        <div></div>

                        <UserItem special />

                        <Title />

                        {data?.channels?.length > 0 && !isLoading ? (
                            data.channels.map((channel: any) => (
                                <UserItem
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
