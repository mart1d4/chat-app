import Link from "next/link";
import styles from "./AppNav.module.css";
import { useRef, useState, useEffect } from "react";

const AppNav = () => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        document.addEventListener("click", (event) => {
            if (showMenu && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        });

        return () => {
            document.removeEventListener("click", () => setShowMenu(false));
        };
    }, []);

    return (
        <nav className={styles.nav}>
            <ul className={styles.list}>
                <div className={styles.channelList}>
                    <div className={styles.listItem}>
                        <Link
                            href="/friends"
                            className={styles.link}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="40"
                                height="40"
                            >
                                <path d="M1.625 33.333v-4.166q0-1.459.729-2.646.729-1.188 2.021-1.771 2.917-1.333 5.417-1.938 2.5-.604 5.166-.604 2.625 0 5.125.604 2.5.605 5.375 1.938 1.292.583 2.063 1.771.771 1.187.771 2.646v4.166Zm29.417 0v-4.291q0-2.334-1.23-4.021-1.229-1.688-3.27-2.813 2.625.334 4.937.959 2.313.625 3.896 1.458 1.417.833 2.208 1.937.792 1.105.792 2.48v4.291ZM14.958 19.958q-2.75 0-4.583-1.812-1.833-1.813-1.833-4.563t1.833-4.562q1.833-1.813 4.583-1.813t4.563 1.813q1.812 1.812 1.812 4.562t-1.812 4.563q-1.813 1.812-4.563 1.812ZM30.5 13.583q0 2.75-1.812 4.563-1.813 1.812-4.563 1.812-.458 0-1.083-.062-.625-.063-1.084-.229 1.042-1.125 1.604-2.688.563-1.562.563-3.396 0-1.833-.563-3.333Q23 8.75 21.958 7.5q.5-.167 1.084-.229.583-.063 1.083-.063 2.75 0 4.563 1.813 1.812 1.812 1.812 4.562Z" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </ul>
        </nav>
    );
};

export default AppNav;
