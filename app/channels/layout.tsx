import { AppNav, Settings, Layers, Tooltip, Loading } from "@components";
import { redirect } from "next/navigation";
import styles from "./Layout.module.css";
import { ReactElement } from "react";
import { Metadata } from "next";
import { getUser } from "@/lib/db/helpers";

export const metadata: Metadata = {
    title: "Chat App | Friends",
};

export default async function Layout({ children }: { children: ReactElement }) {
    const user = await getUser({
        toSelect: {
            id: true,
            username: true,
            avatar: true,
        },
    });
    console.log(user);

    if (!user) return redirect("/login");

    // const friends = await getFriends();
    // const blocked = await getBlocked();
    // const blockedBy = await getBlockedBy();
    // const received = await getRequests(0);
    // const sent = await getRequests(1);
    // const channels = await getChannels();
    // const guilds = await getGuilds();

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
