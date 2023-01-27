import styles from "./Loader.module.css";

const Loader = () => {
    return (
        <div className={styles.container}>
            <video>
                <source
                    src="../../../public/images/spinner.webm"
                    type="video/webm"
                />
            </video>
        </div>
    );
};

export default Loader;
