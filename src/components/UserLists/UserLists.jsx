import { Tooltip, Icon, AvatarStatus, Menu, Alerts } from "..";
import { useEffect, useRef, useState } from "react";
import useUserData from "../../hooks/useUserData";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import styles from "./UserList.module.css";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from 'uuid';

const UserLists = ({ list, content }) => {
    const [search, setSearch] = useState("");
    const [filteredList, setFilteredList] = useState(list);
    const [liHover, setLiHover] = useState(null);
    const [showTooltip, setShowTooltip] = useState(null);
    const [showTooltip2, setShowTooltip2] = useState(null);
    const [showMenu, setShowMenu] = useState(null);
    const [showRightMenu, setShowRightMenu] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (search) {
            setFilteredList(list.filter((user) =>
                user.username.toLowerCase().includes(search.toLowerCase()))
            );
        } else setFilteredList(list);
    }, [list, content, search]);

    useEffect(() => {
        if (!error || error === "") return;

        const timout = setTimeout(() => {
            setError(null);
        }, 10000);

        return () => clearTimeout(timout);
    }, [error]);

    const searchBar = useRef(null);
    const router = useRouter();
    const axiosPrivate = useAxiosPrivate();
    const {
        auth,
        friends,
        setFriends,
        blockedUsers,
        setBlockedUsers,
        friendRequests,
        setFriendRequests,
    } = useUserData();

    const buttons = {
        all: {
            first: {
                name: "Message",
                icon: "message",
                func: (id) => startConversation(id)
            },
            second: {
                name: "More",
                icon: "more",
                func: (index) => setShowMenu(index)
            }
        },
        online: {
            first: {
                name: "Message",
                icon: "message",
                func: (id) => startConversation(id)
            },
            second: {
                name: "More",
                icon: "more",
                func: (index) => setShowMenu(index)
            }
        },
        pending: {
            first: {
                name: "Accept",
                icon: "accept",
                fill: "var(--valid-1)",
                func: (index) => setShowMenu(index)
            },
            second: {
                name: "Ignore",
                icon: "cancel",
                fill: "var(--error-1)",
                func: (id) => cancelRequest(id)
            },
            third: {
                name: "Cancel",
                icon: "cancel",
                func: (index) => setShowMenu(index)
            }
        },
        blocked: {
            first: {
                name: "Unblock",
                icon: "userDelete",
                fill: "var(--error-1)",
                func: (id) => unblockUser(id)
            },
        }
    }

    const rightMenuItems = [
        {
            name: "Profile", func: () => {
                console.log("Profile");
            },
        },
        {
            name: "Message", func: () => {
                startConversation(list[showRightMenu.index]._id);
            },
        },
        {
            name: "Call", func: () => {
                console.log("Call");
            },
        },
        {
            name: "Add Note", func: () => {
                console.log("Add Note");
            },
        },
        {
            name: "Add Friend Nickname", func: () => {
                console.log("Add Friend Nickname");
            },
        },
        { name: "Divider" },
        {
            name: "Invite to Server", func: () => {
                console.log("Invite to Server");
            },
        },
        {
            name: "Remove Friend", func: () => {
                removeFriend(list[showRightMenu.index]._id);
            }, danger: true
        },
        {
            name: "Block", func: () => {
                blockUser(list[showRightMenu.index]._id);
            }, danger: true
        },
        { name: "Divider" },
        {
            name: "Copy ID", icon: "id", func: () => {
                navigator.clipboard.writeText(list[showRightMenu.index]._id)
            }
        },
    ];

    const moreMenuItems = [
        {
            name: "Start Video Call", func: () => {
                console.log("Start Video Call");
            },
        },
        {
            name: "Start Voice Call", func: () => {
                console.log("Start Voice Call");
            },
        },
        {
            name: "Remove Friend", func: () => {
                removeFriend(list[showMenu]._id);
            }, danger: true
        },
    ];

    const removeFriend = async (userID) => {
        try {
            const data = await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/remove`,
                { userID }
            );
            if (data.data.error) {
                setError(data.data.error);
            } else {
                setFriends(friends.filter((friend) => friend._id.toString() !== userID));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const blockUser = async (userID) => {
        try {
            const data = await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/block`,
                { userID }
            );
            if (data.data.error) {
                setError(data.data.error);
            } else {
                setFriends(friends.filter((friend) => friend._id.toString() !== userID));
                setBlockedUsers((prev) => [...prev, data.data.user]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const startConversation = async (userID) => {
        try {
            const data = await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/create`,
                { userID }
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

    const cancelRequest = async (userID) => {
        try {
            const data = await axiosPrivate.post(
                `/users/${auth?.user?._id}/friends/cancel`,
                { userID },
            );
            if (data.data.error) {
                setError(data.data.error);
            } else {
                setFriendRequests(
                    friendRequests.filter((request) => request._id.toString() !== userID)
                );
            }
        } catch (err) {
            console.error(err);
        }
    };

    const acceptRequest = async (userID) => {
        try {
            const data = await axiosPrivate.post(
                `/users/${auth?.user?._id}/friends/accept`,
                { userID },
            );
            if (data.data.error) {
                setError(data.data.error);
            } else {
                setFriendRequests(
                    friendRequests.filter((request) => request._id.toString() !== userID)
                ); userID
                setFriends([...friends, data.data.user]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const ignoreRequest = async (userID) => {
        try {
            const data = await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/ignore`,
                { userID },
            );
            if (data.data.error) {
                setError(data.data.error);
            } else {
                setFriendRequests(
                    friendRequests.filter((request) => request._id.toString() !== userIDD)
                );
            }
        } catch (err) {
            console.error(err);
        }
    };

    const unblockUser = async (userID) => {
        try {
            const data = await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/unblock`,
                { userID }
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

    if (!list.length) {
        return (
            <div className={styles.content}>
                <div className={styles.noData}>
                    <img
                        src={content === "all"
                            ? "/images/no-friends.svg"
                            : content === "online"
                                ? "/images/no-online.svg"
                                : content === "pending"
                                    ? "/images/no-pending.svg"
                                    : "/images/no-blocked.svg"}
                        alt="no-data"
                    />

                    <div>
                        {content === "all"
                            ? "Wumpus is waiting on friends. You don't have to though!"
                            : content === "online"
                                ? "No one's around to play with Wumpus."
                                : content === "pending"
                                    ? "There are no pending requests. Here's Wumpus for now."
                                    : "You can't unblock the Wumpus."}

                    </div>
                </div>
            </div>
        )
    } else if (!filteredList.length && search.length) {
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
                Your search for "{search}" did not match any {content === "all" ? "Friends" : content === "online" ? "Online" : content === "pending" ? "Pending" : "Blocked"}.
            </h2>
        </div>
    }

    return (
        <div className={styles.content}>

            <AnimatePresence>
                {error && <Alerts type="error" message={error} />}
            </AnimatePresence>

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
                {content === "all" ? "All Friends " : content === "online"
                    ? "Online " : content === "pending" ? "Pending " : "Blocked "}
                — {filteredList.length}
            </h2>
            <ul className={styles.listContainer}>
                {filteredList?.map((user, index) => (
                    <li
                        key={uuidv4()}
                        className={styles.liContainer}
                        onClick={() => {
                            if (!(content === "online" || content === "all")) return;
                            startConversation(user._id);
                        }}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            setShowRightMenu({ index, x: e.clientX, y: e.clientY });
                        }}
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
                        {showRightMenu?.index === index && (
                            <Menu
                                items={rightMenuItems}
                                position="mouse"
                                mousePos={{ x: showRightMenu.x, y: showRightMenu.y }}
                                setMenu={{
                                    func: () => setShowRightMenu(null),
                                }}
                            />
                        )}

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
                                    <p className={styles.textUsername}>
                                        {user.username}
                                    </p>

                                    <p className={styles.textStatus}>
                                        <span title="Custom Status">
                                            {(content === "all" || content === "online") ? (
                                                user.customStatus === ""
                                                    ? user.status
                                                    : user.customStatus
                                            ) : content === "pending" ? (
                                                user.type === "sent"
                                                    ? "Outgoing request"
                                                    : "Incoming request"
                                            ) : "Blocked"}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className={styles.actions}>

                                <button
                                    onMouseEnter={() => setShowTooltip(index)}
                                    onMouseLeave={() => setShowTooltip(null)}
                                >
                                    <Icon
                                        name={buttons[content]?.first.icon}
                                        size={20}
                                        fill={
                                            (content === "pending" || content === "blocked")
                                            && (
                                                showTooltip === index
                                                && buttons[content]?.first.fill
                                            )
                                        }
                                    />

                                    <Tooltip show={showTooltip === index}>
                                        {buttons[content]?.first.name}
                                    </Tooltip>
                                </button>

                                {buttons[content]?.second && (
                                    <button
                                        onMouseEnter={() => setShowTooltip2(index)}
                                        onMouseLeave={() => setShowTooltip2(null)}
                                    >
                                        <Icon
                                            name={buttons[content]?.second.icon}
                                            size={20}
                                            fill={
                                                (content === "pending" || content === "blocked")
                                                && (
                                                    showTooltip2 === index
                                                    && buttons[content]?.second.fill
                                                )
                                            }
                                        />

                                        <Tooltip show={showTooltip2 === index}>
                                            {buttons[content]?.second.name}
                                        </Tooltip>

                                        {showMenu === index && (
                                            <Menu
                                                items={moreMenuItems}
                                                position={{
                                                    top: "calc(100% + 5px)",
                                                    right: "0",
                                                }}
                                                setMenu={{
                                                    func: () => {
                                                        setShowMenu(null);
                                                        setShowTooltip(null);
                                                        setLiHover(null);
                                                    }
                                                }}
                                            />
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div >
    );
};

export default UserLists;
