import styles from "./ChannelList.module.css";
import { useRouter } from "next/router";
import { Tooltip, Icon } from "..";
import useUserData from "../../hooks/useUserData";
import useLogout from "../../hooks/useLogout";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

const ConversationList = () => {
    const [hover, setHover] = useState(null);
    const [showStatus, setShowStatus] = useState(null);
    const [showMenu, setShowMenu] = useState(null);
    const [showTooltip, setShowTooltip] = useState(null);

    const router = useRouter();
    const currentPath = router.asPath;
    const menuRef = useRef(null);

    const { auth, friends, friendRequests, channelList } = useUserData();
    const { logout } = useLogout();
    const requestReceived = friendRequests.filter((request) => request.type === "received").length;

    useEffect(() => {
        window.addEventListener("click", (e) => {
            if (e.target === menuRef.current) return;
            setShowMenu(null);
        });
    }, []);

    const isFriend = (id) => {
        return friends.some((friend) => friend._id.toString() === id);
    };

    return (
        <div className={styles.nav}>
            <div
                className={styles.privateChannels}
            >
                <div className={styles.searchContainer}>
                    <button
                        className={styles.searchButton}
                    >
                        Find or start a conversation
                    </button>
                </div>

                <div className={styles.scroller}>
                    <ul className={styles.channelList}>
                        <div></div>
                        <div
                            className={styles.liContainer}
                            onClick={() => {
                                localStorage.setItem(
                                    "private-channel-url",
                                    `/channels/@me`
                                );
                                router.push("/channels/@me")
                            }}
                        >
                            <div
                                className={styles.liWrapper}
                                style={{
                                    backgroundColor: currentPath === "/channels/@me" && "var(--background-transparent-1)",
                                    color: currentPath === "/channels/@me" && "var(--foreground-1)",
                                }}
                            >
                                <div className={styles.linkFriends}>
                                    <div className={styles.layoutFriends}>
                                        <div className={styles.layoutAvatar}>
                                            <Icon
                                                name="friends"
                                                fill={
                                                    currentPath === "/channels/@me"
                                                    && "var(--foreground-1)"
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
                            <div>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 18 18"
                                    x="0"
                                    y="0"
                                    onMouseEnter={() => setHover("create")}
                                    onMouseLeave={() => setHover(false)}
                                >
                                    <polygon
                                        fillRule="nonzero"
                                        fill={
                                            hover === "create"
                                                ? "var(--foreground-1)"
                                                : "var(--foreground-2)"
                                        }
                                        points="15 10 10 10 10 15 8 15 8 10 3 10 3 8 8 8 8 3 10 3 10 8 15 8"
                                    />
                                </svg>
                                <Tooltip
                                    show={hover === "create"}
                                >
                                    Create DM
                                </Tooltip>
                            </div>
                        </h2>
                        {channelList?.map((conv) => (
                            <li
                                key={conv?.members[0]._id}
                                className={styles.liContainer}
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
                                <div
                                    className={styles.liWrapper}
                                    style={{
                                        backgroundColor: (currentPath === `/channels/@me/${conv?._id}` || hover == conv?.members[0]._id) && "var(--background-transparent-1)",
                                        color: (currentPath === `/channels/@me/${conv?._id}` || hover == conv?.members[0]._id) && "var(--foreground-1)",
                                    }}
                                >
                                    <div className={styles.link}>
                                        <div className={styles.layout}>
                                            <div className={styles.layoutAvatar}>
                                                <Image
                                                    src={conv?.members[0].avatar}
                                                    width={32}
                                                    height={32}
                                                    alt="Avatar"
                                                />
                                                <div
                                                    className={styles.avatarStatus}
                                                    onMouseEnter={() => setShowStatus(conv?.members[0]._id)}
                                                    onMouseLeave={() => setShowStatus(null)}
                                                    style={{
                                                        backgroundColor: (currentPath === `/channels/@me/${conv?._id}` || hover == conv?.members[0]._id) ? "var(--background-transparent-1)" : "var(--background-3)",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            position: "relative",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                backgroundColor: !isFriend(conv?.members[0]._id)
                                                                    ? "var(--foreground-4)"
                                                                    : conv?.members[0].status === "Online"
                                                                        ? "var(--valid-1)"
                                                                        : conv?.members[0].status === "Idle"
                                                                            ? "var(--warning-1)"
                                                                            : conv?.members[0].status === "Busy"
                                                                                ? "var(--error-1)"
                                                                                : "var(--foreground-4)",
                                                            }}
                                                        >
                                                            <Tooltip
                                                                show={showStatus === conv?.members[0]._id}
                                                                dist="8px"
                                                            >
                                                                {isFriend(conv?.members[0]._id)
                                                                    ? conv?.members[0].status
                                                                    : "Offline"}
                                                            </Tooltip>
                                                        </div>
                                                    </div>
                                                </div>
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
                                    {hover === conv?.members[0]._id && (
                                        <div className={styles.closeButton}>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                width="16"
                                                height="16"
                                                stroke="var(--foreground-2)"
                                            >
                                                <path fill="currentColor" d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z" />
                                            </svg>
                                        </div>)}
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
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(true);
                        }}
                        style={{
                            backgroundColor: showMenu && "var(--background-transparent-1)",
                        }}
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
                            <div
                                className={styles.avatarStatus}
                                style={{
                                    backgroundColor: "var(--background-2)",
                                }}
                            >
                                <div
                                    style={{
                                        backgroundColor:
                                            auth?.user?.status === "Online"
                                                ? "var(--valid-1)"
                                                : auth?.user?.status === "Idle"
                                                    ? "var(--warning-1)"
                                                    : auth?.user?.status === "Busy"
                                                        ? "var(--error-1)"
                                                        : "var(--foreground-4)",
                                    }}
                                >

                                </div>
                            </div>
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

                        {showMenu && (
                            <div
                                className={styles.menuContainer}
                                ref={menuRef}
                            >
                                <div className={styles.menu}>
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMenu(null);
                                        }}
                                    >
                                        <div>I Do Not Know</div>
                                    </div>
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMenu(null);
                                        }}
                                    >
                                        <div>Show Profile</div>
                                    </div>
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMenu(null);
                                            logout();
                                        }}
                                    >
                                        <div>Logout</div>
                                    </div>
                                    <div className={styles.divider}></div>
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMenu(null);
                                            navigator.clipboard.writeText(auth?.user?._id);
                                        }}
                                    >
                                        <div>Copy ID</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className={styles.toolbar}>
                        <button
                            onMouseEnter={() => setShowTooltip(1)}
                            onMouseLeave={() => setShowTooltip(null)}
                        >
                            <Tooltip
                                show={showTooltip === 1}
                            >
                                Mute
                            </Tooltip>
                            <div className={styles.toolbar}>
                                <Icon
                                    name="mic"
                                    size="20"
                                    fill={showTooltip === 1 && "var(--foreground-1)"}
                                />
                            </div>
                        </button>

                        <button
                            onMouseEnter={() => setShowTooltip(2)}
                            onMouseLeave={() => setShowTooltip(null)}
                        >
                            <Tooltip
                                show={showTooltip === 2}
                            >
                                Deafen
                            </Tooltip>
                            <div className={styles.toolbar}>
                                <Icon
                                    name="headset"
                                    size="20"
                                    fill={showTooltip === 2 && "var(--foreground-1)"}
                                />
                            </div>
                        </button>

                        <button
                            onMouseEnter={() => setShowTooltip(3)}
                            onMouseLeave={() => setShowTooltip(null)}
                        >
                            <Tooltip
                                show={showTooltip === 3}
                            >
                                User Settings
                            </Tooltip>
                            <div className={styles.toolbar}>
                                <Icon
                                    name="settings"
                                    size="20"
                                    fill={showTooltip === 3 && "var(--foreground-1)"}
                                />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConversationList;
