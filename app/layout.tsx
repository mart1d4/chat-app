import { appMetadata } from "@/lib/metadata";
import { ReactElement } from "react";
import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
    title: appMetadata.title,
    description: appMetadata.shortDescription,
    keywords: appMetadata.keywords.join(", "),
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
