import { TabFocusHighlighter } from "./components";
import { appMetadata } from "@/lib/metadata";
import { type ReactElement } from "react";
import type { Metadata } from "next";
import { Init } from "./Init";
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
            <body>
                {/* For firefox */}
                <script>0</script>

                {children}

                <TabFocusHighlighter />
                <Init />
            </body>
        </html>
    );
}
