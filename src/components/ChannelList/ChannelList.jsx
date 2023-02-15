import styles from "./ChannelList.module.css";
import stylesItem from "./ChannelListItem.module.css";
import { ChannelListItem, UserSection, Title } from "..";
import useUserData from "../../hooks/useUserData";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/router";

const ConversationList = () => {
    const { channels } = useUserData();
    const router = useRouter();

    const channelListRef = useRef(null);

    useEffect(() => {
        if (!channelListRef) return;

        const selectedChannel = document.querySelector(`.${stylesItem.liContainerActive}`);

        if (selectedChannel) {
            const selectedChannelRect = selectedChannel.getBoundingClientRect();
            const channelListRect = channelListRef.current.getBoundingClientRect();

            console.log(selectedChannelRect, channelListRect);

            if (selectedChannelRect.top < channelListRect.top) {
                channelListRef.current.scrollTo({
                    top: selectedChannel.offsetTop,
                    behavior: "smooth",
                });
            } else if (selectedChannelRect.bottom > channelListRect.bottom) {
                channelListRef.current.scrollTo({
                    top: selectedChannel.offsetTop - channelListRect.height + selectedChannelRect.height,
                    behavior: "smooth",
                });
            }
        }
    }, [router.query, channelListRef?.current]);

    return useMemo(() => (
        <div className={styles.nav}>
            <div className={styles.privateChannels}>
                <div className={styles.searchContainer}>
                    <button className={styles.searchButton} tabIndex={0}>
                        Find or start a conversation
                    </button>
                </div>

                <div className={styles.scroller}>
                    <ul
                        ref={channelListRef}
                        className={styles.channelList}
                    >
                        <div></div>

                        <ChannelListItem special />

                        <Title />

                        {channels?.length ? channels?.map((channel) => (
                            <ChannelListItem
                                key={uuidv4()}
                                channel={channel}
                            />
                        )) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 184 428"
                                width="184"
                                height="428"
                                style={{
                                    padding: "16px",
                                    fill: "var(--background-4)",
                                    boxSizing: "content-box",
                                }}
                            >
                                <rect x="40" y="6" width="144" height="20" rx="10" />
                                <circle cx="16" cy="16" r="16" />
                                <rect x="40" y="50" width="144" height="20" rx="10" opacity="0.9" />
                                <circle cx="16" cy="60" r="16" opacity="0.9" />
                                <rect x="40" y="94" width="144" height="20" rx="10" opacity="0.8" />
                                <circle cx="16" cy="104" r="16" opacity="0.8" />
                                <rect x="40" y="138" width="144" height="20" rx="10" opacity="0.7" />
                                <circle cx="16" cy="148" r="16" opacity="0.7" />
                                <rect x="40" y="182" width="144" height="20" rx="10" opacity="0.6" />
                                <circle cx="16" cy="192" r="16" opacity="0.6" />
                                <rect x="40" y="226" width="144" height="20" rx="10" opacity="0.5" />
                                <circle cx="16" cy="236" r="16" opacity="0.5" />
                                <rect x="40" y="270" width="144" height="20" rx="10" opacity="0.4" />
                                <circle cx="16" cy="280" r="16" opacity="0.4" />
                                <rect x="40" y="314" width="144" height="20" rx="10" opacity="0.3" />
                                <circle cx="16" cy="324" r="16" opacity="0.3" />
                                <rect x="40" y="358" width="144" height="20" rx="10" opacity="0.2" />
                                <circle cx="16" cy="368" r="16" opacity="0.2" />
                                <rect x="40" y="402" width="144" height="20" rx="10" opacity="0.1" />
                                <circle cx="16" cy="412" r="16" opacity="0.1" />
                            </svg>

                        )}
                    </ul>
                </div>
            </div>

            <UserSection />
        </div>
    ), [channels]);
};

export default ConversationList;
