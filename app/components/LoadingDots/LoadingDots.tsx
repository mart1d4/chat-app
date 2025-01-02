import styles from "./LoadingDots.module.css";

export function LoadingDots() {
    return (
        <span className={styles.container}>
            <span />
            <span />
            <span />
        </span>
    );
}
