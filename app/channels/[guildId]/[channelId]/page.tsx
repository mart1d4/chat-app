'use client';

import { ReactElement, useState, useEffect, useMemo } from 'react';
import useContextHook from '@/hooks/useContextHook';
import ChannelContent from './ChannelContent';
import { useRouter } from 'next/navigation';

const ChannelPage = ({ params }: { params: { guildId: string; channelId: string } }): ReactElement => {
    const [channel, setChannel] = useState<TChannel | null>(null);

    const { auth }: any = useContextHook({ context: 'auth' });
    const router = useRouter();

    useEffect(() => {
        const guild = auth.user.guilds?.find((guild: TGuild) => guild.id === params.guildId);

        if (!guild) {
            const channelUrl = localStorage.getItem('channel-url');

            if (channelUrl) router.push(channelUrl);
            else router.push('/channels/me');

            return;
        }

        const channel = guild.channels?.find((channel: TChannel) => channel.id === params.channelId);

        if (!channel) {
            const channelUrl = JSON.parse(localStorage.getItem(`guild-${guild.id}`) ?? '{}')?.channelId;

            if (channelUrl) {
                router.push(`/channels/${guild.id}/${channelUrl}`);
            } else {
                const channel = guild.channels.find((channel: TChannel) => channel.type === 'GUILD_TEXT');
                if (channel) router.push(`/channels/${guild.id}/${channel.id}`);
                else router.push(`/channels/me`);
            }

            return;
        }

        setChannel(channel);
        localStorage.setItem(`guild-${guild.id}`, JSON.stringify({ channelId: channel.id }));
    }, [params.guildId, params.channelId, auth.user.guilds, auth.user.channels]);

    return useMemo(() => {
        return <ChannelContent channel={channel} />;
    }, [channel]);
};

export default ChannelPage;
