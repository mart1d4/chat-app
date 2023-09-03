import { getBlocked, getBlockedBy, getChannels, getFriends, getGuilds, getRequests, useUser } from "@/lib/auth";
import { AppNav, Settings, Layers, Tooltip, Loading } from "@components";
import { redirect } from "next/navigation";
import styles from "./Layout.module.css";
import { ReactElement } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Chat App | Friends",
};

const Layout = async ({ children }: { children: ReactElement }) => {
    const user = await useUser();
    if (!user) return redirect("/login");

    const friends = await getFriends();
    const blocked = await getBlocked();
    const blockedBy = await getBlockedBy();
    const received = await getRequests(0);
    const sent = await getRequests(1);
    const channels = await getChannels();
    const guilds = await getGuilds();

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
};

export default Layout;
