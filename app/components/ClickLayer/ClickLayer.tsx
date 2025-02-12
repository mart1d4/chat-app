"use client";

import styles from "./ClickLayer.module.css";
import { useShowChannels } from "@/store";

export function ClickLayer({ children }: { children: React.ReactNode }) {
    const { showChannels } = useShowChannels();

    return (
        <div className={styles.container}>
            {children}
            {showChannels && <div className={styles.wrapper} />}
        </div>
    );
}
