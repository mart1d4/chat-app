'use client';

import useContextHook from '@/hooks/useContextHook';
import { ReactElement, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ChannelPage = ({ params }: { params: { guildId: string } }): ReactElement => {
    const { auth }: any = useContextHook({ context: 'auth' });
    const router = useRouter();

    useEffect(() => {
        const guild = auth.user.guilds?.find((guild: TGuild) => guild.id === params.guildId);

        console.log(guild);

        if (!guild) {
            const channelUrl = localStorage.getItem('channel-url');

            if (channelUrl) router.push(channelUrl);
            else router.push('/channels/me');

            return;
        }

        const channelId = JSON.parse(localStorage.getItem(`guild-${guild.id}`) ?? '{}')?.channelId;

        if (channelId) {
            router.push(`/channels/${guild.id}/${channelId}`);
        } else {
            const channel = guild.channels.find((channel: TChannel) => channel.type === 'GUILD_TEXT');
            if (channel) router.push(`/channels/${guild.id}/${channel.id}`);
            else router.push(`/channels/me`);
        }
    }, [params.guildId, auth.user.guilds]);

    return <></>;
};

export default ChannelPage;
