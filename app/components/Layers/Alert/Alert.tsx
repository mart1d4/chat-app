"use client";

import styles from "./Alert.module.css";

type AlertProps = {
    message: string;
    type: "success" | "danger" | "warning" | "info";
};

export function Alert({ message, type }: AlertProps) {
    return <div className={styles.alert}>{message}</div>;
}
