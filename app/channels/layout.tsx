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
    const data = await getInitialData();
    if (!data) redirect("/login");

    return (
        <Loading
            data={{
                user: data.user,
                friends: data.friends,
                blocked: data.blocked,
                blockedBy: data.blockedBy,
                received: data.received,
                sent: data.sent,
                channels: data.channels,
                guilds: data.guilds,
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
