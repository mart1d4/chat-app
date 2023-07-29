import { getChannel, getGuild, getUser, getGuildChannels } from '@/lib/auth';
import { GuildChannels } from '@/app/app-components';
import { redirect } from 'next/navigation';
import Content from './Content';

const Page = async ({ params }: { params: { guildId: string; channelId: string } }) => {
    const guild = await getGuild(params.guildId);
    if (!guild) redirect('/channels/me');

    const channel = await getChannel(params.channelId);
    if (!channel) redirect(`/channels/${params.guildId}`);

    const user = await getUser();
    const channels = await getGuildChannels(guild.id);

    if (!user || !channels) return;

    return (
        <>
            <GuildChannels
                guild={guild}
                channels={channels}
                user={user}
            />

            <Content
                guild={guild}
                channel={channel}
            />
        </>
    );
};

export default Page;
