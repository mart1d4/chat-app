import { AnimatePresence, motion } from "framer-motion";
import styles from "./Settings.module.css";
import { LoadingDots } from "@components";
import { useMemo, useState } from "react";
import Image from "next/image";

export function Overview({ channel }) {
    const [isLoading, setIsLoading] = useState(false);
    const [channelName, setChannelName] = useState(channel.name);
    const [channelTopic, setChannelTopic] = useState(channel.topic || "");

    async function saveChannel() {
        if (isLoading) return;
        setIsLoading(true);

        try {
        } catch (err) {
            console.error(err);
        }

        setIsLoading(false);
    }

    function resetState() {
        setChannelName(channel.name);
        setChannelTopic(channel.topic || "");
    }

    const needsSaving = useMemo(
        () => channelName !== channel.name || channelTopic !== (channel.topic || ""),
        [channelName, channelTopic, channel.name, channel.topic]
    );

    return (
        <div>
            <AnimatePresence>
                {needsSaving && (
                    <motion.div
                        className={styles.saveAlert}
                        initial={{ transform: "translateY(80px)" }}
                        animate={{ transform: "translateY(0)" }}
                        exit={{ transform: "translateY(80px)" }}
                        transition={{ duration: 0.1 }}
                    >
                        <p>Careful — you have unsaved changes!</p>

                        <div>
                            <button
                                className="button underline"
                                onClick={() => resetState()}
                            >
                                Reset
                            </button>

                            <button
                                className="button green"
                                onClick={() => saveChannel()}
                            >
                                {isLoading ? <LoadingDots /> : "Save Changes"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={styles.sectionTitle}>
                <h2>Overview</h2>
            </div>

            <div>
                <section>
                    <h3>Channel Name</h3>

                    <input
                        className={styles.input}
                        type="text"
                        value={channelName}
                        onChange={(e) => setChannelName(e.target.value)}
                        aria-label="Channel Name"
                        minLength={1}
                        maxLength={100}
                    />
                </section>

                <div className={styles.divider} />

                <section>
                    <h3>Channel Topic</h3>

                    <input
                        className={styles.input}
                        type="text"
                        value={channelTopic}
                        onChange={(e) => setChannelTopic(e.target.value)}
                        aria-label="Channel Topic"
                        maxLength={1024}
                        placeholder="Let everyone know how to use this channel!"
                    />
                </section>

                <div className={styles.divider} />

                <section className={styles.section}>
                    <h3>Slowmode</h3>

                    <div>Slider heh</div>

                    <div className={styles.content}>
                        <div>
                            Members will be restricted to sending one message and creating one
                            thread per this interval, unless they have Manage Channel or Manage
                            Messages permissions.
                        </div>
                    </div>
                </section>

                <div className={styles.footerImage}>
                    <Image
                        src="https://discord.com/assets/c1875fc8a42a61903ba1.svg"
                        alt="Footer Image"
                        width={280}
                        height={165}
                    />
                </div>
            </div>
        </div>
    );
}
