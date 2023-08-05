'use client';

import useContextHook from '@/hooks/useContextHook';
import { useRef, ReactElement } from 'react';
import { translateCap } from '@/lib/strings';
import styles from './UserSection.module.css';
import { Avatar, Icon } from '@components';

export const UserSection = ({ user }): ReactElement => {
    const { setShowSettings, fixedLayer, setFixedLayer, setTooltip }: any = useContextHook({
        context: 'layer',
    });
    const { userSettings, setUserSettings }: any = useContextHook({
        context: 'settings',
    });
    const userSection = useRef<HTMLDivElement>(null);

    return (
        <div className={styles.userSectionContainer}>
            <div className={styles.userSection}>
                <div
                    ref={userSection}
                    className={styles.avatarWrapper}
                    onClick={(e) => {
                        if (fixedLayer?.element === e.currentTarget) {
                            return;
                        }
                        setFixedLayer({
                            type: 'usercard',
                            user: user,
                            element: e.currentTarget,
                            firstSide: 'TOP',
                            secondSide: 'RIGHT',
                            animation: 'off',
                            gap: 14,
                        });
                    }}
                    style={{
                        backgroundColor: fixedLayer?.element === userSection.current ? 'var(--background-hover-1)' : '',
                    }}
                >
                    <div>
                        <Avatar
                            src={user.avatar}
                            alt={user.username}
                            size={32}
                            status={user.status}
                        />
                    </div>

                    <div className={styles.contentWrapper}>
                        <div>{user?.username}</div>
                        <div>{translateCap(user?.status)}</div>
                    </div>
                </div>

                <div className={styles.toolbar}>
                    <button
                        onMouseEnter={(e) =>
                            setTooltip({
                                text: userSettings.microphone ? 'Mute' : 'Unmute',
                                element: e.currentTarget,
                                gap: 3,
                            })
                        }
                        onMouseLeave={() => setTooltip(null)}
                        onClick={() => {
                            setTooltip((prev: any) => ({
                                ...prev,
                                text: !userSettings.microphone ? 'Mute' : 'Unmute',
                                gap: 3,
                            }));

                            if (!userSettings?.microphone && !userSettings?.sound) {
                                setUserSettings({
                                    ...userSettings,
                                    microphone: true,
                                    sound: true,
                                });
                                const audio = new Audio('/assets/sounds/undeafen.mp3');
                                audio.volume = 0.5;
                                audio.play();
                            } else {
                                setUserSettings({
                                    ...userSettings,
                                    microphone: !userSettings?.microphone,
                                });
                                const audio = new Audio(`
                                    /assets/sounds/${userSettings?.microphone ? 'mute' : 'unmute'}.mp3
                                `);
                                audio.volume = 0.5;
                                audio.play();
                            }
                        }}
                        className={userSettings?.microphone ? '' : styles.cut}
                    >
                        <div className={styles.toolbar}>
                            <Icon
                                name={userSettings?.microphone ? 'mic' : 'micSlash'}
                                size={20}
                            />
                        </div>
                    </button>

                    <button
                        onMouseEnter={(e) =>
                            setTooltip({
                                text: userSettings.sound ? 'Deafen' : 'Undeafen',
                                element: e.currentTarget,
                                gap: 3,
                            })
                        }
                        onMouseLeave={() => setTooltip(null)}
                        onClick={() => {
                            setTooltip((prev: any) => ({
                                ...prev,
                                text: !userSettings.sound ? 'Deafen' : 'Undeafen',
                                gap: 3,
                            }));

                            if (userSettings?.microphone && userSettings?.sound) {
                                setUserSettings({
                                    ...userSettings,
                                    microphone: false,
                                    sound: false,
                                });
                            } else {
                                setUserSettings({
                                    ...userSettings,
                                    sound: !userSettings?.sound,
                                });
                            }

                            const audio = new Audio(`
                                    /assets/sounds/${userSettings?.sound ? 'deafen' : 'undeafen'}.mp3
                                `);
                            audio.volume = 0.5;
                            audio.play();
                        }}
                        className={userSettings?.sound ? '' : styles.cut}
                    >
                        <div className={styles.toolbar}>
                            <Icon
                                name={userSettings?.sound ? 'headset' : 'headsetSlash'}
                                size={20}
                            />
                        </div>
                    </button>

                    <button
                        onMouseEnter={(e) =>
                            setTooltip({
                                text: 'User Settings',
                                element: e.currentTarget,
                                gap: 3,
                            })
                        }
                        onMouseLeave={() => setTooltip(null)}
                        onClick={() => setShowSettings(true)}
                    >
                        <div className={styles.toolbar}>
                            <Icon
                                name='settings'
                                size={20}
                            />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};
