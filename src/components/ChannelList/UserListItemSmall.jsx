import styles from "./UserListItemSmall.module.css";
import { useRouter } from "next/router";
import { Icon, AvatarStatus } from "..";
import useUserData from "../../hooks/useUserData";
import useComponents from "../../hooks/useComponents";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import useAuth from "../../hooks/useAuth";

const UserListItemSmall = ({ special, user, channel }) => {
    const [hover, setHover] = useState(false);
    const [error, setError] = useState(false);

    const router = useRouter();
    const currentPath = router.asPath;
    const axiosPrivate = useAxiosPrivate();

    const { auth } = useAuth();
    const { fixedLayer, setFixedLayer } = useComponents();
    const {
        friends,
        requests,
        channels,
        setChannels,
    } = useUserData();
    const listItemRef = useRef(null);

    const removeChannel = async () => {
        const response = await axiosPrivate.delete(
            `/channels/${channel._id}`
        );

        if (!response.data.success) {
            setError(true);
        } else if (response.data.success) {
            const newChannels = channels.filter((chan) => chan._id.toString() !== channel._id.toString());
            setChannels(newChannels);
            if (currentPath === `/channels/${channel._id}`) {
                router.push("/channels/@me");
            }
        } else {
            setError(true);
        }
    }

    const isFriend = () => {
        return friends?.some((friend) => friend?._id.toString() === user?._id)
            || auth?.user?._id.toString() === user?._id;
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

    if (special) {
        return (
            <li
                className={
                    currentPath === "/channels/@me"
                        ? styles.liContainerActive
                        : styles.liContainer
                }
                onClick={() => router.push("/channels/@me")}
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
            ref={listItemRef}
            className={
                (currentPath === `/channels/@me/${channel?._id}` && channel)
                    ? styles.liContainerActive
                    : styles.liContainer
            }
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(null)}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (currentPath === `/channels/@me/${channel?._id}` || !channel) {
                    if (!channel) {
                        if (fixedLayer?.element === listItemRef.current) {
                            setFixedLayer(null);
                        } else {
                            setFixedLayer(null);
                            setTimeout(() => {
                                setFixedLayer({
                                    type: "usercard",
                                    event: e,
                                    user: user,
                                    element: listItemRef.current,
                                    side: "left",
                                    gap: 16,
                                });
                            }, 10);
                        }
                    };
                    return;
                };
                router.push(`/channels/@me/${channel?._id}`);
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                setFixedLayer({
                    type: "menu",
                    event: e,
                    user: user,
                    channel: channel || null,
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
                                            background={
                                                currentPath === `/channels/@me/${channel?._id}`
                                                    ? "var(--background-5)" : "var(--background-3)"
                                            }
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

                            {(user?.customStatus !== null && (isFriend() || receivedRequest()) && channel?.type !== 1) && (
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
