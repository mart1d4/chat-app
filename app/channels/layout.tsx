import { AppNav, Settings, Loading, AppSpinner, DialogOverlay, EventManager } from "@components";
import { type ReactElement, Suspense } from "react";
import { getInitialData } from "@/lib/db/helpers";
import { redirect } from "next/navigation";
import styles from "./Layout.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Spark | Friends",
};

export default function Layout({ children }: { children: ReactElement }) {
    return (
        <Suspense fallback={<AppSpinner />}>
            <GetData>{children}</GetData>
        </Suspense>
    );
}

export async function GetData({ children }: { children: ReactElement }) {
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
                    <DialogOverlay />
                    <EventManager />
                </div>
            </div>
        </Loading>
    );
}
