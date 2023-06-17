'use client';

import { ReactElement, useState, useEffect } from 'react';
import useContextHook from '@/hooks/useContextHook';
import { Channels } from '@/app/app-components';
import { useRouter } from 'next/navigation';
import { Metadata } from 'next';
import ChannelContent from './ChannelContent';

export const metadata: Metadata = {
    title: 'Chat App | @me',
};

const ChannelPage = ({ params }: { params: { channelId: string } }): ReactElement => {
    const [loading, setLoading] = useState<boolean>(true);
    const [channel, setChannel] = useState<ChannelType | null>(null);

    const { auth }: any = useContextHook({ context: 'auth' });
    const router = useRouter();

    useEffect(() => {
        setLoading(true);

        const channel: ChannelType | undefined = auth.user.channels?.find(
            (channel: ChannelType) => channel.id === params.channelId
        );

        if (!channel) {
            router.push('/channels/me');
            return;
        }

        let name = channel?.name;
        if (channel.type === 'DM') {
            const user = channel.recipients.find(
                (user: any) => user.id !== auth.user.id
            ) as CleanOtherUserType;
            name = user.username;
        } else if (channel.type === 'GROUP_DM' && !channel.name) {
            const filteredMembers = channel.recipients.filter(
                (user: any) => user.id !== auth.user.id
            );
            name = filteredMembers.map((user: any) => user.username).join(', ');
        }

        let src = `${process.env.NEXT_PUBLIC_CDN_URL}${channel?.icon}/`;
        if (channel.type === 'DM') {
            const user = channel.recipients.find(
                (user: any) => user.id !== auth.user.id
            ) as CleanOtherUserType;
            src = `${process.env.NEXT_PUBLIC_CDN_URL}${user.avatar}/`;
        }

        setChannel({
            ...channel,
            name: name,
            icon: src,
        });

        setLoading(false);
    }, [params.channelId]);

    if (loading) return <></>;

    return <ChannelContent channel={channel as ChannelType} />;
};

export default ChannelPage;
