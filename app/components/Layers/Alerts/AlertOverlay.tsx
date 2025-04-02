"use client";

import styles from "./AlertOverlay.module.css";
import { useTriggerAlert } from "@/store";
import { Icon } from "@components";

export function AlertOverlay() {
    const { alert } = useTriggerAlert();
    if (!alert) return null;

    return (
        <div className={`${styles.alert} ${styles[alert.type]}`}>
            <Icon
                size={16}
                name={alert.type === "error" ? "cross" : "checkmark"}
            />

            <p>{alert.message}</p>
        </div>
    );
}
