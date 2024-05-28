import { AppNav, Settings, Layers, Loading } from "@components";
import { getInitialData } from "@/lib/db/helpers";
import { redirect } from "next/navigation";
import styles from "./Layout.module.css";
import { ReactElement } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Spark | Friends",
};

export default async function Layout({ children }: { children: ReactElement }) {
    const data = await getInitialData();
    if (!data) redirect("/login");

    return (
        <Loading data={data}>
            <div className={styles.appContainer}>
                <AppNav />

                <div className={styles.appWrapper}>
                    <div className={styles.channelsContainer}>{children}</div>
                </div>

                <div className={styles.layers}>
                    <Settings />
                    <Layers />
                </div>
            </div>
        </Loading>
    );
}
