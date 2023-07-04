'use client';

import { Avatar, Icon } from '@/app/app-components';
import useContextHook from '@/hooks/useContextHook';
import { useRef, ReactElement } from 'react';
import { translateCap } from '@/lib/strings';
import styles from './Channels.module.css';

const UserSection = (): ReactElement => {
    const { setShowSettings, fixedLayer, setFixedLayer }: any = useContextHook({
        context: 'layer',
    });
    const { userSettings, setUserSettings }: any = useContextHook({ context: 'settings' });
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });
    const { auth }: any = useContextHook({ context: 'auth' });

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
                            user: auth.user,
                            element: e.currentTarget,
                            firstSide: 'top',
                            secondSide: 'right',
                            gap: 14,
                        });
                    }}
                    style={{
                        backgroundColor: fixedLayer?.element === userSection.current ? 'var(--background-hover-1)' : '',
                    }}
                >
                    <div>
                        <Avatar
                            src={auth.user.avatar}
                            alt={auth.user.username}
                            size={32}
                            status={auth.user.status}
                        />
                    </div>

                    <div className={styles.contentWrapper}>
                        <div>{auth?.user?.username}</div>
                        <div>{translateCap(auth?.user?.status)}</div>
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
                                name={userSettings?.microphone ? 'mic' : 'micCut'}
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
                                name={userSettings?.sound ? 'headset' : 'headsetCut'}
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

export default UserSection;
