"use client";

import styles from "./Discover.module.css";
import { useState } from "react";

export default function DiscoverPage() {
    const [state, setState] = useState(null);
    const [users, setUsers] = useState([]);

    const postData = async () => {
        const res = await fetch("/api/test", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const json = await res.json();
        console.log(json);
        setState(json);
    };

    const fetchData = async () => {
        const res = await fetch("/api/test", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const json = await res.json();
        console.log(json);
        setUsers(json.users);
    };

    return (
        <div className={styles.container}>
            <h1>Discover</h1>

            <div className={styles.buttons}>
                <button className="button blue" onClick={postData}>
                    Post Data
                </button>

                <button className="button blue" onClick={fetchData}>
                    Fetch Data
                </button>
            </div>

            <div className={styles.data}>
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
