import styles from "./Loader.module.css";

const Loader = () => {
    return (
        <div className={styles.container}>
            <video autoPlay loop>
                <source
                    src="../../assets/spinner.webm"
                    type="video/webm"
                />
            </video>
        </div>
    );
};

export default Loader;
