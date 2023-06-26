'use client';

import { ReactElement, useState, useEffect, useMemo } from 'react';
import useContextHook from '@/hooks/useContextHook';
import ChannelContent from './ChannelContent';
import { useRouter } from 'next/navigation';

const ChannelPage = ({ params }: { params: { channelId: string } }): ReactElement => {
    const [channel, setChannel] = useState<ChannelType | null>(null);

    const { auth }: any = useContextHook({ context: 'auth' });
    const router = useRouter();

    useEffect(() => {
        const channel: ChannelType | undefined = auth.user.channels?.find(
            (channel: ChannelType) => channel.id === params.channelId
        );

        if (!channel) {
            router.push('/channels/me');
            return;
        }

        let name = channel?.name;
        if (channel.type === 'DM') {
            const user = channel.recipients.find((user: any) => user.id !== auth.user.id) as UserType;
            name = user.username;
        } else if (channel.type === 'GROUP_DM' && !channel.name) {
            if (channel.recipients.length > 1) {
                const filtered = channel.recipients.filter((user: any) => user.id !== auth.user.id);
                name = filtered.map((recipient: any) => recipient.username).join(', ');
            } else {
                name = `${channel.recipients[0].username}'s Group`;
            }
        }

        let src = channel?.icon;
        if (channel.type === 'DM') {
            const user = channel.recipients.find((user: any) => user.id !== auth.user.id) as UserType;
            src = user.avatar;
        }

        setChannel({
            ...channel,
            name: name,
            icon: src,
        });
    }, [params.channelId]);

    return useMemo(() => {
        return <ChannelContent channel={channel} />;
    }, [channel]);
};

export default ChannelPage;
