import { Tooltip, Icon, AvatarStatus, Menu } from "..";
import useUserData from "../../hooks/useUserData";
import styles from "./Style.module.css";
import { useRouter } from "next/router";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useRef, useState } from "react";
import Image from "next/image";

const UserLists = ({ list, content }) => {
    const [search, setSearch] = useState("");
    const [showTooltip, setShowTooltip] = useState(null);
    const [liHover, setLiHover] = useState(null);
    const [showMenu, setShowMenu] = useState(null);
    const [error, setError] = useState(null);

    const searchBar = useRef(null);

    const { auth, friends, setFriends, setBlockedUsers } = useUserData();
    const router = useRouter();
    const axiosPrivate = useAxiosPrivate();

    const moreMenuItems = [
        { name: "Remove Friend", func: () => removeFriend(list[showMenu]._id), danger: true },
        { name: "Block", func: () => blockUser(list[showMenu]._id), danger: true },
        { name: "Message", func: () => startConversation(list[showMenu]._id) },
        { name: "Divider" },
        { name: "Copy ID", icon: "id", func: () => navigator.clipboard.writeText(list[showMenu]._id) },
    ];

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
            <h2 className={styles.title}>
                {content === "all" ? "All Friends" : content === "online"
                    ? "Online" : content === "pending" ? "Pending" : "Blocked"}
                — {list.length}
            </h2>
            <ul className={styles.listContainer}>
                {list.map((user, index) => (
                    <li
                        key={user._id}
                        className={
                            liHover === index
                                ? styles.liContainerHover
                                : styles.liContainer
                        }
                        onClick={() => startConversation(user._id)}
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
                                        src={user.avatar}
                                        width={32}
                                        height={32}
                                        alt="Avatar"
                                    />
                                    {(content === "online" || content === "all" || (
                                        content === "pending" && user.sender !== auth?.user?._id
                                    )) && (
                                            <AvatarStatus
                                                status={user.status}
                                                background={liHover === index ? "var(--background-hover-1)" : "var(--background-4)"}
                                            />
                                        )}
                                </div>
                                <div className={styles.text}>
                                    <p className={styles.textUsername}>{user.username}</p>
                                    <p className={styles.textStatus}>
                                        {user.customStatus === "" ? (user.status)
                                            : (
                                                <span title="Custom Status">{user.customStatus}</span>
                                            )}
                                    </p>
                                </div>
                            </div>
                            <div className={styles.actions}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        startConversation(user._id);
                                    }}
                                    onMouseEnter={() => setShowTooltip(user._id)}
                                    onMouseLeave={() => setShowTooltip(null)}
                                >
                                    <Icon name="message" size={20} />
                                    <Tooltip
                                        show={showTooltip === user._id}
                                    >
                                        Message
                                    </Tooltip>
                                </button>
                                <button
                                    onMouseEnter={() => setShowTooltip(user._id + 1)}
                                    onMouseLeave={() => setShowTooltip(null)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMenu(showMenu === index ? null : index);
                                        setShowTooltip(null);
                                    }}
                                >
                                    <Icon name="more" size={20} />
                                    <Tooltip
                                        show={showTooltip === user._id + 1}
                                    >
                                        More
                                    </Tooltip>

                                    {showMenu === index && (
                                        <Menu items={moreMenuItems} position={{
                                            top: "calc(100% + 5px)",
                                            right: "0",
                                        }} />
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

export default UserLists;
