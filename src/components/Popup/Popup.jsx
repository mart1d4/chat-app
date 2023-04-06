import styles from "./Popup.module.css";
import { AnimatePresence, motion } from "framer-motion";
import useComponents from "../../hooks/useComponents";
import { useRef } from "react";
import { Message } from "../../components";

const Popup = () => {
    const { popup, setPopup } = useComponents();
    const popupRef = useRef(null);

    return (
        <AnimatePresence>
            {popup && (
                <motion.div
                    className={styles.wrapper}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onMouseDown={(e) => {
                        if (e.button === 2) return;
                        if (!popupRef.current.contains(e.target)) {
                            setPopup(null);
                        }
                    }}
                >
                    <motion.div
                        ref={popupRef}
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
                        <div>
                            <h1>
                                {popup?.delete && "Delete Message"}
                                {popup?.pin && "Pin It. Pin It Good."}
                                {popup?.unpin && "Unpin Message"}
                            </h1>
                        </div>

                        <div className={styles.popupContent + " scrollbar"}>
                            <div>
                                {popup?.delete && "Are you sure you want to delete this message?"}
                                {popup?.pin && "Hey, just double checking that you want to pin this message to the current channel for posterity and greatness?"}
                                {popup?.unpin && "You sure you want to remove this pinned message?"}
                            </div>

                            <div>
                                <Message
                                    message={
                                        popup?.delete
                                            ? popup.delete.message : popup?.pin
                                                ? popup.pin.message : popup?.unpin
                                                    ? popup.unpin.message : null
                                    }
                                    noInt={true}
                                />
                            </div>

                            {(popup?.delete || popup?.unpin) && (
                                <div className={styles.protip}>
                                    <div>
                                        Protip:
                                    </div>

                                    <div>
                                        You can hold down shift when clicking
                                        <strong> {popup?.delete ? "delete message" : "unpin message"} </strong>
                                        to bypass this confirmation entirely.
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <button
                                className="underline"
                                onClick={() => {
                                    setPopup(null);
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                className={
                                    popup?.delete || popup?.unpin ? "red"
                                        : popup?.pin ? "blue"
                                            : "grey"

                                }
                                onClick={() => {
                                    if (popup?.delete) {
                                        popup.delete.func();
                                    } else if (popup?.pin) {
                                        popup.pin.func();
                                    } else if (popup?.unpin) {
                                        popup.unpin.func();
                                    }
                                    setPopup(null);
                                }}
                            >
                                {popup?.delete && "Delete"}
                                {popup?.pin && "Oh yeah. Pin it"}
                                {popup?.unpin && "Remove it please!"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence >
    );
}

export default Popup;
