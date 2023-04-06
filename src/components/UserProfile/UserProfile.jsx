import styles from "./UserProfile.module.css";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { AvatarStatus, Icon, Tooltip } from "../";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import useComponents from "../../hooks/useComponents";
import useUserData from "../../hooks/useUserData";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";

const UserProfile = () => {
    const [activeNavItem, setActiveNavItem] = useState(0);
    const [userSatus, setUserStatus] = useState("");
    const [mutualFriends, setMutualFriends] = useState([]);
    const [note, setNote] = useState("");
    const [error, setError] = useState("");
    const [showTooltip, setShowTooltip] = useState(false);
    const [hoveredFriend, setHoveredFriend] = useState(null);

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
        channels,
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

        if (userProfile.focusNote && noteRef.current) noteRef.current.focus();

        const isFriend = () => {
            return friends?.map((friend) => friend._id.toString()).includes(user?._id);
        };

        const isBlocked = () => {
            return blocked?.map((blocked) => blocked._id.toString()).includes(user?._id);
        };

        const requestSent = () => {
            return requests?.map((request) => {
                if (request.type === 0) return request.user._id;
            }).includes(user?._id);
        };

        const requestReceived = () => {
            return requests?.map((request) => {
                if (request.type === 1) return request.user._id;
            }).includes(user?._id);
        };

        setActiveNavItem(0);
        setNote("");

        if (isFriend()) {
            setUserStatus("Friends");
        } else if (isBlocked()) {
            setUserStatus("Blocked");
        } else if (requestSent()) {
            setUserStatus("Request Sent");
        } else if (requestReceived()) {
            setUserStatus("Request Received");
        } else {
            setUserStatus("");
        }

        const friendsIDs = friends.map((friend) => friend._id.toString());

        const mutualFriends = user.friends.filter(
            (friend) => friendsIDs.includes(friend)
        );

        const mutualFriendsData = mutualFriends.map((user) => {
            const friendData = friends.find((friend) => friend._id.toString() === user);
            return friendData;
        });

        setMutualFriends(mutualFriendsData);
    }, [userProfile, friends, blocked, requests]);

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

    const largeMenuItems = [
        {
            name: "Profile",
            func: () => setUserProfile({ user }),
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

    const addFriend = async () => {
        const response = await axiosPrivate.post(
            `/users/@me/friends/${user._id}`,
        );

        if (!response.data.success) {
            setError(response.data.message);
        } else if (response.data.success) {
            if (response.data.message === "Friend request sent") {
                setRequests((prev) => [...prev, response.data.request]);
            } else if (response.data.message === "Friend request accepted") {
                setFriends((prev) => [...prev, response.data.friend]);
                setRequests(requests.filter((request) => request.user._id.toString() !== user._id));
                if (response.data.channel) {
                    if (channels?.map((channel) => channel._id).includes(response.data.channel._id)) return;
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
                setFriends(friends.filter((friend) => friend?._id?.toString() !== user._id));
            } else if (response.data.message === "Request cancelled") {
                setRequests(requests.filter((request) => request?.user?._id?.toString() !== user._id));
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
                                    background="var(--background-2)"
                                    size
                                    tooltip={true}
                                    tooltipDist={5}
                                />
                            </div>

                            <div className={styles.topSectionToolbar}>
                                <div>
                                </div>

                                <div>
                                    {!isSameUser() && (
                                        <>
                                            {(userSatus !== "Blocked") && (
                                                <>
                                                    {userSatus === "Request Received" ? (
                                                        <>
                                                            <button
                                                                className="green"
                                                                onClick={() => addFriend()}
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                className="grey"
                                                                onClick={() => deleteFriend()}
                                                            >
                                                                Ignore
                                                            </button>
                                                        </>
                                                    ) : userSatus === "Friends" ? (
                                                        <button
                                                            className="green"
                                                            onClick={() => createChannel()}
                                                        >
                                                            Send Message
                                                        </button>
                                                    ) : (
                                                        <div>
                                                            <button
                                                                className={
                                                                    userSatus === "Request Sent"
                                                                        ? "green disabled"
                                                                        : "green"
                                                                }
                                                                onClick={() => {
                                                                    if (userSatus === "Request Sent") return;
                                                                    addFriend();
                                                                }}
                                                                onMouseEnter={() => setShowTooltip(true)}
                                                                onMouseLeave={() => setShowTooltip(false)}
                                                            >
                                                                Send Friend Request
                                                            </button>

                                                            {userSatus === "Request Sent" && (
                                                                <Tooltip
                                                                    show={showTooltip}
                                                                    position="top"
                                                                    dist={5}
                                                                    big
                                                                >
                                                                    You sent a friend request to this user.
                                                                </Tooltip>
                                                            )}
                                                        </div>
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
                                                className={styles.moreButton}
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
                                    || (user.customStatus && isSameUser())) && (
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

                            <div
                                className={styles.contentUser + " scrollbar"}
                                style={{
                                    padding: activeNavItem === 0 ? "0 12px" : "",
                                }}
                            >
                                {activeNavItem === 0 && (
                                    <div>
                                        {((user.description && userSatus === "Friends")
                                            || (user.description && isSameUser())) && (
                                                <>
                                                    <h1>
                                                        About Me
                                                    </h1>
                                                    <div className={styles.contentUserDescription}>
                                                        {user.description}
                                                    </div>
                                                </>
                                            )}

                                        <h1>Discord Member Since</h1>
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
                                                style={{ height: noteRef?.current?.scrollHeight + 2 || 44 }}
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
                                    <>
                                        {mutualFriends.length > 0 ?
                                            mutualFriends.map((friend, index) => (
                                                <div
                                                    key={uuidv4()}
                                                    className={styles.contentUserFriend}
                                                    onMouseEnter={() => setHoveredFriend(index)}
                                                    onMouseLeave={() => setHoveredFriend(null)}
                                                    onClick={() => {
                                                        setUserProfile(null);

                                                        setTimeout(() => {
                                                            setUserProfile({ user: friend });
                                                        }, 200);
                                                    }}
                                                >
                                                    <div>
                                                        <Image
                                                            src={friend?.avatar}
                                                            alt="User Avatar"
                                                            width={40}
                                                            height={40}
                                                        />

                                                        <AvatarStatus
                                                            status={friend?.status}
                                                            background={
                                                                hoveredFriend === index
                                                                    ? "var(--background-3)"
                                                                    : "var(--background-dark)"
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        {friend?.username}
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className={styles.empty + " " + styles.noFriends}>
                                                    <div />
                                                    <div>No friends in common</div>
                                                </div>
                                            )}
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )
            }
        </AnimatePresence >
    );
}

export default UserProfile;
