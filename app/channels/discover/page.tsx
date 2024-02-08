"use client";

import styles from "./Discover.module.css";
import { useState } from "react";

export default function DiscoverPage() {
    const [state, setState] = useState(null);
    const [users, setUsers] = useState([]);
    const [time, setTime] = useState(null);

    const postData = async () => {
        const res = await fetch("/api/test", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const json = await res.json();
        setState(json);
    };

    const fetchData = async () => {
        const start = performance.now();

        const res = await fetch("/api/test", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const end = performance.now();

        setTime(Math.round(end - start));

        const json = await res.json();
        setUsers(json.users);
    };

    return (
        <div className={styles.container}>
            <h1>Discover</h1>

            <button
                className="button grey"
                style={{ marginTop: "20px" }}
                onClick={() => {
                    Notification.requestPermission().then((result) => {
                        if (result === "granted") {
                            console.log("Notification permission granted");

                            const notification = new Notification("Hello, world!", {
                                body: "This is a notification from the Discover page",
                                // vibrate: [200, 100, 200, 100, 200, 100, 200],
                                icon: "/assets/favicon.svg",
                                tag: "discover-notification",
                                badge: "/assets/favicon.svg",
                                timestamp: Date.now(),
                                silent: true,
                                renotify: true,
                            });

                            notification.onclick = () => {
                                console.log("Notification clicked");
                            };
                        }
                    });
                }}
            >
                Wow, a button
            </button>

            <div className={styles.buttons}>
                <button
                    className="button blue"
                    onClick={postData}
                >
                    Post Data
                </button>

                <button
                    className="button blue"
                    onClick={fetchData}
                >
                    Fetch Data
                </button>

                <button
                    className="button red"
                    onClick={() => {
                        setState(null);
                        setUsers([]);
                    }}
                >
                    Clear Data
                </button>
            </div>

            <div className={styles.data}>
                {time && <div>Time taken: {time}ms</div>}

                <div>
                    {Object.keys(state || {}).map((key) => (
                        <div key={key}>
                            {key}: {state[key]}
                        </div>
                    ))}
                </div>

                <div>
                    <h2>Users ({users.length})</h2>

                    {users.map((user) => (
                        <div key={user.id}>
                            {user.id}: {user.displayName}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
