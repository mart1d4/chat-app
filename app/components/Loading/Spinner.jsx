import styles from "./Loading.module.css";

export function AppSpinner({}) {
    return (
        <div className={styles.container}>
            <video
                autoPlay
                loop
            >
                <source
                    src="/assets/app/spinner.webm"
                    type="video/webm"
                />
            </video>

            <div className={styles.textContent}>
                <div className="smallTitle">Did you know</div>
                <div>
                    Use{" "}
                    <div className="keybind">
                        <span>CTRL /</span>
                    </div>{" "}
                    to bring up the list of keyboard shortcuts.
                </div>
            </div>
        </div>
    );
}
