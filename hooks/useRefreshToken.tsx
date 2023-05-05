'use client';

import useContextHook from '@/hooks/useContextHook';
import axios from '@/lib/axios';

export default function useRefreshToken() {
    const { setAuth }: any = useContextHook({ context: 'auth' });

    const refresh = async () => {
        const response = await axios.get('/auth/refresh', {
            withCredentials: true,
        });

        setAuth((prev: any) => {
            return {
                ...prev,
                accessToken: response.data.accessToken,
                user: response.data.user,
            };
        });

        return response.data.accessToken;
    };

    return refresh;
}
