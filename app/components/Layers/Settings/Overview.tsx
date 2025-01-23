import { AnimatePresence, motion } from "framer-motion";
import useFetchHelper from "@/hooks/useFetchHelper";
import styles from "./Settings.module.css";
import type { GuildChannel } from "@/type";
import { LoadingDots } from "@components";
import { useState } from "react";
import Image from "next/image";

export function Overview({ channel }: { channel: GuildChannel }) {
    const [channelTopic, setChannelTopic] = useState(channel.topic || "");
    const [channelName, setChannelName] = useState(channel.name);
    const [loading, setLoading] = useState(false);

    const { sendRequest } = useFetchHelper();

    function resetState() {
        setChannelName(channel.name);
        setChannelTopic(channel.topic || "");
    }

    const needsSaving = channelName !== channel.name || channelTopic !== (channel.topic || "");

    async function saveChannel() {
        if (loading || !needsSaving) return;
        setLoading(true);

        try {
            const { errors } = await sendRequest({
                query: "CHANNEL_UPDATE",
                params: { channelId: channel.id },
                body: {
                    name: channelName,
                    topic: channelTopic,
                },
            });

            if (!errors) {
                resetState();
            }
        } catch (err) {
            console.error(err);
        }

        setLoading(false);
    }

    return (
        <div>
            <AnimatePresence>
                {needsSaving && (
                    <motion.div
                        className={styles.saveAlert}
                        transition={{ duration: 0.1 }}
                        initial={{ transform: "translateY(80px)" }}
                        animate={{ transform: "translateY(0)" }}
                        exit={{ transform: "translateY(80px)" }}
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
                                {loading ? <LoadingDots /> : "Save Changes"}
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

                {channel.type === 2 && <div className={styles.divider} />}

                {channel.type === 2 && (
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
                )}

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
                        width={280}
                        height={165}
                        draggable={false}
                        alt="Footer Image"
                        src="/assets/system/modify-channel.svg"
                    />
                </div>
            </div>
        </div>
    );
}
