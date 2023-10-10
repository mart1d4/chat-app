"use client";

import { useEffect, useState } from "react";
import styles from "./Discover.module.css";

export default function DiscoverPage() {
    const [state, setState] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch("/api/test", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            });
            const json = await res.json();
            setState(json);
        };

        fetchData();
    }, []);

    return (
        <div className={styles.container}>
            <h1>Discover</h1>
            <div>{state}</div>
        </div>
    );
}
