import { AvatarStatus } from "../";
import styles from "./MemberList.module.css";
import { useState, useRef, useMemo, useEffect } from "react";
import useUserData from "../../hooks/useUserData";
import Image from "next/image";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const MemberList = ({ showMemberList, friend }) => {
    const [note, setNote] = useState("");
    const [widthLimitPassed, setWidthLimitPassed] = useState(false);

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

    const { friends } = useUserData();
    const noteRef = useRef(null);

    const isFriend = () => {
        return friends?.find(
            (user) => user?._id.toString() === friend?._id.toString()
        );
    };

    return useMemo(() => (
        <AnimatePresence>
            {(showMemberList && widthLimitPassed) && (
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
                                    src={friend.avatar}
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
                            <h2>Unthrust Member Since</h2>
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
    ), [friend, showMemberList, note, widthLimitPassed]);
};

export default MemberList;
