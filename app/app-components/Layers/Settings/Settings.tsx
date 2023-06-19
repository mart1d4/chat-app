'use client';

import { AvatarStatus, Tooltip, Icon, LoadingDots } from '@/app/app-components';
import { ReactElement, useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useContextHook from '@/hooks/useContextHook';
import { base } from '@uploadcare/upload-client';
import styles from './Settings.module.css';
import useLogout from '@/hooks/useLogout';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';

const Settings = ({ tab }: any): ReactElement => {
    const [activeTab, setActiveTab] = useState<string>(tab ?? 'My Account');

    const { showSettings, setShowSettings }: any = useContextHook({ context: 'layer' });
    const { logout } = useLogout();

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowSettings(false);
            }
        };

        window.addEventListener('keydown', handleEsc);

        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const tabs = [
        {
            name: 'User Settings',
            type: 'title',
        },
        {
            name: 'My Account',
            component: <MyAccount />,
        },
        {
            name: 'Profiles',
        },
        {
            name: 'Privacy & Safety',
        },
        {
            name: 'Authorized Apps',
        },
        {
            name: 'Devices',
        },
        {
            name: 'Connections',
        },
        {
            name: 'Friend Requests',
        },
        { name: 'separator' },
        {
            name: 'App Settings',
            type: 'title',
        },
        {
            name: 'Appearance',
        },
        {
            name: 'Accessibility',
        },
        {
            name: 'Voice & Video',
        },
        {
            name: 'Text & Images',
        },
        {
            name: 'Notifications',
        },
        {
            name: 'Keybinds',
        },
        {
            name: 'Language',
        },
        {
            name: 'Streamer Mode',
        },
        {
            name: 'Advanced',
        },
        { name: 'separator' },
        {
            name: "What's New",
        },
        {
            name: 'separator',
        },
        {
            name: 'Log Out',
            icon: 'logout',
        },
    ];

    return (
        <AnimatePresence>
            {showSettings && (
                <motion.div
                    className={styles.container}
                    initial={{
                        scale: 1.2,
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        transition: {
                            duration: 0.2,
                        },
                    }}
                    exit={{
                        opacity: 0,
                        scale: 1.2,
                        transition: {
                            duration: 0.05,
                        },
                    }}
                >
                    <div className={styles.sidebar}>
                        <div className={styles.sidebarWrapper}>
                            <nav>
                                {tabs.map((tab) => (
                                    <div
                                        key={uuidv4()}
                                        className={
                                            tab.type === 'title'
                                                ? styles.title
                                                : tab.name === 'separator'
                                                ? styles.separator
                                                : activeTab === tab.name
                                                ? styles.tabActive
                                                : styles.tab
                                        }
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (tab.name === 'separator' || tab.type === 'title')
                                                return;
                                            if (tab.name === 'Log Out') {
                                                logout();
                                                setShowSettings(false);
                                            }
                                            setActiveTab(tab.name);
                                        }}
                                    >
                                        {tab.name !== 'separator' && tab.name}

                                        {tab?.icon && (
                                            <Icon
                                                name={tab.icon}
                                                size={16}
                                            />
                                        )}
                                    </div>
                                ))}
                            </nav>
                        </div>
                    </div>

                    <div className={styles.contentContainer}>
                        <div className={styles.contentWrapper}>
                            <div className={styles.content}>
                                {tabs.find((tab) => tab.name === activeTab)?.component}
                            </div>

                            <div className={styles.closeButton}>
                                <div>
                                    <div onClick={() => setShowSettings(false)}>
                                        <Icon
                                            name='close'
                                            size={18}
                                        />
                                    </div>

                                    <div>ESC</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Settings;

const MyAccount = () => {
    const [tooltip, setTooltip] = useState({
        show: false,
        text: 'Copy user ID',
        success: false,
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [avatar, setAvatar] = useState<any>(null);

    const { auth }: any = useContextHook({ context: 'auth' });
    const { setPopup }: any = useContextHook({ context: 'layer' });

    const avatarInputRef = useRef<HTMLInputElement>(null);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(auth.user.id);

            setTooltip({
                ...tooltip,
                text: 'Copied!',
                success: true,
            });

            setTimeout(() => {
                setTooltip({
                    ...tooltip,
                    show: false,
                    text: 'Copy user ID',
                    success: false,
                });
            }, 2000);
        } catch (err) {
            console.error(err);

            setTooltip({
                ...tooltip,
                text: 'Failed to copy',
                success: false,
            });

            setTimeout(() => {
                setTooltip({
                    ...tooltip,
                    show: false,
                    text: 'Copy user ID',
                    success: false,
                });
            }, 2000);
        }
    };

    const fields = [
        {
            title: 'Username',
            value: auth?.user?.username,
            func: () => {
                setPopup({
                    username: {},
                });
            },
        },
        { title: 'Email', value: auth?.user?.email || 'Not set' },
        { title: 'Phone Number', value: auth?.user?.phone || 'Not set' },
    ];

    const handleAvatarSubmit = async () => {
        if (!avatar || isLoading) return;
        setIsLoading(true);

        const result = await base(avatar, {
            publicKey: process.env.NEXT_PUBLIC_CDN_TOKEN as string,
            store: 'auto',
        });

        if (!result.file) {
            console.error(result);
        } else {
            await fetch('/api/users/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`,
                },
                body: JSON.stringify({
                    avatar: result.file,
                }),
            });
        }

        setIsLoading(false);
        setAvatar(null);
    };

    return (
        <>
            <div>
                {avatar && (
                    <div className={styles.saveAlert}>
                        <p>Careful — you have unsaved changes!</p>

                        <div>
                            <button
                                className='button underline'
                                onClick={() => {
                                    setAvatar(null);
                                }}
                            >
                                Reset
                            </button>

                            <button
                                className='button green'
                                onClick={() => handleAvatarSubmit()}
                            >
                                {isLoading ? <LoadingDots /> : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                )}

                <div className={styles.sectionTitle}>
                    <h2 className={styles.titleBig}>My Account</h2>
                </div>

                <div className={styles.userCard}>
                    <div
                        className={styles.userCardHeader}
                        style={{
                            backgroundColor: auth?.user.primaryColor,
                        }}
                    />

                    <div className={styles.userCardInfo}>
                        <input
                            ref={avatarInputRef}
                            className={styles.avatarInput}
                            type='file'
                            accept='image/*'
                            onChange={(e) => {
                                const file = e.target.files ? e.target.files[0] : null;
                                if (!file) return;
                                // Change newfile name to 'image'
                                const newFile = new File([file], 'image', {
                                    type: file.type,
                                });
                                setAvatar(newFile);
                            }}
                        />

                        <div
                            className={styles.userAvatar}
                            onClick={() => {
                                avatarInputRef.current?.click();
                            }}
                        >
                            <Image
                                src={
                                    avatar
                                        ? URL.createObjectURL(avatar)
                                        : `${process.env.NEXT_PUBLIC_CDN_URL}${auth.user.avatar}/`
                                }
                                alt='User Avatar'
                                width={80}
                                height={80}
                                draggable={false}
                            />

                            <AvatarStatus
                                status={auth?.user.status}
                                background='var(--background-2)'
                                mid
                            />
                        </div>

                        <div
                            className={styles.username}
                            onMouseEnter={() =>
                                setTooltip({
                                    ...tooltip,
                                    show: true,
                                })
                            }
                            onMouseLeave={() =>
                                setTooltip({
                                    ...tooltip,
                                    show: false,
                                })
                            }
                            onClick={() => copyToClipboard()}
                        >
                            {auth?.user?.username}

                            <Tooltip
                                show={tooltip?.show}
                                pos='top'
                                background={tooltip?.success ? 'var(--success-light)' : ''}
                                arrow
                            >
                                {tooltip?.text}
                            </Tooltip>
                        </div>

                        <button className='blue'>Edit User Profile</button>
                    </div>

                    <div>
                        {fields.map((field) => (
                            <div
                                className={styles.field}
                                key={uuidv4()}
                            >
                                <div>
                                    <h3>{field.title}</h3>
                                    <div>{field.value}</div>
                                </div>

                                <button
                                    className='grey'
                                    onClick={() => field.func && field.func()}
                                >
                                    Edit
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.section}>
                <div className={styles.sectionTitle}>
                    <h2 className={styles.titleBig}>Password and Authentication</h2>
                </div>

                <button
                    className='blue'
                    style={{ marginBottom: '28px' }}
                    onClick={() =>
                        setPopup({
                            password: {},
                        })
                    }
                >
                    Change Password
                </button>

                <h2 className={styles.titleSmall}>SMS Backup Authentication</h2>
                <div className={styles.accountRemoval}>
                    <div>
                        Add your phone as a backup 2FA method in case you lose your authentication
                        app or backup codes. Your current phone number is 0001.
                    </div>

                    <div className={styles.buttonsContainer}>
                        <button className='blue'>Enable SMS Authentication</button>

                        <button className='underline'>Change phone number</button>
                    </div>
                </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.section}>
                <div className={styles.sectionTitle}>
                    <h2 className={styles.titleSmall}>Account Removal</h2>
                </div>

                <div className={styles.accountRemoval}>
                    <div>
                        Deleting your account will remove all of your data from our servers. This
                        action is irreversible.
                    </div>

                    <button className='red'>Delete Account</button>
                </div>
            </div>
        </>
    );
};
