'use client';

import { ReactElement, useState, useEffect, useMemo } from 'react';
import useContextHook from '@/hooks/useContextHook';
import ChannelContent from './ChannelContent';
import { useRouter } from 'next/navigation';
import { getChannelName } from '@/lib/strings';

const ChannelPage = ({ params }: { params: { channelId: string } }): ReactElement => {
    const [channel, setChannel] = useState<TChannel | null>(null);

    const { auth }: any = useContextHook({ context: 'auth' });
    const router = useRouter();

    useEffect(() => {
        const channel: TChannel | undefined = auth.user.channels?.find(
            (channel: TChannel) => channel.id === params.channelId
        );

        if (!channel) {
            const channelId = localStorage.getItem('channel-url');

            if (channelId) router.push(`/channels/me/${channelId}`);
            else router.push('/channels/me');

            return;
        }

        let name = getChannelName(channel, auth.user.id);

        let src = channel?.icon;
        if (channel.type === 'DM') {
            const user = channel.recipients.find((user: any) => user.id !== auth.user.id) as TUser;
            src = user.avatar;
        }

        setChannel({
            ...channel,
            name: name,
            icon: src,
        });
    }, [params.channelId, auth.user.channels]);

    return useMemo(() => {
        return <ChannelContent channel={channel} />;
    }, [channel]);
};

export default ChannelPage;
