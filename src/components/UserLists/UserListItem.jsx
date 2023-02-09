import { useState } from "react";
import { Menu, AvatarStatus, Icon, Tooltip } from "..";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useUserData from "../../hooks/useUserData";
import styles from "./UserListItem.module.css";
import Image from "next/image";
import { useRouter } from "next/router";

const UserListItem = ({ content, user }) => {
    const [showTooltip, setShowTooltip] = useState(null);
    const [showMenu, setShowMenu] = useState(null);
    const [liHover, setLiHover] = useState(false);
    const [error, setError] = useState(null);

    let type;
    if (content === "pending") {
        type = user.type
        user = user.user;
    }

    const {
        auth,
        friends,
        setFriends,
        blocked,
        setBlocked,
        requests,
        setRequests,
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

    const largeMenuItems = [
        {
            name: "Profile",
            func: () => console.log("Profile"),
        },
        {
            name: "Message",
            func: () => createChannel(),
        },
        {
            name: "Call",
            func: () => console.log("Call"),
        },
        {
            name: "Add Note",
            func: () => console.log("Add Note"),
        },
        {
            name: "Add Friend Nickname",
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
            name: "Remove Friend",
            func: () => deleteFriend(),
            danger: true,
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
                setChannels((prev) => [response.data.channel, ...prev]);
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

    if (!user) return null;

    return (
        <li
            tabIndex={0}
            className={styles.liContainer}
            onClick={() => {
                if ((content !== "online" && content !== "all")) return;
                createChannel(user._id);
            }}
            onContextMenu={(event) => {
                event.preventDefault();
                setShowMenu({
                    type: "large",
                    event: event,
                });
            }}
            onFocus={() => setLiHover(true)}
            onBlur={() => setLiHover(false)}
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
                    setMenu={{ func: () => setShowMenu(null) }}
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
                                    background={liHover
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
                            <span title="Custom Status">
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
                                onFocus={() => setShowTooltip(1)}
                                onBlur={() => setShowTooltip(null)}
                                onMouseEnter={() => setShowTooltip(1)}
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
                            onFocus={() => {
                                if (showMenu?.type === "small") return;
                                setShowTooltip(2);
                            }}
                            onBlur={() => setShowTooltip(null)}
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
                                {type === 0
                                    ? "Cancel"
                                    : buttons[buttonContent]?.second?.name}
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

export default UserListItem;
