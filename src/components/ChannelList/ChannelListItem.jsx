import styles from "./ChannelListItem.module.css";
import { useRouter } from "next/router";
import { Icon, AvatarStatus } from "..";
import useUserData from "../../hooks/useUserData";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
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

    const router = useRouter();
    const currentPath = router.asPath;

    const {
        auth,
        friends,
        requests,
        channels,
        setChannels,
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

    const isFriend = () => {
        return friends?.some((friend) => friend?._id.toString() === user?._id);
    };

    const requestReceived = requests?.filter((request) => request.type === 1).length;

    if (special) {
        return (
            <div
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
            </div>
        );
    }

    return (
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
    );
};

export default ChannelListItem;
