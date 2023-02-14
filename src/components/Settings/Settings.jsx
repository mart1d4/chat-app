import styles from './Settings.module.css';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import useComponents from '../../hooks/useComponents';
import useAuth from '../../hooks/useAuth';
import { Icon } from "../";
import { MyAccount, Profiles, PrivacySafety } from './UserSettings';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('My Account');
    const [newUsername, setNewUsername] = useState('');
    const [newAvatar, setNewAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const { setShowSettings } = useComponents();
    const { auth, setAuth } = useAuth();
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                setShowSettings(false);
            }
        };

        window.addEventListener('keydown', handleEsc);

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const saveChanges = async () => {
        if (newUsername.length) {
            if ((newUsername.length < 3 || newUsername.length > 32)) {
                setError('Username must be between 3 and 32 characters long!');
            } else {
                const data = await axiosPrivate.patch(
                    `/users/${auth?.user?._id}`,
                    { username: newUsername },
                );

                if (data?.data?.error) {
                    setError(data.data.error);
                } else {
                    setSuccess('Username changed successfully!');
                    setAuth({
                        ...auth,
                        user: { ...auth.user, username: newUsername }
                    });
                }
            }
        }

        if (newAvatar) {
            const formData = new FormData();
            formData.append('avatar', newAvatar);

            const data = await axiosPrivate.post(
                `/users/${auth?.user?._id}/avatar`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            if (data.data.error) {
                setError(data.data.error);
            } else {
                setSuccess('Profile picture changed successfully!');
                setAuth({
                    ...auth,
                    user: { ...auth.user, avatar: response.data.avatar },
                });
            }
        }
    };

    const fileBiggerThan500MB = (file) => {
        const fileSizeInMB = file.size / 1024 / 1024;
        return fileSizeInMB > 100;
    };

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
            component: <Profiles />,
        },
        {
            name: 'Privacy & Safety',
            component: <PrivacySafety />,
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
            name: 'What\'s New',
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
        <motion.div
            className={styles.container}
            initial={{
                scale: 1.2,
            }}
            animate={{
                opacity: 1,
                scale: 1,
            }}
            exit={{
                opacity: 0,
                scale: 1.2,
            }}
            transition={{
                duration: 0.3,
                type: 'spring',
                stiffness: 200,
                damping: 20,
            }}
        >
            <Head>
                <title>Discord | {activeTab} | User Settings</title>
            </Head>
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
                                    if (
                                        tab.name === 'separator'
                                        || tab.type === 'title'
                                    ) return;
                                    setActiveTab(tab.name);
                                }}
                            >
                                {tab.name !== 'separator' && tab.name}

                                {tab?.icon && (
                                    <Icon name={tab.icon} size={16} />
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
                                <Icon name="close" size={18} />
                            </div>

                            <div>ESC</div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default Settings;
