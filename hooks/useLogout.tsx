'use client';

import useContextHook from './useContextHook';

const useLogout = () => {
    const { setShowSettings }: any = useContextHook({ context: 'layer' });
    const { auth, setAuth }: any = useContextHook({ context: 'auth' });

    const logout = async () => {
        const channelIds = auth.user.channelIds;

        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            }).then(() => {
                localStorage.removeItem('channel-url');
                localStorage.removeItem('friends-tab');
                localStorage.removeItem('user-settings');

                channelIds.forEach((channelId: string) => {
                    localStorage.removeItem(`channel-${channelId}`);
                });

                setAuth(null);
                setShowSettings(false);
            });
        } catch (error) {
            console.error(error);
            throw new Error('Error logging out');
        }
    };

    return { logout };
};

export default useLogout;
