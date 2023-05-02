import AuthProvider from '@/context/AuthProvider';
import { ReactElement, ReactNode } from 'react';
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

const RootLayout = ({ children }: { children: ReactNode }): ReactElement => {
    return (
        <html lang='en'>
            <body>
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
};

export default RootLayout;
