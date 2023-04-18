import styles from "./UserProfile.module.css";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
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
    const [showTooltip, setShowTooltip] = useState(false);

    const { auth } = useAuth();
    const { userProfile, setUserProfile, setFixedLayer } = useComponents();
    const {
        channels, friends, setFriends, setChannels,
        requests, setRequests, blocked
    } = useUserData();

    const cardRef = useRef(null);
    const noteRef = useCallback((node) => {
        if (node !== null) {
            node.style.height = "auto";
            const height = node.scrollHeight + "px";
            node.style.height = height;
        }
    }, [note]);

    const user = userProfile?.user;
    const router = useRouter();
    const axiosPrivate = useAxiosPrivate();

    const isSameUser = () => {
        return user?._id === auth?.user?._id;
    };

    useEffect(() => {
        if (!userProfile && !user) return;

        if (userProfile?.focusNote && noteRef.current) noteRef.current.focus();

        const isFriend = () => {
            return friends?.map((friend) => friend?._id.toString()).includes(user?._id);
        };

        const isBlocked = () => {
            return blocked?.map((blocked) => blocked?._id.toString()).includes(user?._id);
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

        const mutualFriends = user?.friends?.filter(
            (friend) => friendsIDs.includes(friend)
        );

        const mutualFriendsData = mutualFriends?.map((user) => {
            const friendData = friends.find((friend) => friend._id.toString() === user);
            return friendData;
        });

        setMutualFriends(mutualFriendsData);
    }, [user, userProfile, friends, blocked, requests]);

    const sectionNavItems = isSameUser() ? [
        "User Info",
    ] : [
        "User Info",
        "Mutual Servers",
        "Mutual Friends",
    ];

    const addFriend = async () => {
        const response = await axiosPrivate.post(
            `/users/@me/friends/${user._id}`,
        );

        if (response.data.success) {
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
        };
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

        if (response.data.success) {
            if (!channels?.map((channel) => channel._id).includes(response.data.channel._id)) {
                setChannels((prev) => [response.data.channel, ...prev]);
            };
            router.push(`/channels/@me/${response.data.channel._id}`);
            setUserProfile(null);
        };
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
                            setFixedLayer(null);
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
                                                    setFixedLayer({
                                                        type: "menu",
                                                        event: e,
                                                        user: user,
                                                        userprofile: true,
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
                                            mutualFriends.map((friend) => (
                                                <FriendItem friend={friend} key={uuidv4()} />
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

const FriendItem = ({ friend }) => {
    const [hover, setHover] = useState(false);

    const {
        setUserProfile,
        setFixedLayer,
    } = useComponents();

    return (
        <div
            className={styles.contentUserFriend}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(null)}
            onClick={() => {
                setUserProfile(null);

                setTimeout(() => {
                    setUserProfile({ user: friend });
                }, 200);
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                setFixedLayer({
                    type: "menu",
                    event: e,
                    user: friend,
                });
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
                        hover ? "var(--background-3)"
                            : "var(--background-dark)"
                    }
                />
            </div>

            <div>
                {friend?.username}
            </div>
        </div>
    );
};

export default UserProfile;
