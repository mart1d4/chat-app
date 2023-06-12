'use client';

import useContextHook from './useContextHook';
import { useRouter } from 'next/navigation';

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
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
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
