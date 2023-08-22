import { useUser, getChannel, getChannels } from '@/lib/auth';
import { UserChannels } from '@components';
import Content from './Content';

const getData = async (channelId: string) => {
    const channel = (await getChannel(channelId)) as TChannel;
    const user = (await useUser()) as TCleanUser;
    return { channel, user };
};

const ChannelPage = async ({ params }: { params: { channelId: string } }) => {
    const { channel, user } = await getData(params.channelId);
    const channels = await getChannels();

    let friend: TCleanUser | null = null;
    if (channel.type === 0) {
        friend = channel.recipients.find((u) => u.id !== user.id) || null;
    }

    return (
        <>
            <UserChannels
                user={user}
                channels={channels}
            />

            <Content
                channel={channel}
                user={user}
                friend={friend}
            />
        </>
    );
};

export default ChannelPage;
