import ChannelFetch from './ChannelFetch';
import ChannelCheck from './ChannelCheck';
import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Chat App | @me',
};

const ChannelPage = ({ params = null }: { params: { channelId: string } | null }): ReactNode => {
    return (
        <>
            {/* @ts-ignore */}
            <ChannelCheck channelId={params.channelId}>
                {/* @ts-ignore */}
                <ChannelFetch channelId={params.channelId} />
            </ChannelCheck>
        </>
    );
};

export default ChannelPage;
