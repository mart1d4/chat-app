import useUserData from "../../hooks/useUserData";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import styles from "./Style.module.css";
import { useRef, useState } from "react";
import { Tooltip, Alert } from "../"
import Image from "next/image";
import { AnimatePresence } from "framer-motion";

const Blocked = () => {
    const [search, setSearch] = useState("");
    const [showTooltip, setShowTooltip] = useState(null);
    const [liHover, setLiHover] = useState(null);
    const [error, setError] = useState(null);

    const searchBar = useRef(null);

    const { auth, blockedUsers, setBlockedUsers } = useUserData();
    const axiosPrivate = useAxiosPrivate();

    const unblockUser = async (userID) => {
        try {
            const data = await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/unblock`,
                { userID: userID }
            );
            if (data.data.error) {
                setError(data.data.error);
            } else {
                setBlockedUsers(blockedUsers.filter((user) => user._id.toString() !== userID));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={styles.content}>
            <div className={styles.searchBarContainer}>
                <div className={styles.searchBarInner}>
                    <input
                        ref={searchBar}
                        placeholder="Search"
                        aria-label="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div
                        className={styles.inputButton}
                        role="button"
                        style={{
                            cursor: search.length ? "pointer" : "text",
                        }}
                        onClick={() => {
                            if (search.length) setSearch("");
                            searchBar.current.focus();
                        }}
                    >
                        {search.length ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            >
                                <path d="M15.5 4.5l-11 11m11 0l-11-11" />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                            >
                                <path d="m15.938 17-4.98-4.979q-.625.458-1.375.719Q8.833 13 8 13q-2.083 0-3.542-1.458Q3 10.083 3 8q0-2.083 1.458-3.542Q5.917 3 8 3q2.083 0 3.542 1.458Q13 5.917 13 8q0 .833-.26 1.583-.261.75-.719 1.375L17 15.938ZM8 11.5q1.458 0 2.479-1.021Q11.5 9.458 11.5 8q0-1.458-1.021-2.479Q9.458 4.5 8 4.5q-1.458 0-2.479 1.021Q4.5 6.542 4.5 8q0 1.458 1.021 2.479Q6.542 11.5 8 11.5Z" />
                            </svg>
                        )}
                    </div>
                </div>
            </div>
            <h2 className={styles.title}>Blocked — {blockedUsers.length}</h2>
            <ul className={styles.listContainer}>
                {blockedUsers.map((user, index) => (
                    <li
                        key={user._id}
                        className={
                            liHover === index
                                ? styles.liContainerHover
                                : styles.liContainer
                        }
                        onMouseEnter={() => setLiHover(index)}
                        onMouseLeave={() => setLiHover(null)}
                        style={{
                            borderColor: liHover === index - 1 && "transparent",
                        }}
                    >
                        <div className={styles.li}>
                            <div className={styles.userInfo}>
                                <div className={styles.avatarWrapper}>
                                    <Image
                                        src={user.avatar}
                                        width={32}
                                        height={32}
                                        alt="Avatar"
                                    />
                                </div>
                                <div className={styles.text}>
                                    <p className={styles.textUsername}>{user.username}</p>
                                    <p
                                        className={styles.textStatus}
                                        style={{
                                            fontSize: "12px",
                                        }}
                                    >
                                        Blocked
                                    </p>
                                </div>
                            </div>
                            <div className={styles.actions}>
                                <button
                                    onClick={() => unblockUser(user._id)}
                                    onMouseEnter={() => setShowTooltip(index)}
                                    onMouseLeave={() => setShowTooltip(null)}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                    >
                                        <path
                                            fill={
                                                showTooltip === index
                                                    ? "var(--error-primary)"
                                                    : "var(--foreground-secondary)"
                                            }
                                            d="M13 9.5V8h5v1.5ZM8 10q-1.25 0-2.125-.875T5 7q0-1.25.875-2.125T8 4q1.25 0 2.125.875T11 7q0 1.25-.875 2.125T8 10Zm-6 6v-1.917q0-.541.26-.989.261-.448.719-.719 1.146-.667 2.417-1.021Q6.667 11 8 11q1.333 0 2.604.354 1.271.354 2.417 1.021.458.271.719.719.26.448.26.989V16Z" />
                                    </svg>
                                    <Tooltip
                                        show={showTooltip === index}
                                    >
                                        Unblock
                                    </Tooltip>
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div >
    );
};

export default Blocked;
