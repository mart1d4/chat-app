"use client";

import { Input, LoadingCubes } from "@components";
import styles from "./TestPage.module.css";
import { useState } from "react";

export default function TestPage() {
    const [value, setValue] = useState("");
    const [error, setError] = useState("");

    return (
        <div className={styles.container}>
            <h1>Test Page</h1>

            <main>
                <LoadingCubes />

                <Input
                    required
                    value={value}
                    error={error}
                    label="Username"
                    onChange={(value) => {
                        setValue(value);
                        setError("");
                    }}
                    placeholder="Enter your username"
                />

                <button onClick={() => setError("This is an error")}>Set error</button>
            </main>
        </div>
    );
}
