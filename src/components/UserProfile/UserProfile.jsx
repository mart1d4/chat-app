import useUserData from "../../hooks/useUserData";
import styles from "./UserProfile.module.css";
import { motion } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

const UserProfile = () => {
    const { userProfile, setUserProfile } = useUserData();
    const cardRef = useRef(null);

    if (!userProfile) return null;

    return (
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
                    scale: 0.5
                }}
                animate={{
                    opacity: 1,
                    scale: 1
                }}
                exit={{
                    opacity: 0,
                    scale: 0.5
                }}
                transition={{
                    duration: 0.3,
                    ease: "easeInOut"
                }}
            >
                <div
                    className={styles.topSection}
                    style={{
                        backgroundColor: userProfile.accentColor
                    }}
                >
                    <Image
                        src={userProfile.avatar}
                        alt="User Avatar"
                        width={120}
                        height={120}
                    />
                </div>

                <div className={styles.contentSection}></div>
            </motion.div>
        </motion.div>
    );
}

export default UserProfile;
