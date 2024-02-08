"use client";

import styles from "./Aside.module.css";

export default function Aside() {
    return (
        <aside className={styles.aside + " scrollbar"}>
            <h2>Active Now</h2>

            <div>
                <h3>It's quiet for now...</h3>
                <div>
                    When a friend starts an activity—like playing a game or hanging out on
                    voice—we’ll show it here!
                </div>
            </div>
        </aside>
    );
}
