import './global.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Chat App',
    description: 'Talk and Chat with your Friends',
    keywords: 'chat, talk, friends, social',
    icons: {
        icon: '/assets/favicon.ico',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang='en'>
            <body>{children}</body>
        </html>
    );
}
