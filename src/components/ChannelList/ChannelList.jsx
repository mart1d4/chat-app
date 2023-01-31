import styles from "./ChannelList.module.css";
import { useRouter } from "next/router";
import { Tooltip, Icon, AvatarStatus, Menu } from "..";
import useUserData from "../../hooks/useUserData";
import useLogout from "../../hooks/useLogout";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
import Image from "next/image";

const ConversationList = () => {
    const [hover, setHover] = useState(false);
    const [showMenu, setShowMenu] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        console.log("Show menu:", showMenu);
    }, [showMenu]);

    const router = useRouter();
    const currentPath = router.asPath;

    const {
        auth,
        friends,
        friendRequests,
        channelList,
        setChannelList,
        setShowSettings,
    } = useUserData();
    const { logout } = useLogout();
    const axiosPrivate = useAxiosPrivate();
    const requestReceived = friendRequests.filter((request) => request.type === "received").length;

    const isFriend = (id) => {
        return friends.some((friend) => friend._id.toString() === id);
    };

    const menuItems = [
        { name: "Profile", func: () => { } },
        { name: "Set Status", func: () => { } },
        { name: "Divider" },
        { name: "Logout", icon: "logout", func: () => logout() },
        { name: "Divider" },
        {
            name: "Copy ID", icon: "id", func: () => {
                navigator.clipboard.writeText(auth?.user?._id);
            }
        },
    ]

    const removeChannel = async (channelID) => {
        const response = await axiosPrivate.delete(
            `/private/${channelID}/remove`,
            { userID: auth?.user?._id }
        );
        if (response.data.error) {
            console.error(response.data.error);
        } else {
            setChannelList(channelList.filter((channel) => channel._id.toString() !== channelID));
        }
    }

    return (
        <div className={styles.nav}>
            <div className={styles.privateChannels}>
                <div className={styles.searchContainer}>
                    <button className={styles.searchButton}>
                        Find or start a conversation
                    </button>
                </div>

                <div className={styles.scroller}>
                    <ul className={styles.channelList}>
                        <div></div>
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

                        <h2 className={styles.title}>
                            <span>Direct Messages</span>
                            <div
                                onMouseEnter={() => setHover("create")}
                                onMouseLeave={() => setHover(null)}
                            >
                                <Icon
                                    name="add"
                                    size={16}
                                    viewbox="0 0 18 18"
                                />
                                <Tooltip show={hover === "create"}>
                                    Create DM
                                </Tooltip>
                            </div>
                        </h2>
                        {channelList?.map((conv) => (
                            <li
                                key={conv?.members[0]._id}
                                className={currentPath === `/channels/@me/${conv?._id}`
                                    ? styles.liContainerActive
                                    : styles.liContainer}
                                onMouseEnter={() => setHover(conv?.members[0]._id)}
                                onMouseLeave={() => setHover(null)}
                                onClick={() => {
                                    localStorage.setItem(
                                        "private-channel-url",
                                        `/channels/@me/${conv?._id}`
                                    );
                                    router.push(`/channels/@me/${conv?._id}`);
                                }}
                            >
                                <div className={styles.liWrapper}>
                                    <div className={styles.link}>
                                        <div className={styles.layout}>
                                            <div className={styles.layoutAvatar}>
                                                <Image
                                                    src={conv?.members[0].avatar}
                                                    width={32}
                                                    height={32}
                                                    alt="Avatar"
                                                />
                                                <AvatarStatus
                                                    status={conv?.members[0].status}
                                                    background={
                                                        hover === conv?.members[0]._id
                                                            ? "var(--background-hover-2)"
                                                            : currentPath === `/channels/@me/${conv?._id}`
                                                                ? "var(--background-active)"
                                                                : "var(--background-3)"
                                                    }
                                                    tooltip={true}
                                                    friend={isFriend(conv?.members[0]._id)}
                                                />
                                            </div>
                                            <div className={styles.layoutContent}>
                                                <div className={styles.contentName}>
                                                    <div className={styles.nameWrapper}>
                                                        {conv?.members[0].username}
                                                    </div>
                                                </div>
                                                {(conv?.members[0].customStatus !== "" && isFriend(conv?.members[0]._id))
                                                    && (<div className={styles.contentStatus}>
                                                        {conv?.members[0].customStatus}
                                                    </div>)}
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className={styles.closeButton}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeChannel(conv?._id);
                                        }}
                                    >
                                        <Icon
                                            name="close"
                                            size={16}
                                        />
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className={styles.userSectionContainer}>
                <div className={styles.userSection}>
                    <div
                        className={styles.avatarWrapper}
                        onClick={() => setShowMenu(!showMenu)}
                        style={{ backgroundColor: showMenu && "var(--background-hover-1)" }}
                        onMouseEnter={() => setHover("user")}
                        onMouseLeave={() => setHover(false)}
                    >
                        <div>
                            {auth?.user?.avatar && (
                                <Image
                                    src={auth?.user?.avatar}
                                    width={32}
                                    height={32}
                                    alt="Avatar"
                                />
                            )}
                            <AvatarStatus
                                status={auth?.user?.status}
                                background={hover === "user" || showMenu
                                    ? "var(--background-hover-1)" : "var(--background-2)"}
                            />
                        </div>
                        <div className={styles.contentWrapper}>
                            <div>
                                {auth?.user?.username}
                            </div>
                            <div>
                                {auth?.user?.customStatus === ""
                                    ? "#0001"
                                    : auth?.user?.customStatus}
                            </div>
                        </div>

                        {
                            showMenu &&
                            <Menu
                                items={menuItems}
                                position={{
                                    bottom: "calc(100% + 12px)",
                                    left: "0px",
                                }}
                                setMenu={{ func: () => setShowMenu(null) }}
                            />
                        }
                    </div>

                    <div className={styles.toolbar}>
                        <button
                            onMouseEnter={() => setShowTooltip(1)}
                            onMouseLeave={() => setShowTooltip(null)}
                        >
                            <Tooltip show={showTooltip === 1}>
                                Mute
                            </Tooltip>
                            <div className={styles.toolbar}>
                                <Icon name="mic" size="20" />
                            </div>
                        </button>

                        <button
                            onMouseEnter={() => setShowTooltip(2)}
                            onMouseLeave={() => setShowTooltip(null)}
                        >
                            <Tooltip show={showTooltip === 2}>
                                Deafen
                            </Tooltip>
                            <div className={styles.toolbar}>
                                <Icon name="headset" size="20" />
                            </div>
                        </button>

                        <button
                            onMouseEnter={() => setShowTooltip(3)}
                            onMouseLeave={() => setShowTooltip(null)}
                            onClick={() => setShowSettings(true)}
                        >
                            <Tooltip show={showTooltip === 3}>
                                User Settings
                            </Tooltip>
                            <div className={styles.toolbar}>
                                <Icon name="settings" size="20" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConversationList;
