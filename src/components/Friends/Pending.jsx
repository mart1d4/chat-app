import useUserData from "../../hooks/useUserData";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import styles from "./Style.module.css";
import { useRef, useState } from "react";
import { Tooltip, Icon, AvatarStatus } from "../"
import Image from "next/image";

const Pending = () => {
    const [search, setSearch] = useState("");
    const [showTooltip, setShowTooltip] = useState(null);
    const [liHover, setLiHover] = useState(null);
    const [error, setError] = useState(null);

    const searchBar = useRef(null);

    const {
        auth,
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
                        <Icon name={search.length ? "cross" : "search"} size={20} />
                    </div>
                </div>
            </div>
            <h2 className={styles.title}>Pending — {friendRequests.length}</h2>
            <ul className={styles.listContainer}>
                {friendRequests.map((request, index) => (
                    <li
                        key={index}
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
                                        src={request.user.avatar}
                                        width={32}
                                        height={32}
                                        alt="Avatar"
                                    />
                                    {request.type === "received" &&
                                        <AvatarStatus
                                            status={request.user.status}
                                            background={liHover === index ? "var(--background-hover-1)" : "var(--background-4)"}
                                        />}
                                </div>
                                <div className={styles.text}>
                                    <p className={styles.textUsername}>{request.user.username}</p>
                                    <p
                                        className={styles.textStatus}
                                        style={{
                                            fontSize: "12px",
                                        }}
                                    >
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
                                            onMouseEnter={() => setShowTooltip(index)}
                                            onMouseLeave={() => setShowTooltip(null)}
                                        >
                                            <Icon
                                                name="accept"
                                                size={20}
                                                fill={
                                                    showTooltip === index
                                                    && "var(--valid-1)"
                                                }
                                            />
                                            <Tooltip
                                                show={showTooltip === index}
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
                                    onMouseEnter={() => setShowTooltip(index + 1)}
                                    onMouseLeave={() => setShowTooltip(null)}
                                >
                                    <Icon
                                        name="cancel"
                                        size={20}
                                        fill={
                                            showTooltip === index + 1
                                            && "var(--error-1)"
                                        }
                                    />
                                    <Tooltip
                                        show={showTooltip === index + 1}
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
