import styles from "./UserSection.module.css";
import { Tooltip, Icon, AvatarStatus } from "..";
import { useRef, useState } from "react";
import Image from "next/image";
import useAuth from "../../hooks/useAuth";
import useComponents from "../../hooks/useComponents";
import useUserSettings from "../../hooks/useUserSettings";

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

export default UserSection;
