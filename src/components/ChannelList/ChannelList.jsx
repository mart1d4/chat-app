import { UserListItemSmall, Icon, Tooltip, AvatarStatus } from "..";
import useUserSettings from "../../hooks/useUserSettings";
import useComponents from "../../hooks/useComponents";
import useUserData from "../../hooks/useUserData";
import { useMemo, useState, useRef } from "react";
import styles from "./ChannelList.module.css";
import useAuth from "../../hooks/useAuth";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";

const ConversationList = () => {
    const { channels } = useUserData();
    const { auth } = useAuth();

    return useMemo(() => (
        <div className={styles.nav}>
            <div className={styles.privateChannels}>
                <div className={styles.searchContainer}>
                    <button className={styles.searchButton} tabIndex={0}>
                        Find or start a conversation
                    </button>
                </div>

                <div className={styles.scroller + " scrollbar"}>
                    <ul className={styles.channelList}>
                        <div></div>

                        <UserListItemSmall special />

                        <Title />

                        {channels?.length ? channels?.map((channel) => {
                            const user = channel?.recipients?.find((member) => member?._id !== auth?.user._id);

                            return (
                                <UserListItemSmall
                                    key={uuidv4()}
                                    user={user}
                                    channel={channel}
                                />
                            );
                        }) : (
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

const Title = () => {
    const [hover, setHover] = useState(false);
    const { fixedLayer, setFixedLayer } = useComponents();
    const showButton = useRef();

    return useMemo(() => (
        <h2 className={styles.title}>
            <span>Direct Messages</span>
            <div
                ref={showButton}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onClick={(e) => {
                    if (fixedLayer?.type === "popout" && !fixedLayer?.channel) {
                        setFixedLayer(null);
                    } else {
                        setFixedLayer({
                            type: "popout",
                            event: e,
                            gap: 5,
                            element: showButton.current,
                            firstSide: "bottom",
                            secondSide: "right",
                        });
                    }
                }}
            >
                <Icon
                    name="add"
                    size={16}
                    viewbox="0 0 18 18"
                />

                <Tooltip show={hover && fixedLayer?.element !== showButton?.current}>
                    Create DM
                </Tooltip>
            </div>
        </h2>
    ), [hover, fixedLayer]);
};

const UserSection = () => {
    const [showTooltip, setShowTooltip] = useState(false);

    const { auth } = useAuth();
    const { setShowSettings } = useComponents();
    const { userSettings, setUserSettings } = useUserSettings();
    const userSection = useRef(null);

    return (
        <div className={styles.userSectionContainer}>
            <div className={styles.userSection}>
                <div
                    ref={userSection}
                    className={styles.avatarWrapper}
                >
                    <div>
                        {auth?.user?.avatar && (
                            <Image
                                src={auth?.user?.avatar}
                                width={32}
                                height={32}
                                alt="Avatar"
                            />
                        )}
                        <AvatarStatus
                            status={auth?.user?.status}
                            background={"var(--background-2)"}
                        />
                    </div>
                    <div className={styles.contentWrapper}>
                        <div>
                            {auth?.user?.username}
                        </div>
                        <div>
                            {auth?.user?.customStatus === null
                                ? "#0001"
                                : auth?.user?.customStatus}
                        </div>
                    </div>
                </div>

                <div className={styles.toolbar}>
                    <button
                        onMouseEnter={() => setShowTooltip(1)}
                        onMouseLeave={() => setShowTooltip(null)}
                        onClick={() => {
                            if (!userSettings?.microphone
                                && !userSettings?.sound) {
                                setUserSettings({
                                    ...userSettings,
                                    microphone: true,
                                    sound: true,
                                })
                                const audio = new Audio("/assets/sounds/undeafen.mp3");
                                audio.volume = 0.5;
                                audio.play();
                            } else {
                                setUserSettings({
                                    ...userSettings,
                                    microphone: !userSettings?.microphone,
                                })
                                const audio = new Audio(`
                                    /assets/sounds/${userSettings?.microphone
                                        ? "mute" : "unmute"}.mp3
                                `);
                                audio.volume = 0.5;
                                audio.play();
                            }
                        }}
                        className={userSettings?.microphone ? "" : styles.cut}
                    >
                        <Tooltip show={showTooltip === 1}>
                            {userSettings?.microphone ? "Mute" : "Unmute"}
                        </Tooltip>
                        <div className={styles.toolbar}>
                            <Icon
                                name={userSettings?.microphone ? "mic" : "micCut"}
                                size="20"
                            />
                        </div>
                    </button>

                    <button
                        onMouseEnter={() => setShowTooltip(2)}
                        onMouseLeave={() => setShowTooltip(null)}
                        onClick={() => {
                            if (userSettings?.microphone
                                && userSettings?.sound) {
                                setUserSettings({
                                    ...userSettings,
                                    microphone: false,
                                    sound: false,
                                })
                            } else {
                                setUserSettings({
                                    ...userSettings,
                                    sound: !userSettings?.sound,
                                })
                            }

                            const audio = new Audio(`
                                    /assets/sounds/${userSettings?.sound
                                    ? "deafen" : "undeafen"}.mp3
                                `);
                            audio.volume = 0.5;
                            audio.play();
                        }}
                        className={userSettings?.sound ? "" : styles.cut}
                    >
                        <Tooltip show={showTooltip === 2}>
                            {userSettings?.sound ? "Deafen" : "Undeafen"}
                        </Tooltip>
                        <div className={styles.toolbar}>
                            <Icon
                                name={userSettings?.sound ? "headset" : "headsetCut"}
                                size="20"
                            />
                        </div>
                    </button>

                    <button
                        onMouseEnter={() => setShowTooltip(3)}
                        onMouseLeave={() => setShowTooltip(null)}
                        onClick={() => setShowSettings(true)}
                    >
                        <Tooltip show={showTooltip === 3}>
                            User Settings
                        </Tooltip>
                        <div className={styles.toolbar}>
                            <Icon name="settings" size="20" />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConversationList;
