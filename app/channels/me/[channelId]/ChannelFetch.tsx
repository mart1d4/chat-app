'use client';

import { getSingleChannel, getMessages } from '@/lib/api-functions/channels';
import useContextHook from '@/hooks/useContextHook';
import ChannelContent from './ChannelContent';
import { ReactNode } from 'react';

const ChannelFetch = async ({ channelId }: { channelId: string | null }): Promise<ReactNode> => {
    if (!channelId) {
        return null;
    }

    const { auth }: any = useContextHook({ context: 'auth' });
    const token = auth?.accessToken;

    const channel = await getSingleChannel(token, channelId);
    const messages = await getMessages(token, channelId, 0, 50);

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
