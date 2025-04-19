"use client"; // Error boundaries must be Client Components

import styles from "./Error.module.css";
import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <h2>Something went wrong!</h2>

                <p>
                    An error occured, but don't worry! We're on it.
                    <br />
                    You can always check our{" "}
                    <a href={`${location.origin}/status/${error.digest}`}>status page</a> for
                    updates.
                </p>

                <button
                    className="button regular blue submit"
                    onClick={
                        // Attempt to recover by trying to re-render the segment
                        () => reset()
                    }
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
