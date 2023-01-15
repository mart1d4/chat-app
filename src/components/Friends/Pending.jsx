import useAuth from "../../hooks/useAuth";
import useUserData from "../../hooks/useUserData";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import styles from "./Style.module.css";
import { useEffect, useRef, useState } from "react";
import { Tooltip } from "../"

const Pending = () => {
    const [search, setSearch] = useState("");
    const [hover, setHover] = useState(null);
    const [borderRemove, setBorderRemove] = useState(null);
    const [error, setError] = useState("");

    const searchBar = useRef(null);

    const { auth } = useAuth();
    const {
        friendRequests,
        setFriendRequests,
        friends,
        setFriends,
    } = useUserData();
    const axiosPrivate = useAxiosPrivate();

    const cancelRequest = async (friendID) => {
        try {
            const data = await axiosPrivate.post(
                `/users/${auth?.user?._id}/friends/cancel`,
                { userID: friendID },
            );
            if (data.data.error) {
                setError(data.data.error);
            } else {
                setFriendRequests(
                    friendRequests.filter((request) => request.user._id.toString() !== friendID)
                );
            }
        } catch (err) {
            console.error(err);
        }
    };

    const acceptRequest = async (friendID) => {
        try {
            const data = await axiosPrivate.post(
                `/users/${auth?.user?._id}/friends/accept`,
                { userID: friendID },
            );
            if (data.data.error) {
                setError(data.data.error);
            } else {
                setFriendRequests(
                    friendRequests.filter((request) => request.user._id.toString() !== friendID)
                );
                setFriends([...friends, data.data.user]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const ignoreRequest = async (friendID) => {
        try {
            const data = await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/ignore`,
                { userID: friendID },
            );
            if (data.data.error) {
                setError(data.data.error);
            } else {
                setFriendRequests(
                    friendRequests.filter((request) => request.user._id.toString() !== friendID)
                );
            }
        } catch (err) {
            console.error(err);
        }
    };

    // if (!friendRequests.length) {
    //     return (
    //         <div className={styles.content}>
    //             <h2>No pending requests</h2>
    //         </div>
    //     );
    // }

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
            <h2 className={styles.title}>Pending — {friendRequests.length}</h2>
            <ul className={styles.listContainer}>
                {friendRequests.map((request, index) => (
                    <li
                        key={index}
                        className={styles.liContainer}
                        onMouseEnter={() => setBorderRemove(index + 1)}
                        onMouseLeave={() => setBorderRemove(null)}
                        style={{
                            borderColor: borderRemove === index && "transparent",
                        }}
                    >
                        <div className={styles.li}>
                            <div className={styles.userInfo}>
                                <div className={styles.avatarWrapper}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="40"
                                        height="40"
                                        viewBox="0 0 40 40"
                                    >
                                        <foreignObject
                                            x="0"
                                            y="0"
                                            width="32"
                                            height="32"
                                            mask="url(#mask-status-round-32)"
                                        >
                                            <img
                                                src={request.user.avatar}
                                                alt="avatar"
                                                width="32"
                                                height="32"
                                            />
                                        </foreignObject>
                                    </svg>
                                </div>
                                <div className={styles.text}>
                                    <p className={styles.textUsername}>{request.user.username}</p>
                                    <p className={styles.textStatus}>
                                        {request.type === "sent"
                                            ? "Outgoing Friend Request"
                                            : "Incoming Friend Request"}
                                    </p>
                                </div>
                            </div>
                            <div className={styles.actions}>
                                {
                                    request.type === "received" && (
                                        <button
                                            onClick={() => acceptRequest(request.user._id)}
                                            onMouseEnter={() => setHover(request.user._id + 0)}
                                            onMouseLeave={() => setHover(null)}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                stroke={
                                                    hover === request.user._id + 0
                                                        ? "var(--valid-primary)"
                                                        : "var(--foreground-secondary)"
                                                }
                                            >
                                                <path d="m9.55 17.3-4.975-4.95.725-.725 4.25 4.25 9.15-9.15.725.725Z" />
                                            </svg>
                                            <Tooltip
                                                show={hover === request.user._id + 0}
                                            >
                                                Accept
                                            </Tooltip>
                                        </button>
                                    )
                                }
                                <button
                                    onClick={() => {
                                        if (request.type === "sent") cancelRequest(request.user._id);
                                        else ignoreRequest(request.user._id);
                                    }}
                                    onMouseEnter={() => setHover(request.user._id + 1)}
                                    onMouseLeave={() => setHover(null)}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        stroke={
                                            hover === request.user._id + 1
                                                ? "var(--error-primary)"
                                                : "var(--foreground-secondary)"
                                        }
                                        strokeWidth="1.5"
                                    >
                                        <path d="M15.5 4.5l-11 11m11 0l-11-11" />
                                    </svg>
                                    <Tooltip
                                        show={hover === request.user._id + 1}
                                    >
                                        {request.type === "sent" ? "Cancel" : "Ignore"}
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

export default Pending;
