import { Tooltip, Icon, AvatarStatus } from "..";
import useUserData from "../../hooks/useUserData";
import styles from "./Style.module.css";
import { useRouter } from "next/router";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

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
                        <Icon name={search.length ? "cross" : "search"} size={20} />
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
                                    <AvatarStatus
                                        status={friend.status}
                                        background={liHover === index ? "var(--background-hover-1)" : "var(--background-4)"}
                                    />
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
                                    <Icon name="message" size={20} />
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
                                    <Icon name="more" size={20} />
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
