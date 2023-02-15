import { useState, useMemo } from "react";
import { AvatarStatus, Icon, Tooltip } from "..";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useUserData from "../../hooks/useUserData";
import styles from "./UserListItem.module.css";
import Image from "next/image";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import useComponents from "../../hooks/useComponents";

const UserListItem = ({ content, user }) => {
    const [showTooltip, setShowTooltip] = useState(null);
    const [liHover, setLiHover] = useState(false);
    const [error, setError] = useState(null);

    let type;
    if (content === "pending") {
        type = user.type
        user = user.user;
    }

    const { auth } = useAuth();
    const { setUserProfile, menu, setMenu } = useComponents();
    const {
        friends,
        setFriends,
        blocked,
        setBlocked,
        requests,
        setRequests,
        channels,
        setChannels,
    } = useUserData();
    const axiosPrivate = useAxiosPrivate();
    const router = useRouter();

    const buttons = {
        all: {
            first: {
                name: "Message",
                icon: "message",
                fill: "var(--foreground-2)",
                func: () => createChannel()
            },
            second: {
                name: "More",
                icon: "more",
                fill: "var(--foreground-2)",
                func: (event) => {
                    setMenu({
                        items: smallMenuItems,
                        event: event,
                        parent: {
                            type: "userListItem",
                            id: user._id,
                        }
                    });
                }
            }
        },
        pending: {
            first: {
                name: "Accept",
                icon: "accept",
                fill: "var(--success-light)",
                func: () => addFriend()
            },
            second: {
                name: "Ignore",
                icon: "cancel",
                fill: "var(--error-1)",
                func: () => deleteFriend()
            },
            third: {
                name: "Cancel",
                icon: "cancel",
                fill: "var(--error-1)",
                func: () => deleteFriend()
            }
        },
        blocked: {
            second: {
                name: "Unblock",
                icon: "userDelete",
                fill: "var(--error-1)",
                func: () => unblockUser()
            },
        }
    }

    const buttonContent = content === "online" ? "all" : content;

    const largeMenuItems = content === "blocked" ? [
        {
            name: "Profile",
            func: () => setUserProfile({ user }),
        },
        {
            name: "Message",
            func: () => createChannel(),
        },
        {
            name: "Add Note",
            func: () => setUserProfile({ user, focusNote: true }),
        },
        { name: "Divider" },
        {
            name: "Unblock",
            func: () => unblockUser(),
        },
        { name: "Divider" },
        {
            name: "Copy ID",
            func: () => navigator.clipboard.writeText(user._id),
            icon: "id",
        },
    ] : [
        {
            name: "Profile",
            func: () => setUserProfile({ user }),
        },
        {
            name: "Message",
            func: () => createChannel(),
        },
        {
            name: content === "pending" ? "None" : "Call",
            func: () => console.log("Call"),
        },
        {
            name: "Add Note",
            func: () => setUserProfile({ user, focusNote: true }),
        },
        {
            name: content === "pending" ? "None" : "Add Friend Nickname",
            func: () => console.log("Add Friend Nickname"),
        },
        { name: "Divider" },
        {
            name: "Invite to Server",
            func: () => console.log("Invite to Server"),
            icon: "arrow",
            iconSize: 10,
        },
        {
            name: content === "pending"
                ? (type === 0 ? "Cancel Request" : "Accept Request")
                : "Remove Friend",
            func: () => {
                if (content === "pending") {
                    if (type === 0) {
                        deleteFriend();
                    } else {
                        addFriend();
                    }
                } else {
                    deleteFriend();
                }
            },
            danger: content !== "pending",
        },
        {
            name: "Block",
            func: () => blockUser(),
            danger: true,
        },
        { name: "Divider" },
        {
            name: "Copy ID",
            func: () => navigator.clipboard.writeText(user._id),
            icon: "id",
        },
    ];

    const smallMenuItems = [
        {
            name: "Start Video Call",
            func: () => console.log("Start Video Call"),
        },
        {
            name: "Start Voice Call",
            func: () => console.log("Start Voice Call"),
        },
        {
            name: "Remove Friend",
            func: () => deleteFriend(),
            danger: true,
        },
    ];

    const addFriend = async () => {
        const response = await axiosPrivate.post(
            `/users/@me/friends/${user._id}`,
        );

        if (!response.data.success) {
            setError(response.data.message);
        } else if (response.data.success) {
            setFriends((prev) => [...prev, response.data.friend]);
            setRequests(requests.filter((request) => request.user._id.toString() !== user._id));

            if (response.data.channel) {
                if (channels.every((channel) => channel._id.toString() !== response.data.channel._id)) {
                    setChannels((prev) => [response.data.channel, ...prev]);
                }
            }
        } else {
            setError("An error occurred.");
        }
    };

    const deleteFriend = async () => {
        const response = await axiosPrivate.delete(
            `/users/@me/friends/${user._id}`,
        );

        if (!response.data.success) {
            setError(response.data.message);
        } else if (response.data.success) {
            if (response.data.message === "Friend removed") {
                setFriends(friends.filter((friend) => friend._id.toString() !== user._id));
            } else if (response.data.message === "Request cancelled") {
                setRequests(requests.filter((request) => request.user._id.toString() !== user._id));
            }
        } else {
            setError("An error occurred.");
        }
    };

    const createChannel = async () => {
        const response = await axiosPrivate.post(
            `/users/@me/channels`,
            { recipients: [user._id] },
        );

        if (!response.data.success) {
            setError(response.data.message);
        } else if (response.data.success) {
            if (response.data.message === "Channel created") {
                setChannels((prev) => [response.data.channel, ...prev]);
            }
            router.push(`/channels/@me/${response.data.channel._id}`);
        } else {
            setError("An error occurred.");
        }
    };

    const blockUser = async () => {
        const response = await axiosPrivate.delete(
            `/users/${user._id}`,
        );

        if (!response.data.success) {
            setError(response.data.message);
        } else if (response.data.success) {
            setBlocked((prev) => [...prev, response.data.blocked]);
            setFriends(friends.filter((friend) => friend._id.toString() !== user._id));
            setRequests(requests.filter((request) => request.user._id.toString() !== user._id));
        } else {
            setError("An error occurred.");
        }
    };

    const unblockUser = async () => {
        const response = await axiosPrivate.post(
            `/users/${user._id}`,
        );

        if (!response.data.success) {
            setError(response.data.message);
        } else if (response.data.success) {
            setBlocked(blocked.filter((blocked) => blocked._id.toString() !== user._id));
        } else {
            setError("An error occurred.");
        }
    };

    if (!user || !user.avatar) return null;

    return useMemo(() => (
        <AnimatePresence>
            <motion.li
                className={(menu?.parent?.type === "userListItem" &&
                    menu?.parent?.id === user._id)
                    ? styles.liContainerActive : styles.liContainer}
                onClick={() => {
                    if ((content !== "online" && content !== "all")) return;
                    createChannel(user._id);
                }}
                onContextMenu={(event) => {
                    event.preventDefault();
                    setMenu({
                        items: largeMenuItems,
                        event: event,
                        parent: {
                            type: "userListItem",
                            id: user._id,
                        },
                    });
                }}
                onMouseEnter={() => {
                    setLiHover(true);
                    if (menu?.parent?.type !== "userListItem" ||
                        menu?.parent?.id === user._id) return;
                    setMenu(null);
                }}
                onMouseLeave={() => setLiHover(false)}
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
                            {((content !== "pending" && content !== "blocked") || type === 1) && (
                                <AvatarStatus
                                    status={user.status}
                                    background={(liHover || (menu?.parent?.type === "userListItem" &&
                                        menu?.parent?.id === user._id))
                                        ? "var(--background-hover-1)"
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
                                <span>
                                    {(content === "all" || content === "online") ? (
                                        !user.customStatus
                                            ? user.status
                                            : user.customStatus
                                    ) : content === "pending" ? (
                                        type === 0
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
                            && type !== 0
                        ) && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        buttons[buttonContent]?.first.func(user._id);
                                    }}
                                    onMouseEnter={() => setShowTooltip(1)}
                                    onMouseLeave={() => setShowTooltip(null)}
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
                                    if (type === 0) {
                                        buttons[buttonContent]?.third?.func(user._id);
                                    } else {
                                        buttons[buttonContent]?.second?.func(
                                            (content === "online" || content === "all"
                                                ? e
                                                : user._id), e
                                        );
                                    }
                                }}
                                onMouseEnter={() => setShowTooltip(2)}
                                onMouseLeave={() => setShowTooltip(null)}
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
                                    {type === 0
                                        ? "Cancel"
                                        : buttons[buttonContent]?.second?.name}
                                </Tooltip>
                            </button>
                        )}
                    </div>
                </div>
            </motion.li>
        </AnimatePresence >
    ), [showTooltip, liHover, menu]);
}

export default UserListItem;
