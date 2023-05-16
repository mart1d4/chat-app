import { getSingleChannel, getMessages } from '@/lib/api-functions/channels';
import ChannelContent from './ChannelContent';
import { ReactNode } from 'react';

const ChannelFetch = async ({ channelId }: { channelId: string | null }): Promise<ReactNode> => {
    if (!channelId) {
        return null;
    }

    const channel = await getSingleChannel(channelId);
    const messages = await getMessages(channelId, 0, 50);

    return (
        // @ts-ignore
        <ChannelContent
            channel={channel}
            messages={messages.messages}
            hasMore={messages.hasMore}
        />
    );
};

export default ChannelFetch;
