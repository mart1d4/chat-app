import styles from "./ChannelListItem.module.css";
import { useRouter } from "next/router";
import { Icon, AvatarStatus } from "..";
import useUserData from "../../hooks/useUserData";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";

const ChannelListItem = ({ channel, special }) => {
    const [hover, setHover] = useState(false);
    const [error, setError] = useState(false);
    const [user, setUser] = useState(null);
    const [recipients, setRecipients] = useState(null);

    useEffect(() => {
        if (!channel) return;

        if (channel?.type === 0) {
            setUser(channel?.recipients.filter(
                (recipient) => recipient._id.toString() !== auth?.user?._id.toString()
            )[0]);
        } else {
            setRecipients(channel?.recipients);
        }
    }, [channel]);

    useEffect(() => {
        console.log("ChannelRender");
    }, []);

    const router = useRouter();
    const currentPath = router.asPath;

    const {
        auth,
        friends,
        requests,
        channels,
        setChannels,
        setMenu,
        setUserProfile,
        setFriends,
        setRequests,
        setBlocked,
    } = useUserData();
    const axiosPrivate = useAxiosPrivate();

    const removeChannel = async () => {
        const response = await axiosPrivate.delete(
            `/channels/${channel._id}`
        );

        if (!response.data.success) {
            setError(true);
        } else if (response.data.success) {
            const newChannels = channels.filter((chan) => chan._id.toString() !== channel._id.toString());
            setChannels(newChannels);
            router.push("/channels/@me");
        } else {
            setError(true);
        }
    }

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

    const isFriend = () => {
        return friends?.some((friend) => friend?._id.toString() === user?._id);
    };

    const requestReceived = requests?.filter((request) => request.type === 1).length;

    const menuItems = [
        {
            name: "Mark As Read",
            func: () => console.log("Mark As Read"),
        },
        { name: "Divider" },
        {
            name: "Profile",
            func: () => setUserProfile({ user }),
        },
        {
            name: "Call",
            func: () => console.log("Call"),
        },
        {
            name: "Add Note",
            func: () => setUserProfile({ user, focusNote: true }),
        },
        {
            name: "Add Friend Nickname",
            func: () => console.log("Add Friend Nickname"),
        },
        {
            name: "Close DM",
            func: () => removeChannel(),
        },
        { name: "Divider" },
        {
            name: "Invite To Server",
            func: () => console.log("Invite To Server"),
            icon: "arrow",
            iconSize: 10,
        },
        {
            name: "Remove Friend",
            func: () => deleteFriend(),
        },
        {
            name: "Block",
            func: () => blockUser(),
        },
        { name: "Divider" },
        {
            name: `Mute @${user?.username}`,
            func: () => console.log(`Mute @${user?.username}`),
            icon: "arrow",
            iconSize: 10,
        },
        { name: "Divider" },
        {
            name: "Copy ID",
            func: () => navigator.clipboard.writeText(user?._id),
            icon: "id",
        },
    ];

    if (special) {
        return (
            <li
                className={currentPath === "/channels/@me"
                    ? styles.liContainerActive
                    : styles.liContainer}
                onClick={() => {
                    localStorage.setItem(
                        "private-channel-url",
                        `/channels/@me`
                    );
                    router.push("/channels/@me")
                }}
            >
                <div className={styles.liWrapper}>
                    <div className={styles.linkFriends}>
                        <div className={styles.layoutFriends}>
                            <div className={styles.layoutAvatar}>
                                <Icon
                                    name="friends"
                                    fill={
                                        currentPath === "/channels/@me"
                                            ? "var(--foreground-1)"
                                            : "var(--foreground-3)"
                                    }
                                />
                            </div>
                            <div className={styles.layoutContent}>
                                <div className={styles.contentName}>
                                    <div className={styles.nameWrapper}>
                                        Friends
                                    </div>
                                </div>
                            </div>
                        </div>

                        {requestReceived > 0 && (
                            <div className={styles.friendsPending}>
                                {requestReceived}
                            </div>
                        )}
                    </div>
                </div>
            </li>
        );
    }

    return useMemo(() => (
        <li
            className={currentPath === `/channels/@me/${channel?._id}`
                ? styles.liContainerActive
                : styles.liContainer}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(null)}
            onClick={() => {
                localStorage.setItem(
                    "private-channel-url",
                    `/channels/@me/${channel?._id}`
                );
                router.push(`/channels/@me/${channel?._id}`);
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                setMenu({
                    items: menuItems,
                    event: e,
                });
            }}
        >
            <div className={styles.liWrapper}>
                <div className={styles.link}>
                    <div className={styles.layout}>
                        <div className={styles.layoutAvatar}>
                            {user?.avatar && (
                                <Image
                                    src={user.avatar}
                                    width={32}
                                    height={32}
                                    alt="Avatar"
                                />
                            )}
                            <AvatarStatus
                                status={user?.status}
                                background={
                                    hover
                                        ? "var(--background-hover-2)"
                                        : currentPath === `/channels/@me/${channel?._id}`
                                            ? "var(--background-active)"
                                            : "var(--background-3)"
                                }
                                tooltip={true}
                                friend={isFriend()}
                            />
                        </div>
                        <div className={styles.layoutContent}>
                            <div className={styles.contentName}>
                                <div className={styles.nameWrapper}>
                                    {user?.username}
                                </div>
                            </div>
                            {(user?.customStatus !== null && isFriend())
                                && (<div className={styles.contentStatus}>
                                    {user?.customStatus}
                                </div>)}
                        </div>
                    </div>
                </div>

                <div
                    className={styles.closeButton}
                    onClick={(e) => {
                        e.stopPropagation();
                        removeChannel();
                    }}
                >
                    <Icon
                        name="close"
                        size={16}
                    />
                </div>
            </div>
        </li>
    ), [user, recipients, hover]);
};

export default ChannelListItem;
