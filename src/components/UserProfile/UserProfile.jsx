import useUserData from "../../hooks/useUserData";
import styles from "./UserProfile.module.css";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { AvatarStatus, Icon } from "../";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const UserProfile = () => {
    const [activeNavItem, setActiveNavItem] = useState(0);
    const [note, setNote] = useState("");

    const { userProfile, setUserProfile, auth, setMenu } = useUserData();
    const cardRef = useRef(null);
    const noteRef = useRef(null);

    const user = userProfile?.user;
    const axiosPrivate = useAxiosPrivate();

    const isFriend = () => {
        return auth?.user?.friends?.includes(user?._id);
    };

    useEffect(() => {
        if (!userProfile) return;

        if (userProfile.focusNote && noteRef) noteRef.current.focus();
    }, []);

    const sectionNavItems = [
        "User Info",
        "Mutual Servers",
        "Mutual Friends",
    ];

    const menuItems = isFriend() ? [
        { name: "Remove Friend", func: () => deleteFriend(), danger: true },
        { name: "Block", func: () => blockUser(), danger: true },
        { name: "Message", func: () => deleteFriend() },
        { name: "Divider" },
        {
            name: "Copy ID", func: () => {
                navigator.clipboard.writeText(user._id);
            }, icon: "id"
        }
    ] : [
        { name: "Block", func: () => blockUser(), danger: true },
        { name: "Message", func: () => deleteFriend() },
        { name: "Divider" },
        {
            name: "Copy ID", func: () => {
                navigator.clipboard.writeText(user._id);
            }, icon: "id"
        }
    ];

    if (user) return (
        <motion.div
            className={styles.wrapper}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
                if (!cardRef.current.contains(e.target)) {
                    setUserProfile(null);
                }
            }}
        >
            <motion.div
                ref={cardRef}
                className={styles.cardContainer}
                initial={{
                    opacity: 0,
                }}
                animate={{
                    opacity: 1,
                }}
                exit={{
                    opacity: 0,
                }}
                transition={{
                    duration: 0.3,
                    ease: "easeInOut"
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
                            status={user.status}
                            background="var(--background-3)"
                            size={20}
                            tooltip={true}
                        />
                    </div>

                    <div className={styles.topSectionToolbar}>
                        <div>
                        </div>

                        <div>
                            {auth?.user?._id !== user._id && (
                                <>
                                    {isFriend() ? (
                                        <button>
                                            Send Message
                                        </button>
                                    ) : (
                                        <button>
                                            Send Friend Request
                                        </button>
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
                        {user.customStatus && (
                            <div className={styles.customStatus}>
                                {user.customStatus}
                            </div>
                        )}
                    </div>

                    <div className={styles.contentNav}>
                        <div>
                            {auth?.user?._id !== user._id && sectionNavItems.map((item, index) => (
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
                                {user.description && (
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
    );
}

export default UserProfile;
