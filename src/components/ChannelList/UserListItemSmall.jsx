import styles from "./UserListItemSmall.module.css";
import { useRouter } from "next/router";
import { Icon, AvatarStatus } from "..";
import useUserData from "../../hooks/useUserData";
import useComponents from "../../hooks/useComponents";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useState, useMemo } from "react";
import Image from "next/image";
import useAuth from "../../hooks/useAuth";

const UserListItemSmall = ({ special, user, channel }) => {
    const [hover, setHover] = useState(false);
    const [error, setError] = useState(false);

    const router = useRouter();
    const currentPath = router.asPath;
    const axiosPrivate = useAxiosPrivate();

    const { auth } = useAuth();
    const { setMenu, setUserProfile } = useComponents();
    const {
        friends,
        requests,
        blocked,
        channels,
        setFriends,
        setRequests,
        setBlocked,
        setChannels,
    } = useUserData();

    const removeChannel = async () => {
        const response = await axiosPrivate.delete(
            `/channels/${channel._id}`
        );

        if (!response.data.success) {
            setError(true);
        } else if (response.data.success) {
            const newChannels = channels.filter((chan) => chan._id.toString() !== channel._id.toString());
            setChannels(newChannels);
            setMenu(null);
            if (currentPath === `/channels/${channel._id}`) {
                router.push("/channels/@me");
            }
        } else {
            setError(true);
        }
    }

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

    const isFriend = () => {
        return friends?.some((friend) => friend?._id.toString() === user?._id)
            || auth?.user?._id.toString() === user?._id;
    };

    const isBlocked = () => {
        return blocked?.some((block) => block?._id.toString() === user?._id);
    };

    const receivedRequest = () => {
        return requests?.some((request) => {
            return request?.user?._id.toString() === user?._id && request?.type === 1;
        });
    };

    const sentRequest = () => {
        return requests?.some((request) => {
            return request?.user?._id.toString() === user?._id && request?.type === 0;
        });
    };

    const requestReceived = requests?.filter((request) => request.type === 1).length;

    let menuItems;

    if (channel) {
        menuItems = channel.type === 1 ? [
            {
                name: "Mark As Read",
                func: () => console.log("Mark As Read"),
                disabled: true,
            },
            { name: "Divider" },
            {
                name: "Invites",
                func: () => console.log("Invites"),
            },
            {
                name: "Change Icon",
                func: () => console.log("Change Icon"),
            },
            { name: "Divider" },
            {
                name: "Mute Conversation",
                func: () => console.log("Mute Conversation"),
                icon: "arrow",
                iconSize: 10,
            },
            { name: "Divider" },
            {
                name: "Leave Group",
                func: () => console.log("Leave Group"),
                danger: true,
            },
            { name: "Divider" },
            {
                name: "Copy ID",
                func: () => navigator.clipboard.writeText(user?._id),
                icon: "id",
            },
        ] : [
            {
                name: "Mark As Read",
                func: () => console.log("Mark As Read"),
                disabled: true,
            },
            { name: "Divider" },
            {
                name: "Profile",
                func: () => setUserProfile({ user }),
            },
            {
                name: "None",
                func: () => { },
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
                name: isFriend() ? "Add Friend Nickname" : "None",
                func: () => { },
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
                name: isBlocked() ? "None"
                    : isFriend() ? "Remove Friend"
                        : receivedRequest() ? "Accept Request"
                            : sentRequest() ? "Cancel Request"
                                : "Add Friend",
                func: () => {
                    if (isFriend() || sentRequest()) {
                        deleteFriend();
                    } else {
                        addFriend();
                    }
                },
            },
            {
                name: isBlocked() ? "Unblock" : "Block",
                func: () => {
                    if (isBlocked()) {
                        unblockUser();
                    } else {
                        blockUser();
                    }
                },
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
    } else {
        if (user?._id === auth?.user?._id) {
            menuItems = [
                {
                    name: "Profile",
                    func: () => setUserProfile({ user }),
                },
                {
                    name: "Mention",
                    func: () => { },
                },
                { name: "Divider" },
                {
                    name: "Copy ID",
                    func: () => navigator.clipboard.writeText(user?._id),
                    icon: "id",
                },
            ];
        } else {
            menuItems = [
                {
                    name: "Profile",
                    func: () => setUserProfile({ user }),
                },
                {
                    name: "Mention",
                    func: () => { },
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
                    func: () => setUserProfile({ user, focusNote: true }),
                },
                {
                    name: isFriend() ? "Add Friend Nickname" : "None",
                    func: () => { },
                },
                { name: channel?.owner === auth?.user?._id ? "Divider" : "None" },
                {
                    name: channel?.owner === auth?.user?._id ? "Remove From Group" : "None",
                    danger: true,
                },
                {
                    name: channel?.owner === auth?.user?._id ? "Make Group Owner" : "None",
                    danger: true,
                },
                { name: "Divider" },
                {
                    name: "Invite To Server",
                    func: () => console.log("Invite To Server"),
                    icon: "arrow",
                    iconSize: 10,
                },
                {
                    name: isBlocked() ? "None"
                        : isFriend() ? "Remove Friend"
                            : receivedRequest() ? "Accept Request"
                                : sentRequest() ? "Cancel Request"
                                    : "Add Friend",
                    func: () => {
                        if (isFriend() || sentRequest()) {
                            deleteFriend();
                        } else {
                            addFriend();
                        }
                    },
                },
                {
                    name: isBlocked() ? "Unblock" : "Block",
                    func: () => {
                        if (isBlocked()) {
                            unblockUser();
                        } else {
                            blockUser();
                        }
                    },
                },
                { name: "Divider" },
                {
                    name: "Copy ID",
                    func: () => navigator.clipboard.writeText(user?._id),
                    icon: "id",
                },
            ];
        }
    }

    if (special) {
        return (
            <li
                className={currentPath === "/channels/@me"
                    ? styles.liContainerActive
                    : styles.liContainer}
                onClick={() => {
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
            className={(currentPath === `/channels/@me/${channel?._id}` && channel)
                ? styles.liContainerActive
                : styles.liContainer}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(null)}
            onClick={() => {
                if (currentPath === `/channels/@me/${channel?._id}` || !channel) return;
                router.push(`/channels/@me/${channel?._id}`);
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                setMenu({
                    items: menuItems,
                    event: e,
                });
            }}
            style={(!channel && user?.status === "Offline") ? {
                opacity: 0.3,
            } : {}}
        >
            <div className={styles.liWrapper}>
                <div className={styles.link}>
                    <div className={styles.layout}>
                        <div className={styles.layoutAvatar}>
                            {channel?.type === 1 ? (
                                <Image
                                    src={channel.icon}
                                    width={32}
                                    height={32}
                                    alt="Avatar"
                                />
                            ) : (
                                <>
                                    <Image
                                        src={user?.avatar}
                                        width={32}
                                        height={32}
                                        alt="Avatar"
                                    />
                                    {((!channel && user?.status !== "Offline") || channel) && (
                                        <AvatarStatus
                                            status={(isFriend() || receivedRequest())
                                                ? user?.status : "Offline"}
                                            background={"var(--background-3)"}
                                            tooltip={true}
                                        />
                                    )}
                                </>
                            )}
                        </div>

                        <div className={styles.layoutContent}>
                            <div className={styles.contentName}>
                                <div className={styles.nameWrapper}>
                                    {channel?.type === 1 ? channel.name : user?.username}
                                </div>
                            </div>

                            {(user?.customStatus !== null && (isFriend() || receivedRequest())) && (
                                <div className={styles.contentStatus}>
                                    {user?.customStatus}
                                </div>
                            )}

                            {channel?.type === 1 && (
                                <div className={styles.contentStatus}>
                                    {channel?.recipients?.length} Member{channel?.recipients?.length > 1 && "s"}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {channel && (
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
                )}
            </div>
        </li>
    ), [user, channel, hover, router.query, friends]);
};

export default UserListItemSmall;
