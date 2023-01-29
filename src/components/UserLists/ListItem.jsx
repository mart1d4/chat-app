import { useState, useEffect } from "react";
import { Menu, AvatarStatus, Icon, Tooltip } from "..";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useUserData from "../../hooks/useUserData";
import styles from "./ListItem.module.css";
import Image from "next/image";
import { useRouter } from "next/router";

const ListItem = ({ content, user, index }) => {
    const [showTooltip, setShowTooltip] = useState(null);
    const [showMenu, setShowMenu] = useState(null);
    const [liHover, setLiHover] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!error || error === "") return;

        const timout = setTimeout(() => {
            setError(null);
        }, 10000);

        return () => clearTimeout(timout);
    }, [error]);

    const {
        auth,
        friends,
        setFriends,
        blockedUsers,
        setBlockedUsers,
        friendRequests,
        setFriendRequests,
    } = useUserData();
    const axiosPrivate = useAxiosPrivate();
    const router = useRouter();

    const buttons = {
        all: {
            first: {
                name: "Message",
                icon: "message",
                fill: "var(--foreground-2)",
                func: (id) => startConversation(id)
            },
            second: {
                name: "More",
                icon: "more",
                fill: "var(--foreground-2)",
                func: (event) => {
                    setShowMenu({
                        type: "small",
                        event: event,
                    });
                    setShowTooltip(null);
                }
            }
        },
        pending: {
            first: {
                name: "Accept",
                icon: "accept",
                fill: "var(--valid-1)",
                func: (id) => acceptRequest(id)
            },
            second: {
                name: "Ignore",
                icon: "cancel",
                fill: "var(--error-1)",
                func: (id) => ignoreRequest(id)
            },
            third: {
                name: "Cancel",
                icon: "cancel",
                fill: "var(--error-1)",
                func: (id) => cancelRequest(id)
            }
        },
        blocked: {
            second: {
                name: "Unblock",
                icon: "userDelete",
                fill: "var(--error-1)",
                func: (id) => unblockUser(id)
            },
        }
    }

    const buttonContent = content === "online" ? "all" : content;

    const largeMenuItems = [
        {
            name: "Profile", func: () => {
                console.log("Profile");
            },
        },
        {
            name: "Message", func: (id) => {
                startConversation(id);
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
            name: "Remove Friend", func: (id) => {
                removeFriend(id);
            }, danger: true
        },
        {
            name: "Block", func: (id) => {
                blockUser(id);
            }, danger: true
        },
        { name: "Divider" },
        {
            name: "Copy ID", icon: "id", func: (id) => {
                navigator.clipboard.writeText(id)
            }
        },
    ];

    const smallMenuItems = [
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
            name: "Remove Friend", func: (id) => {
                removeFriend(id);
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
            console.log(data);
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

    return (
        <li
            className={styles.liContainer}
            onClick={() => {
                if ((content !== "online" && content !== "all")) return;
                startConversation(user._id);
            }}
            onContextMenu={(event) => {
                event.preventDefault();
                setShowMenu({
                    type: "large",
                    event: event,
                });
            }}
            onMouseEnter={() => setLiHover(true)}
            onMouseLeave={() => {
                setLiHover(false);
                setShowMenu(null);
            }}
            style={
                (showMenu?.type) &&
                {
                    backgroundColor: "var(--background-hover-1)",
                    borderRadius: "8px",
                    margin: "0 10px 0 20px",
                    padding: "16px 10px",
                    borderColor: "transparent",
                }
            }
        >
            {showMenu?.type === "large" && (
                <Menu
                    items={largeMenuItems}
                    event={showMenu.event}
                    setMenu={{
                        func: () => setShowMenu(null)
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
                                    background={
                                        liHover ? "var(--background-hover-1)"
                                            : "var(--background-4)"
                                    }
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

                    {(
                        content !== "blocked"
                        && user?.type !== "sent"
                    ) && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    buttons[buttonContent]?.first.func(user._id);
                                }}
                                onMouseEnter={() => {
                                    setShowTooltip(1);
                                }}
                                onMouseLeave={() => setShowTooltip(null)}
                                style={{
                                    backgroundColor: (showMenu?.type) && "var(--background-1)",
                                }}
                            >
                                <Icon
                                    name={buttons[buttonContent]?.first?.icon}
                                    size={20}
                                    fill={
                                        showTooltip === 1
                                        && buttons[buttonContent]?.first?.fill
                                    }
                                />

                                <Tooltip
                                    show={showTooltip === 1}
                                    dist={4}
                                >
                                    {buttons[buttonContent]?.first?.name}
                                </Tooltip>
                            </button>
                        )}

                    {buttons[buttonContent]?.second && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (user?.type === "sent") {
                                    buttons[buttonContent]?.third?.func(user._id);
                                } else {
                                    buttons[buttonContent]?.second?.func(
                                        (content === "online" || content === "all"
                                            ? index
                                            : user._id), e
                                    );
                                }
                            }}
                            onMouseEnter={() => {
                                if (showMenu?.type === "small") return;
                                setShowTooltip(2);
                            }}
                            onMouseLeave={() => setShowTooltip(null)}
                            style={{
                                backgroundColor: (showMenu?.type) && "var(--background-1)",
                            }}
                        >
                            <Icon
                                name={buttons[buttonContent]?.second?.icon}
                                size={20}
                                fill={
                                    showTooltip === 2
                                    && buttons[buttonContent]?.second?.fill
                                }
                            />

                            <Tooltip
                                show={showTooltip === 2}
                                dist={4}
                            >
                                {
                                    user?.type === "sent"
                                        ? "Cancel"
                                        : buttons[buttonContent]?.second?.name
                                }
                            </Tooltip>

                            {showMenu?.type === "small" && (
                                <Menu
                                    items={smallMenuItems}
                                    event={showMenu.event}
                                    setMenu={{
                                        func: () => setShowMenu(null)
                                    }}
                                />
                            )}
                        </button>
                    )}
                </div>
            </div>
        </li>
    );
}

export default ListItem;
