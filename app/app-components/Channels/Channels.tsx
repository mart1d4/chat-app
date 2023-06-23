'use client';

import useContextHook from '@/hooks/useContextHook';
import { ReactElement, useMemo } from 'react';
import styles from './Channels.module.css';
import UserSection from './UserSection';
import { v4 as uuidv4 } from 'uuid';
import UserItem from './UserItem';
import Title from './Title';

const Channels = (): ReactElement => {
    const { auth }: any = useContextHook({ context: 'auth' });
    const channels = auth.user.channels.map((channel: any) => {
        let name = channel.name;
        if (channel.type === 'DM') {
            const user = channel.recipients.find((user: any) => user.id !== auth.user.id);
            name = user.username;
        } else if (channel.type === 'GROUP_DM' && !channel.name) {
            if (channel.recipients.length > 1) {
                const filtered = channel.recipients.filter((user: any) => user.id !== auth.user.id);
                name = filtered.map((recipient: any) => recipient.username).join(', ');
            } else {
                name = `${channel.recipients[0].username}'s Group`;
            }
        }

        return { ...channel, name };
    });

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

                        {channels?.length > 0 ? (
                            <ChannelList channels={channels} />
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

const ChannelList = ({ channels }: any): ReactElement => {
    return useMemo(() => {
        return channels.map((channel: any) => (
            <UserItem
                key={uuidv4()}
                channel={channel}
            />
        ));
    }, [channels]);
};

export default Channels;
