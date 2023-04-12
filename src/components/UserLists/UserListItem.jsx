import { useState, useMemo } from "react";
import { AvatarStatus, Icon, Tooltip } from "..";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useUserData from "../../hooks/useUserData";
import styles from "./UserListItem.module.css";
import Image from "next/image";
import { useRouter } from "next/router";
import useComponents from "../../hooks/useComponents";

const UserListItem = ({ content, user }) => {
    const [showTooltip, setShowTooltip] = useState(null);
    const [liHover, setLiHover] = useState(false);

    let type;
    if (content === "pending") {
        type = user.type
        user = user.user;
    }

    const { fixedLayer, setFixedLayer } = useComponents();
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
                func: () => createChannel(),
            },
            second: {
                name: "More",
                icon: "more",
                fill: "var(--foreground-2)",
                func: (event) => {
                    setFixedLayer({
                        type: "menu",
                        event: event,
                        id: user._id,
                        user: user,
                        userlist: true,
                    });
                },
            },
        },
        pending: {
            first: {
                name: "Accept",
                icon: "accept",
                fill: "var(--success-light)",
                func: () => addFriend(),
            },
            second: {
                name: "Ignore",
                icon: "cancel",
                fill: "var(--error-1)",
                func: () => removeFriend(),
            },
            third: {
                name: "Cancel",
                icon: "cancel",
                fill: "var(--error-1)",
                func: () => removeFriend(),
            }
        },
        blocked: {
            second: {
                name: "Unblock",
                icon: "userDelete",
                fill: "var(--error-1)",
                func: () => unblockUser(),
            },
        },
    }

    const buttonContent = content === "online" ? "all" : content;

    const addFriend = async () => {
        const response = await axiosPrivate.post(
            `/users/@me/friends/${user._id}`,
        );

        if (response.data.success) {
            setFriends((prev) => [...prev, response.data.friend]);
            setRequests(requests.filter((request) => request.user._id.toString() !== user._id));

            if (response.data.channel) {
                if (channels.every((channel) => channel._id.toString() !== response.data.channel._id)) {
                    setChannels((prev) => [response.data.channel, ...prev]);
                }
            }
        }
    };

    const removeFriend = async () => {
        const response = await axiosPrivate.delete(
            `/users/@me/friends/${user._id}`,
        );

        if (response.data.success) {
            if (response.data.message === "Friend removed") {
                setFriends(friends.filter((friend) => friend._id.toString() !== user._id));
            } else if (response.data.message === "Request cancelled") {
                setRequests(requests.filter((request) => request.user._id.toString() !== user._id));
            }
        }
    };

    const createChannel = async () => {
        const response = await axiosPrivate.post(
            `/users/@me/channels`,
            { recipients: [user._id] },
        );

        if (response.data.success) {
            if (response.data.message === "Channel created") {
                setChannels((prev) => [response.data.channel, ...prev]);
            }
            router.push(`/channels/@me/${response.data.channel._id}`);
        }
    };

    const blockUser = async () => {
        const response = await axiosPrivate.delete(
            `/users/${user._id}`,
        );

        if (response.data.success) {
            setBlocked((prev) => [...prev, response.data.blocked]);
            setFriends(friends.filter((friend) => friend._id.toString() !== user._id));
            setRequests(requests.filter((request) => request.user._id.toString() !== user._id));
        }
    };

    const unblockUser = async () => {
        const response = await axiosPrivate.post(
            `/users/${user._id}`,
        );

        response.data.success && setBlocked(
            blocked.filter((blocked) => blocked._id.toString() !== user._id)
        );
    };

    if (!user) return null;

    return useMemo(() => (
        <li
            className={
                (fixedLayer?.id === user._id || liHover)
                    ? styles.liContainerActive : styles.liContainer
            }
            onClick={() => {
                if ((content !== "online" && content !== "all")) return;
                createChannel(user._id);
            }}
            onContextMenu={(event) => {
                event.preventDefault();
                setFixedLayer({
                    type: "menu",
                    event: event,
                    id: user._id,
                    user: user,
                });
            }}
            onMouseEnter={() => {
                setLiHover(true);
                if (!fixedLayer?.id || fixedLayer?.id === user._id) return;
                setFixedLayer(null);
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
                        {((content !== "pending" && content !== "blocked")) && (
                            <AvatarStatus
                                status={user.status}
                                background={"var(--background-4)"}
                            />
                        )}
                    </div>
                    <div className={styles.text}>
                        <p className={styles.textUsername}>
                            {user.username}
                        </p>

                        <p className={styles.textStatus}>
                            <span>
                                {type === 0 ? "Outgoing Friend Request"
                                    : type === 1 ? "Incoming Friend Request"
                                        : content === "blocked" ? "Blocked"
                                            : user.customStatus ? user.customStatus
                                                : user.status}
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
        </li>
    ), [showTooltip, liHover, fixedLayer]);
}

export default UserListItem;
