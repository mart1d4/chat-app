'use client';

import useContextHook from '@/hooks/useContextHook';
import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
    children: ReactNode;
    channelId: string | null;
};

const ChannelCheck = ({ children, channelId }: Props): ReactNode => {
    const router = useRouter();

    const { auth }: any = useContextHook({ context: 'auth' });

    useEffect(() => {
        if (!auth.user.channelIds.includes(channelId)) {
            router.push('/channels/me');
        }
    }, [channelId]);

    return children;
};

export default ChannelCheck;
