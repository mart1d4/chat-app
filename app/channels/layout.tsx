import { type ReactElement, Suspense } from "react";
import { getInitialData } from "@/lib/db/helpers";
import styles from "./Layout.module.css";
import type { Metadata } from "next";
import {
    DialogOverlay,
    EventManager,
    EmojiPicker,
    AppSpinner,
    Settings,
    Loading,
    AppNav,
} from "@components";

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

    if (!data) {
        return (
            <main className={styles.error}>
                <section>
                    <h1>Oh, no! Something went wrong.</h1>

                    <p>
                        Please try refreshing the page or check your internet connection. If the
                        problem persists, please check our status page or contact support.
                    </p>
                </section>
            </main>
        );
    }

    return (
        <Loading data={data}>
            <div className={styles.appContainer}>
                <AppNav />

                <div className={styles.appWrapper}>
                    <div className={styles.channelsContainer}>{children}</div>
                </div>

                {/* Layers */}
                <Settings />
                <DialogOverlay />
                <EventManager />
                <EmojiPicker />
            </div>
        </Loading>
    );
}
