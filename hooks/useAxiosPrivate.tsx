'use client';

import useRefreshToken from '@/hooks/useRefreshToken';
import useContextHook from '@/hooks/useContextHook';
import { axiosPrivate } from '@/lib/axios';
import { useEffect } from 'react';

export default function useAxiosPrivate() {
    const { auth }: any = useContextHook({
        context: 'auth',
    });
    const refresh = useRefreshToken();

    useEffect(() => {
        const requestIntercept = axiosPrivate.interceptors.request.use(
            (config) => {
                if (!config.headers['Authorization']) {
                    config.headers[
                        'Authorization'
                    ] = `Bearer ${auth?.accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseIntercept = axiosPrivate.interceptors.response.use(
            (response) => response,
            async (error) => {
                const prevRequest = error?.config;
                if (!prevRequest?.sent) {
                    prevRequest.sent = true;
                    const newAccessToken = await refresh();

                    prevRequest.headers[
                        'Authorization'
                    ] = `Bearer ${newAccessToken}`;

                    return axiosPrivate(prevRequest);
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        };
    }, [auth, refresh]);

    return axiosPrivate;
}
