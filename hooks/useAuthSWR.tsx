'use client';

import useContextHook from '@/hooks/useContextHook';
import { useMemo } from 'react';
import useSWR from 'swr';

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

const useAuthSWR = (url: string, body?: {}) => {
    const { auth }: any = useContextHook({ context: 'auth' });
    const token = auth.accessToken;

    const config = useMemo(() => {
        if (body) {
            return {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            };
        } else {
            return {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };
        }
    }, [token, body]);

    const { data, error, isLoading } = useSWR(url, (url: string) => {
        console.log('[useAuthSWR] Fetching: ', url);
        console.log('[useAuthSWR] Body: ', JSON.stringify(config));

        return fetch(`${baseURL}${url}`, config).then((res) => {
            console.log('[useAuthSWR] Response: ', res);

            if (!res.ok) console.error(res);
            return res.json();
        });
    });

    return {
        data: data,
        isLoading: isLoading,
        isError: error,
    };
};

export default useAuthSWR;
