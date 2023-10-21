import { AppNav, Settings, Layers, Tooltip, Loading } from "@components";
import { getInitialData } from "@/lib/db/helpers";
import { redirect } from "next/navigation";
import styles from "./Layout.module.css";
import { ReactElement } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Chat App | Friends",
};

export default async function Layout({ children }: { children: ReactElement }) {
    // const { user, friends, blocked, blockedBy, received, sent, channels, guilds } = await getInitialData();
    const { user, friends, blocked, blockedBy, received, sent, channels, guilds } = {
        user: {},
        friends: [],
        blocked: [],
        blockedBy: [],
        received: [],
        sent: [],
        channels: [],
        guilds: [],
    };
    if (!user) redirect("/login");

    return (
        <Loading
            data={{
                user,
                friends,
                blocked,
                blockedBy,
                received,
                sent,
                channels,
                guilds,
            }}
        >
            <div className={styles.appContainer}>
                <AppNav />

                <div className={styles.appWrapper}>
                    <div className={styles.channelsContainer}>{children}</div>
                </div>

                <div className={styles.layers}>
                    <Settings />
                    <Layers />
                    <Tooltip />
                </div>
            </div>
        </Loading>
    );
}
