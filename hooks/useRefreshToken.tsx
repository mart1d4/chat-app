'use client';

import useContextHook from '@/hooks/useContextHook';

export default function useRefreshToken() {
    const { setAuth }: any = useContextHook({ context: 'auth' });

    const refresh = async () => {
        const response = await fetch('/api/auth/refresh', {
            method: 'GET',
            credentials: 'include',
        }).then((res) => {
            if (!res.ok) throw new Error('Could not refresh token');
            return res.json();
        });

        setAuth((prev: AuthContextValueType) => {
            return {
                ...prev,
                accessToken: response.accessToken,
                user: response.user,
            };
        });

        return response.accessToken;
    };

    return refresh;
}
