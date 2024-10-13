import { AppNav, Settings, Loading, AppSpinner } from "@components";
import { getInitialData } from "@/lib/db/helpers";
import { ReactElement, Suspense } from "react";
import { redirect } from "next/navigation";
import styles from "./Layout.module.css";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Spark | Friends",
};

export default async function Layout({ children }: { children: ReactElement }) {
    const data = await getInitialData();
    if (!data) redirect("/login");

    return (
        <Suspense fallback={<AppSpinner />}>
            <Loading data={data}>
                <div className={styles.appContainer}>
                    <AppNav />

                    <div className={styles.appWrapper}>
                        <div className={styles.channelsContainer}>{children}</div>
                    </div>

                    <div className={styles.layers}>
                        <Settings />
                    </div>
                </div>
            </Loading>
        </Suspense>
    );
}
