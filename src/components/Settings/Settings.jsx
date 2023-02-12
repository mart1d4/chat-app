import styles from './Settings.module.css';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import useComponents from '../../hooks/useComponents';
import useAuth from '../../hooks/useAuth';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('My Account');
    const [newUsername, setNewUsername] = useState('');
    const [newAvatar, setNewAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        console.log(error);
    }, [error]);

    useEffect(() => {
        console.log(success);
    }, [success]);

    const { setShowSettings } = useComponents();
    const { auth, setAuth } = useAuth();
    const axiosPrivate = useAxiosPrivate();

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
            name: 'What\'s New',
        },
        {
            name: 'separator',
        },
        {
            name: 'Log Out',
        },
    ];

    return (
        <motion.div
            className={styles.container}
            initial={{
                opacity: 0,
                scale: 1.5,
            }}
            animate={{
                opacity: 1,
                scale: 1,
            }}
            exit={{
                opacity: 0,
                scale: 1.5,
            }}
            transition={{
                duration: 0.2,
                ease: 'easeInOut',
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
                                onClick={() => {
                                    if (
                                        tab.name === 'separator'
                                        || tab.type === 'title'
                                    ) return;
                                    setActiveTab(tab.name);
                                }}
                            >
                                {tab.name !== 'separator' && tab.name}
                            </div>
                        ))}
                    </nav>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.contentWrapper}>
                    <div>
                        <h1>{activeTab}</h1>
                        <button
                            className={styles.closeButton}
                            onClick={() => setShowSettings(false)}
                        >
                            <span>Close</span>
                        </button>

                        {activeTab === 'My Account' && (
                            <div>
                                <form>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="username">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            name="username"
                                            id="username"
                                            placeholder="Username"
                                            value={newUsername}
                                            onChange={(e) => setNewUsername(e.target.value)}
                                        />

                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="avatar">
                                            Profile Picture
                                        </label>
                                        <input
                                            type="file"
                                            name="avatar"
                                            id="avatar"
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (e.target.files[0]) {
                                                    if (fileBiggerThan500MB(e.target.files[0])) {
                                                        setError('File size must be less than 100MB');
                                                        return;
                                                    }
                                                    setNewAvatar(e.target.files[0]);
                                                    setAvatarPreview(URL.createObjectURL(e.target.files[0]));
                                                }
                                            }}
                                            style={{ display: 'none' }}
                                        />
                                        <div
                                            style={{
                                                borderRadius: '50%',
                                                backgroundImage: `url(${avatarPreview ||
                                                    auth?.user?.avatar
                                                    })`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat',
                                                width: '100px',
                                                height: '100px',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => {
                                                document.getElementById('avatar').click();
                                            }}
                                        >
                                        </div>
                                    </div>
                                </form>

                                <button
                                    className={styles.saveButton}
                                    onClick={() => {
                                        saveChanges();
                                    }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default Settings;
