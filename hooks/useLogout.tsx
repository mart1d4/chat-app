'use client';

import useContextHook from './useContextHook';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';

const useLogout = () => {
    const { setAuth }: any = useContextHook({
        context: 'auth',
    });
    const router = useRouter();

    const logout = async () => {
        setAuth(null);
        localStorage.removeItem('channel-url');
        localStorage.removeItem('friends-tab');
        localStorage.removeItem('user-settings');

        try {
            await axios.post('/auth/logout', {
                withCredentials: true,
            });

            router.push('/login');
        } catch (error) {
            console.error(error);
            throw new Error('Error logging out');
        }
    };

    return { logout };
};

export default useLogout;