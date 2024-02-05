"use client";

import { useShowChannels } from "@/lib/store";
import styles from "./ClickLayer.module.css";
import { useEffect, useState } from "react";

export function ClickLayer({ children }) {
    const [widthLimitPassed, setWidthLimitPassed] = useState(false);

    const setShowChannels = useShowChannels((state) => state.setShowChannels);
    const showChannels = useShowChannels((state) => state.showChannels);

    useEffect(() => {
        const width = window.innerWidth;

        if (width <= 562) setWidthLimitPassed(true);
        else setWidthLimitPassed(false);

        const handleResize = () => {
            const width = window.innerWidth;

            if (width <= 562) setWidthLimitPassed(true);
            else setWidthLimitPassed(false);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className={styles.container}>
            {children}
            <div></div>
        </div>
    );
}
