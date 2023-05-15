import { getSingleChannel, getMessages } from '@/lib/api-functions/channels';
import ChannelContent from './ChannelContent';
import { ReactNode } from 'react';

const ChannelFetch = async ({
    channelId,
}: {
    channelId: string;
}): Promise<ReactNode> => {
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
