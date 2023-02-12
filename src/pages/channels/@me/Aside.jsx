import { useState, useEffect } from "react";
import styles from "./Aside.module.css";

const Aside = () => {
    const [windowWidth, setWindowWidth] = useState(0);

    useEffect(() => {
        setWindowWidth(window.innerWidth);

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, [])

    if (windowWidth < 1200) return null;

    return (
        <div className={styles.aside}>
        </div>
    );
}

export default Aside;
