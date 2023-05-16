'use client';

import useContextHook from '@/hooks/useContextHook';
import axiosPrivate from '@/lib/axios';

export default function useRefreshToken() {
    const { setAuth }: any = useContextHook({ context: 'auth' });

    const refresh = async () => {
        const response = await axiosPrivate.get('/auth/refresh');

        setAuth((prev: AuthContextValueType) => {
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
