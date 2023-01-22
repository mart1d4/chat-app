import { Tooltip, Alert } from "..";
import useUserData from "../../hooks/useUserData";
import styles from "./Style.module.css";
import { useRouter } from "next/router";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";

const All = () => {
    const [search, setSearch] = useState("");
    const [showTooltip, setShowTooltip] = useState(null);
    const [liHover, setLiHover] = useState(null);
    const [showMenu, setShowMenu] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        window.addEventListener("click", (e) => {
            if (e.target === menuRef.current) return;
            setShowMenu(null);
            setLiHover(null);
        });
    }, []);

    const searchBar = useRef(null);
    const menuRef = useRef(null);

    const { auth, friends, setFriends, setBlockedUsers } = useUserData();
    const router = useRouter();
    const axiosPrivate = useAxiosPrivate();

    const removeFriend = async (friendID) => {
        try {
            const data = await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/remove`,
                { userID: friendID }
            );
            if (data.data.error) {
                setError(data.data.error);
            } else {
                setFriends(friends.filter((friend) => friend._id.toString() !== friendID));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const blockUser = async (friendID) => {
        try {
            const data = await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/block`,
                { userID: friendID }
            );
            if (data.data.error) {
                setError(data.data.error);
            } else {
                setFriends(friends.filter((friend) => friend._id.toString() !== friendID));
                setBlockedUsers((prev) => [...prev, data.data.user]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const startConversation = async (friendID) => {
        try {
            const data = await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/create`,
                { userID: friendID }
            );
            if (data.data.error) {
                setError(data.data.error);
            } else {
                router.push(`/channels/@me/${data.data.channelID}`);
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
            <h2 className={styles.title}>All Friends — {friends.length}</h2>
            <ul className={styles.listContainer}>
                {friends.map((friend, index) => (
                    <li
                        key={friend._id}
                        className={
                            liHover === index
                                ? styles.liContainerHover
                                : styles.liContainer
                        }
                        onClick={() => startConversation(friend._id)}
                        onMouseEnter={() => {
                            setLiHover(index);
                            if (showMenu !== null && showMenu !== index) {
                                setShowMenu(null);
                            }
                        }}
                        onMouseLeave={() => {
                            if (showMenu === index) return;
                            setLiHover(null);
                        }}
                        style={{
                            borderColor: liHover === index - 1 && "transparent",
                        }}
                    >
                        <div className={styles.li}>
                            <div className={styles.userInfo}>
                                <div className={styles.avatarWrapper}>
                                    <Image
                                        src={friend.avatar}
                                        width={32}
                                        height={32}
                                        alt="Avatar"
                                    />
                                    <div
                                        className={styles.avatarStatus}
                                        style={{
                                            backgroundColor: liHover === index ? "var(--background-transparent)" : "var(--background-quaternary)",
                                        }}
                                    >
                                        <div
                                            style={{
                                                backgroundColor:
                                                    friend.status === "Online"
                                                        ? "var(--valid-primary)"
                                                        : friend.status === "Idle"
                                                            ? "var(--warning-primary)"
                                                            : friend.status === "Busy"
                                                                ? "var(--error-primary)"
                                                                : "var(--foreground-quaternary)",
                                            }}
                                        >

                                        </div>
                                    </div>
                                </div>
                                <div className={styles.text}>
                                    <p className={styles.textUsername}>{friend.username}</p>
                                    <p className={styles.textStatus}>
                                        {friend.customStatus === "" ? (friend.status)
                                            : (
                                                <span title="Custom Status">{friend.customStatus}</span>
                                            )}
                                    </p>
                                </div>
                            </div>
                            <div className={styles.actions}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        startConversation(friend._id);
                                    }}
                                    onMouseEnter={() => setShowTooltip(friend._id)}
                                    onMouseLeave={() => setShowTooltip(null)}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                    >
                                        <path d="M1.667 18.333V3.417q0-.729.51-1.24.511-.51 1.24-.51h13.166q.729 0 1.24.51.51.511.51 1.24v9.833q0 .729-.51 1.24-.511.51-1.24.51H5Z" />
                                    </svg>
                                    <Tooltip
                                        show={showTooltip === friend._id}
                                    >
                                        Message
                                    </Tooltip>
                                </button>
                                <button
                                    onMouseEnter={() => setShowTooltip(friend._id + 1)}
                                    onMouseLeave={() => setShowTooltip(null)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMenu(index);
                                        setShowTooltip(null);
                                    }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                    >
                                        <path d="M10 16q-.625 0-1.062-.438Q8.5 15.125 8.5 14.5t.438-1.062Q9.375 13 10 13t1.062.438q.438.437.438 1.062t-.438 1.062Q10.625 16 10 16Zm0-4.5q-.625 0-1.062-.438Q8.5 10.625 8.5 10t.438-1.062Q9.375 8.5 10 8.5t1.062.438q.438.437.438 1.062t-.438 1.062q-.437.438-1.062.438ZM10 7q-.625 0-1.062-.438Q8.5 6.125 8.5 5.5t.438-1.062Q9.375 4 10 4t1.062.438q.438.437.438 1.062t-.438 1.062Q10.625 7 10 7Z" />
                                    </svg>
                                    <Tooltip
                                        show={showTooltip === friend._id + 1}
                                    >
                                        More
                                    </Tooltip>

                                    {showMenu === index && (
                                        <div
                                            onMouseEnter={() => setShowTooltip(null)}
                                            className={styles.menuContainer}
                                            ref={menuRef}
                                        >
                                            <div className={styles.menu}>
                                                <div
                                                    className={styles.red}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowMenu(null);
                                                        setLiHover(null);
                                                        removeFriend(friend._id);
                                                    }}
                                                >
                                                    <div>Remove Friend</div>
                                                </div>
                                                <div
                                                    className={styles.red}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowMenu(null);
                                                        setLiHover(null);
                                                        blockUser(friend._id);
                                                    }}
                                                >
                                                    <div>Block</div>
                                                </div>
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowMenu(null);
                                                        setLiHover(null);
                                                        startConversation(friend._id);
                                                    }}
                                                >
                                                    <div>Message</div>
                                                </div>
                                                <div className={styles.divider}></div>
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowMenu(null);
                                                        setLiHover(null);
                                                        navigator.clipboard.writeText(friend._id);
                                                    }}
                                                >
                                                    <div>Copy ID</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div >
    );
};

export default All;
