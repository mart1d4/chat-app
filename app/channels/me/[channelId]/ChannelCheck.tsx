'use client';

import { useEffect, ReactNode, useState } from 'react';
import useContextHook from '@/hooks/useContextHook';
import { useRouter } from 'next/navigation';

type Props = {
    children: ReactNode;
    channelId: string | null;
};

const ChannelCheck = ({ children, channelId }: Props): ReactNode => {
    const [loading, setLoading] = useState<boolean>(true);

    const { auth }: any = useContextHook({ context: 'auth' });
    const router = useRouter();

    useEffect(() => {
        setLoading(true);

        if (!auth.user.channelIds.includes(channelId)) {
            router.push('/channels/me');
        }

        setLoading(false);
    }, [channelId]);

    if (loading) return null;

    return children;
};

export default ChannelCheck;
