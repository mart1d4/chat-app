'use client';

import useContextHook from '@/hooks/useContextHook';
import ChannelContent from './ChannelContent';
import useAuthSWR from '@/hooks/useAuthSWR';
import { ReactNode } from 'react';

const ChannelFetch = ({ channelId }: { channelId: string | null }): ReactNode => {
    if (!channelId) return null;

    const { data, isLoading } = useAuthSWR(`/users/me/channels/${channelId}`);

    if (isLoading) return null;

    return <ChannelContent channel={data?.channel} />;
};

export default ChannelFetch;
