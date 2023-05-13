// @ts-nocheck

import SettingsProvider from '@/context/SettingsProvider';
import LayerProvider from '@/context/LayerProvider';
import PersistLogin from '@/hooks/usePersistLogin';
import AuthProvider from '@/context/AuthProvider';
import { ReactElement } from 'react';
import type { Metadata } from 'next';
import './global.css';

export const metadata: Metadata = {
    title: 'Chat App',
    description: 'Talk and Chat with your Friends',
    keywords: 'chat, talk, friends, social',
    icons: {
        icon: '/assets/favicon.svg',
    },
};

const RootLayout = ({ children }: { children: ReactElement }): ReactElement => {
    return (
        <html lang='en'>
            <body>
                <AuthProvider>
                    <PersistLogin>
                        <LayerProvider>
                            <SettingsProvider>{children}</SettingsProvider>
                        </LayerProvider>
                    </PersistLogin>
                </AuthProvider>
            </body>
        </html>
    );
};

export default RootLayout;
