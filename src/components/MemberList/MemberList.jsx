import useUserSettings from "../../hooks/useUserSettings";
import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AvatarStatus, UserListItemSmall } from "../";
import useUserData from "../../hooks/useUserData";
import styles from "./MemberList.module.css";
import useAuth from "../../hooks/useAuth";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import Image from "next/image";

const MemberList = ({ channel }) => {
    const [note, setNote] = useState("");
    const [widthLimitPassed, setWidthLimitPassed] = useState(false);
    const [friend, setFriend] = useState(null);

    const { auth } = useAuth();
    const { friends } = useUserData();
    const { userSettings } = useUserSettings();
    const noteRef = useRef(null);

    useEffect(() => {
        const width = window.innerWidth;

        if (width >= 1200) {
            setWidthLimitPassed(true);
        } else {
            setWidthLimitPassed(false);
        }

        const handleResize = () => {
            const width = window.innerWidth;

            if (width >= 1200) {
                setWidthLimitPassed(true);
            } else {
                setWidthLimitPassed(false);
            }
        }

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        }
    }, []);

    useEffect(() => {
        if (channel?.type === 0) {
            setFriend(channel?.recipients.find((recipient) => recipient?._id !== auth?.user?._id));
        }
    }, [channel]);

    const isFriend = () => {
        return friends?.find((user) => user?._id === friend?._id);
    };

    return useMemo(() => {
        if (channel?.type === 0) {
            return (
                <AnimatePresence>
                    {(userSettings?.showUsers && widthLimitPassed) && (
                        <motion.aside
                            className={styles.aside}
                            initial={{ width: "0" }}
                            animate={{ width: "340px" }}
                            exit={{ width: "0" }}
                            transition={{ duration: 0.15 }}
                        >
                            <div
                                className={styles.asideHeader}
                                style={{
                                    backgroundColor: friend?.accentColor
                                        || "var(--background-dark)"
                                }}
                            >
                                <div className={styles.userAvatar}>
                                    {friend?.avatar && (
                                        <Image
                                            src={friend?.avatar || "/assets/default-avatars/blue.png"}
                                            alt="User Avatar"
                                            width={80}
                                            height={80}
                                        />
                                    )}

                                    <AvatarStatus
                                        status={isFriend() ? friend?.status : "Offline"}
                                        background="var(--background-2)"
                                        mid
                                        tooltip
                                        tooltipDist={2}
                                    />
                                </div>
                            </div>

                            <div className={styles.asideContent}>
                                <div className={styles.username}>
                                    {friend?.username || "‎"}
                                </div>
                                {(friend?.customStatus && isFriend()) && (
                                    <div className={styles.customStatus}>
                                        {friend?.customStatus}
                                    </div>
                                )}

                                <div className={styles.asideDivider} />

                                {(friend?.description && isFriend()) && (
                                    <div>
                                        <h2>About Me</h2>
                                        <div className={styles.contentUserDate}>
                                            <div>
                                                {friend?.description}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h2>Discord Member Since</h2>
                                    <div className={styles.contentUserDate}>
                                        <div>
                                            {friend ? format(
                                                new Date(friend?.createdAt),
                                                "MMM dd, yyyy"
                                            ) : "‎"}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.asideDivider} />

                                <div>
                                    <h2>Note</h2>
                                    <div className={styles.contentNote}>
                                        <textarea
                                            className="scrollbar"
                                            ref={noteRef}
                                            style={{
                                                height: noteRef?.current?.scrollHeight ?
                                                    noteRef?.current?.scrollHeight + 2 : 44
                                            }}
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            placeholder="Click to add a note"
                                            maxLength={256}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div></div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            );
        } else {
            const onlineMembers = channel?.recipients.filter(
                (recipient) => recipient?.status === "Online"
                    || recipient?.status === "Idle"
                    || recipient?.status === "Do Not Disturb"
            ).sort(
                (a, b) => a?.username?.localeCompare(b.username)
            );

            const offlineMembers = channel?.recipients.filter(
                (recipient) => recipient?.status === "Offline"
            ).sort(
                (a, b) => a?.username?.localeCompare(b.username)
            );

            return (
                <AnimatePresence>
                    {(userSettings?.showUsers && widthLimitPassed) && (
                        <motion.aside
                            className={styles.memberList}
                            initial={{ width: "0" }}
                            animate={{ width: "240px" }}
                            exit={{ width: "0" }}
                            transition={{ duration: 0.15 }}
                        >
                            <div>
                                <h2>Members—{channel?.recipients.length}</h2>

                                {onlineMembers?.length > 0 && (
                                    onlineMembers.map((user) => (
                                        <UserListItemSmall
                                            key={uuidv4()}
                                            user={user}
                                        />
                                    ))
                                )}

                                {offlineMembers?.length > 0 && (
                                    offlineMembers.map((user) => (
                                        <UserListItemSmall
                                            key={uuidv4()}
                                            user={user}
                                        />
                                    ))
                                )}
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            );
        }
    }, [friend, channel, userSettings, note, widthLimitPassed])
};

export default MemberList;
