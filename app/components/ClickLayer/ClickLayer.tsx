"use client";

import { useShowChannels } from "@/lib/store";
import styles from "./ClickLayer.module.css";

export function ClickLayer({ children }) {
    const setShowChannels = useShowChannels((state) => state.setShowChannels);
    const showChannels = useShowChannels((state) => state.showChannels);

    return (
        <div className={styles.container}>
            {children}

            {showChannels && (
                <div
                    className={styles.wrapper}
                    onClick={() => setShowChannels(false)}
                />
            )}
        </div>
    );
}
