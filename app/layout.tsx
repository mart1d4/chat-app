import { ReactElement } from "react";
import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
    title: "Chat App",
    description: "Talk and Chat with your Friends",
    keywords: "chat, talk, friends, social",
    icons: {
        icon: "/assets/favicon.svg",
    },
};

export default function RootLayout({ children }: { children: ReactElement }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
