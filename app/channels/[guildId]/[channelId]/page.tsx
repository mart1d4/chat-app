import { getChannel, getGuild, useUser, getGuildChannels } from '@/lib/auth';
import { GuildChannels } from '@components';
import Content from './Content';

const Page = async ({ params }: { params: { guildId: string; channelId: string } }) => {
    const guild = (await getGuild(params.guildId)) as TGuild;
    const channel = (await getChannel(params.channelId)) as TChannel;

    const user = (await useUser()) as TCleanUser;
    const channels = await getGuildChannels(guild.id);

    channels.sort((a, b) => (a.position as number) - (b.position as number));

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
