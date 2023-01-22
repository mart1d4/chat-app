import styles from "./ChannelList.module.css";
import { useRouter } from "next/router";
import { Tooltip } from "..";
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
                                    backgroundColor: currentPath === "/channels/@me" && "var(--background-transparent)",
                                    color: currentPath === "/channels/@me" && "var(--foreground-primary)",
                                }}
                            >
                                <div className={styles.linkFriends}>
                                    <div className={styles.layoutFriends}>
                                        <div className={styles.layoutAvatar}>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                width="24"
                                                height="24"
                                            >
                                                <g fill="none" fillRule="evenodd">
                                                    <path fill={
                                                        currentPath === "/channels/@me" ? "var(--foreground-primary)" : "var(--foreground-tertiary)"
                                                    } fillRule="nonzero" d="M0.5,0 L0.5,1.5 C0.5,5.65 2.71,9.28 6,11.3 L6,16 L21,16 L21,14 C21,11.34 15.67,10 13,10 C13,10 12.83,10 12.75,10 C8,10 4,6 4,1.5 L4,0 L0.5,0 Z M13,0 C10.790861,0 9,1.790861 9,4 C9,6.209139 10.790861,8 13,8 C15.209139,8 17,6.209139 17,4 C17,1.790861 15.209139,0 13,0 Z" transform="translate(2 4)" />
                                                    <path d="M0,0 L24,0 L24,24 L0,24 L0,0 Z M0,0 L24,0 L24,24 L0,24 L0,0 Z M0,0 L24,0 L24,24 L0,24 L0,0 Z" />
                                                </g>
                                            </svg>
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
                                                ? "var(--foreground-primary)"
                                                : "var(--foreground-secondary)"
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
                                        backgroundColor: (currentPath === `/channels/@me/${conv?._id}` || hover == conv?.members[0]._id) && "var(--background-transparent)",
                                        color: (currentPath === `/channels/@me/${conv?._id}` || hover == conv?.members[0]._id) && "var(--foreground-primary)",
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
                                                        backgroundColor: hover === conv?.members[0]._id
                                                            ? "var(--background-transparent)"
                                                            : "var(--background-tertiary)",
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
                                                                    ? "var(--foreground-quaternary)"
                                                                    : conv?.members[0].status === "Online"
                                                                        ? "var(--valid-primary)"
                                                                        : conv?.members[0].status === "Idle"
                                                                            ? "var(--warning-primary)"
                                                                            : conv?.members[0].status === "Busy"
                                                                                ? "var(--error-primary)"
                                                                                : "var(--foreground-quaternary)",
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
                                                stroke="var(--foreground-secondary)"
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
                            backgroundColor: showMenu && "var(--background-transparent)",
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
                                    backgroundColor: "var(--background-secondary)",
                                }}
                            >
                                <div
                                    style={{
                                        backgroundColor:
                                            auth?.user?.status === "Online"
                                                ? "var(--valid-primary)"
                                                : auth?.user?.status === "Idle"
                                                    ? "var(--warning-primary)"
                                                    : auth?.user?.status === "Busy"
                                                        ? "var(--error-primary)"
                                                        : "var(--foreground-quaternary)",
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
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    width="20"
                                    height="20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M14.99 11C14.99 12.66 13.66 14 12 14C10.34 14 9 12.66 9 11V5C9 3.34 10.34 2 12 2C13.66 2 15 3.34 15 5L14.99 11ZM12 16.1C14.76 16.1 17.3 14 17.3 11H19C19 14.42 16.28 17.24 13 17.72V21H11V17.72C7.72 17.23 5 14.41 5 11H6.7C6.7 14 9.24 16.1 12 16.1ZM12 4C11.2 4 11 4.66667 11 5V11C11 11.3333 11.2 12 12 12C12.8 12 13 11.3333 13 11V5C13 4.66667 12.8 4 12 4Z"
                                        fill={
                                            showTooltip === 1
                                                ? "var(--foreground-primary)"
                                                : "var(--foreground-tertiary)"
                                        }
                                    />
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M14.99 11C14.99 12.66 13.66 14 12 14C10.34 14 9 12.66 9 11V5C9 3.34 10.34 2 12 2C13.66 2 15 3.34 15 5L14.99 11ZM12 16.1C14.76 16.1 17.3 14 17.3 11H19C19 14.42 16.28 17.24 13 17.72V22H11V17.72C7.72 17.23 5 14.41 5 11H6.7C6.7 14 9.24 16.1 12 16.1Z"
                                        fill={
                                            showTooltip === 1
                                                ? "var(--foreground-primary)"
                                                : "var(--foreground-tertiary)"
                                        }
                                    />
                                </svg>
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
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    width="20"
                                    height="20"
                                >
                                    <path
                                        d="M12 2.00305C6.486 2.00305 2 6.48805 2 12.0031V20.0031C2 21.1071 2.895 22.0031 4 22.0031H6C7.104 22.0031 8 21.1071 8 20.0031V17.0031C8 15.8991 7.104 15.0031 6 15.0031H4V12.0031C4 7.59105 7.589 4.00305 12 4.00305C16.411 4.00305 20 7.59105 20 12.0031V15.0031H18C16.896 15.0031 16 15.8991 16 17.0031V20.0031C16 21.1071 16.896 22.0031 18 22.0031H20C21.104 22.0031 22 21.1071 22 20.0031V12.0031C22 6.48805 17.514 2.00305 12 2.00305Z"
                                        fill={
                                            showTooltip === 2
                                                ? "var(--foreground-primary)"
                                                : "var(--foreground-tertiary)"
                                        }
                                    />
                                </svg>
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
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    width="20"
                                    height="20"
                                >
                                    <path
                                        fill={
                                            showTooltip === 3
                                                ? "var(--foreground-primary)"
                                                : "var(--foreground-tertiary)"
                                        }
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M19.738 10H22V14H19.739C19.498 14.931 19.1 15.798 18.565 16.564L20 18L18 20L16.565 18.564C15.797 19.099 14.932 19.498 14 19.738V22H10V19.738C9.069 19.498 8.203 19.099 7.436 18.564L6 20L4 18L5.436 16.564C4.901 15.799 4.502 14.932 4.262 14H2V10H4.262C4.502 9.068 4.9 8.202 5.436 7.436L4 6L6 4L7.436 5.436C8.202 4.9 9.068 4.502 10 4.262V2H14V4.261C14.932 4.502 15.797 4.9 16.565 5.435L18 3.999L20 5.999L18.564 7.436C19.099 8.202 19.498 9.069 19.738 10ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                                    />
                                </svg>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConversationList;
