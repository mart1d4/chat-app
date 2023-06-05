import { getChannels } from '@/lib/api-functions/channels';
import styles from './Channels.module.css';
import UserSection from './UserSection';
import { ReactElement } from 'react';
import { v4 as uuidv4 } from 'uuid';
import UserItem from './UserItem';
import Title from './Title';

const Channels = async (): Promise<ReactElement> => {
    const channels: ChannelType[] = await getChannels();

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

                        {channels?.length ? (
                            channels?.map((channel) => (
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
