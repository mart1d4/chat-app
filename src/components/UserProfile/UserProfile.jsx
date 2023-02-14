import styles from "./UserProfile.module.css";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { AvatarStatus, Icon } from "../";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import useComponents from "../../hooks/useComponents";
import useUserData from "../../hooks/useUserData";
import { useRouter } from "next/router";

const UserProfile = () => {
    const [activeNavItem, setActiveNavItem] = useState(0);
    const [userSatus, setUserStatus] = useState("");
    const [reload, setReload] = useState(false);
    const [note, setNote] = useState("");
    const [error, setError] = useState("");

    const { auth } = useAuth();
    const {
        userProfile,
        setUserProfile,
        setMenu
    } = useComponents();
    const {
        friends,
        setFriends,
        requests,
        setRequests,
        blocked,
        setBlocked,
        setChannels
    } = useUserData();
    const cardRef = useRef(null);
    const noteRef = useRef(null);

    const user = userProfile?.user;
    const router = useRouter();
    const axiosPrivate = useAxiosPrivate();

    const isSameUser = () => {
        return user?._id === auth?.user?._id;
    };

    useEffect(() => {
        if (!userProfile) return;

        if (userProfile.focusNote && noteRef) noteRef.current.focus();

        const isFriend = () => {
            return auth?.user?.friends?.includes(user?._id);
        };

        const isBlocked = () => {
            return blocked?.map((blocked) => blocked._id).includes(user?._id);
        };

        const requestSent = () => {
            return requests?.map((request) => {
                if (request.type === 0) return request.user._id;
            }).includes(user?._id);
        };

        if (isFriend()) {
            setUserStatus("Friends");
        } else if (isBlocked()) {
            setUserStatus("Blocked");
        } else if (requestSent()) {
            setUserStatus("Request Sent");
        }
    }, [reload]);

    const sectionNavItems = isSameUser() ? [
        "User Info",
    ] : [
        "User Info",
        "Mutual Servers",
        "Mutual Friends",
    ];

    const menuItems = userSatus === "Friends" ? [
        { name: "Remove Friend", func: () => deleteFriend(), danger: true },
        { name: "Block", func: () => blockUser(), danger: true },
        { name: "Message", func: () => createChannel() },
        { name: "Divider" },
        {
            name: "Copy ID", func: () => {
                navigator.clipboard.writeText(user._id);
            }, icon: "id"
        }
    ] : [
        {
            name: userSatus === "Blocked" ? "Unblock" : "Block",
            func: () => userSatus === "Blocked" ? unblockUser() : blockUser(),
            danger: userSatus !== "Blocked"
        },
        { name: "Message", func: () => createChannel() },
        { name: "Divider" },
        {
            name: "Copy ID", func: () => {
                navigator.clipboard.writeText(user._id);
            }, icon: "id"
        }
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
            setUserStatus("Request Sent");
            if (response.data.channel) {
                setChannels((prev) => [response.data.channel, ...prev]);
                setUserStatus("Friends");
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
                setFriends(friends.filter((friend) => friend?._id?.toString() !== user._id));
            } else if (response.data.message === "Request cancelled") {
                setRequests(requests.filter((request) => request?.user?._id?.toString() !== user._id));
            }
            setUserStatus("");
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
            setUserProfile(null);
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
            setFriends(friends.filter((friend) => friend?._id?.toString() !== user._id));
            setRequests(requests.filter((request) => request?.user?._id?.toString() !== user._id));
            setUserStatus("Blocked");
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
            setBlocked(blocked.filter((blocked) => blocked?._id?.toString() !== user._id));
            setUserStatus("");
        } else {
            setError("An error occurred.");
        }
    };

    return (
        <AnimatePresence>
            {user && (
                <motion.div
                    className={styles.wrapper}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onMouseDown={(e) => {
                        if (e.button === 2) return;
                        if (!cardRef.current.contains(e.target)) {
                            setUserProfile(null);
                            setMenu(null);
                        }
                    }}
                >
                    <motion.div
                        ref={cardRef}
                        className={styles.cardContainer}
                        initial={{
                            scale: 0.75,
                        }}
                        animate={{
                            scale: 1,
                        }}
                        exit={{
                            scale: 0.75,
                            opacity: 0,
                        }}
                        transition={{
                            duration: 0.5,
                            type: "spring",
                            stiffness: 750,
                            damping: 25,
                        }}
                    >
                        <div
                            className={styles.topSection}
                            style={{ backgroundColor: user.accentColor }}
                        >
                            <div>
                                <Image
                                    src={user.avatar}
                                    alt="User Avatar"
                                    width={120}
                                    height={120}
                                />
                                <AvatarStatus
                                    status={(userSatus === "Friends" || isSameUser())
                                        ? user.status
                                        : "Offline"}
                                    background="var(--background-3)"
                                    size={20}
                                    tooltip={true}
                                />
                            </div>

                            <div className={styles.topSectionToolbar}>
                                <div>
                                </div>

                                <div>
                                    {!isSameUser() && (
                                        <>
                                            {userSatus !== "Blocked" && (
                                                <>
                                                    {userSatus === "Friends" ? (
                                                        <button
                                                            onClick={() => createChannel()}
                                                        >
                                                            Send Message
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className={userSatus === "Request Sent"
                                                                ? styles.disabled : ""}
                                                            onClick={() => {
                                                                if (userSatus !== "Request Sent") {
                                                                    addFriend();
                                                                }
                                                            }}
                                                        >
                                                            Send Friend Request
                                                        </button>
                                                    )}
                                                </>
                                            )}

                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setMenu({
                                                        items: menuItems,
                                                        event: e,
                                                    });
                                                }}
                                            >
                                                <Icon name="more" />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={styles.contentSection}>
                            <div className={styles.contentHeader}>
                                <div className={styles.username}>
                                    {user.username}
                                </div>
                                {((user.customStatus && userSatus === "Friends")
                                    || isSameUser()) && (
                                        <div className={styles.customStatus}>
                                            {user.customStatus}
                                        </div>
                                    )}
                            </div>

                            <div className={styles.contentNav}>
                                <div>
                                    {!isSameUser() && sectionNavItems.map((item, index) => (
                                        <div
                                            className={styles.contentNavItem}
                                            key={index}
                                            style={{
                                                color: activeNavItem === index
                                                    ? "var(--foreground-1)" : "var(--foreground-3)",
                                                borderColor: activeNavItem === index
                                                    ? "var(--foreground-1)" : "transparent",
                                                cursor: activeNavItem === index
                                                    ? "default" : "pointer",
                                            }}
                                            onClick={() => setActiveNavItem(index)}
                                        >
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.contentUser}>
                                {activeNavItem === 0 && (
                                    <div>
                                        {((user.description && userSatus === "Friends")
                                            || isSameUser()) && (
                                                <>
                                                    <h1>
                                                        About Me
                                                    </h1>
                                                    <div className={styles.contentUserDescription}>
                                                        {user.description}
                                                    </div>
                                                </>
                                            )}

                                        <h1>Unthrust Member Since</h1>
                                        <div className={styles.contentUserDate}>
                                            <div>
                                                {format(
                                                    new Date(user.createdAt),
                                                    "MMM dd, yyyy"
                                                )}
                                            </div>
                                        </div>

                                        <h1>Note</h1>
                                        <div className={styles.contentNote}>
                                            <textarea
                                                ref={noteRef}
                                                style={{ height: noteRef?.current?.scrollHeight || 44 }}
                                                value={note}
                                                onChange={(e) => setNote(e.target.value)}
                                                placeholder="Click to add a note"
                                                maxLength={256}
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeNavItem === 1 && (
                                    <div className={styles.empty}>
                                        <div />
                                        <div>No servers in common</div>
                                    </div>
                                )}

                                {activeNavItem === 2 && (
                                    <div className={styles.empty + " " + styles.noFriends}>
                                        <div />
                                        <div>No friends in common</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default UserProfile;
