import SettingsProvider from '@/context/SettingsProvider';
import { Analytics } from '@vercel/analytics/react';
import LayerProvider from '@/context/LayerProvider';
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

const RootLayout = ({ children }: { children: ReactElement }) => {
    return (
        <AuthProvider>
            <LayerProvider>
                <SettingsProvider>
                    <html lang='en'>
                        <body>
                            {children}
                            <Analytics />
                        </body>
                    </html>
                </SettingsProvider>
            </LayerProvider>
        </AuthProvider>
    );
};

export default RootLayout;
