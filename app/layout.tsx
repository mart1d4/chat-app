import { Analytics } from "@vercel/analytics/react";
import LayerProvider from "@/context/LayerProvider";
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
        <LayerProvider>
            <html lang="en">
                <body>
                    {children}
                    <Analytics />
                </body>
            </html>
        </LayerProvider>
    );
}
