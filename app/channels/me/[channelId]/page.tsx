import { getUser, getChannel, getChannels } from '@/lib/auth';
import { UserChannels } from '@components';
import { redirect } from 'next/navigation';
import Content from './Content';

const getData = async (channelId: string) => {
    const channel = await getChannel(channelId);
    if (!channel) return redirect('/channels/me');

    const user = await getUser();
    return { channel, user };
};

const ChannelPage = async ({ params }: { params: { channelId: string } }) => {
    const { channel, user } = await getData(params.channelId);
    const channels = await getChannels();

    if (!user) return redirect('/login');

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
