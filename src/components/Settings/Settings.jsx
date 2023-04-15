import { AvatarStatus, Tooltip, Icon } from '../';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useComponents from '../../hooks/useComponents';
import useLogout from '../../hooks/useLogout';
import useAuth from '../../hooks/useAuth';
import styles from './Settings.module.css';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import Head from 'next/head';

const Settings = ({ tab }) => {
    const [activeTab, setActiveTab] = useState(
        tab ?? 'My Account',
    );
    const [newUsername, setNewUsername] = useState('');
    const [newAvatar, setNewAvatar] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const { showSettings, setShowSettings } = useComponents();
    const { auth, setAuth } = useAuth();
    const axiosPrivate = useAxiosPrivate();
    const { logout } = useLogout();

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
                                            if (tab.name === 'Log Out') {
                                                logout();
                                                setShowSettings(false);
                                            }
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

    const { auth } = useAuth();
    const { setPopup } = useComponents();

    const copyToClipboard = () => {
        navigator.clipboard.writeText(auth?.user?._id);
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
    };

    const fields = [
        {
            title: 'Username',
            value: auth?.user?.username,
            func: () => {
                setPopup({
                    username: {

                    }
                });
            },
        },
        { title: 'Email', value: auth?.user?.email || 'Not set' },
        { title: 'Phone Number', value: auth?.user?.phone || 'Not set' },
    ];

    return (
        <>
            <div>
                <div className={styles.sectionTitle}>
                    <h2 className={styles.titleBig}>My Account</h2>
                </div>

                <div className={styles.userCard}>
                    <div
                        className={styles.userCardHeader}
                        style={{
                            backgroundColor: auth?.user?.accentColor,
                        }}
                    />

                    <div className={styles.userCardInfo}>
                        <div className={styles.userAvatar}>
                            <Image
                                src={auth?.user?.avatar || "/assets/default-avatars/blue.png"}
                                alt="User Avatar"
                                width={80}
                                height={80}
                            />

                            <AvatarStatus
                                status={auth?.user?.status}
                                background="var(--background-2)"
                                mid
                            />
                        </div>

                        <div
                            className={styles.username}
                            onMouseEnter={() => setTooltip({
                                ...tooltip,
                                show: true,
                            })}
                            onMouseLeave={() => setTooltip({
                                ...tooltip,
                                show: false,
                            })}
                            onClick={() => copyToClipboard()}
                        >
                            {auth?.user?.username}

                            <Tooltip
                                show={tooltip?.show}
                                pos="top"
                                background={tooltip?.success ? 'var(--success-light)' : null}
                            >
                                {tooltip?.text}
                            </Tooltip>
                        </div>

                        <button
                            className="blue"
                            onClick={() => setActiveTab('Profiles')}
                        >
                            Edit User Profile
                        </button>
                    </div>

                    <div>
                        {fields.map((field) => (
                            <div className={styles.field} key={uuidv4()}>
                                <div>
                                    <h3>{field.title}</h3>
                                    <div>{field.value}</div>
                                </div>

                                <button
                                    className="grey"
                                    onClick={() => field.func()}
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
                    className="blue"
                    style={{ marginBottom: "28px" }}
                    onClick={() => setPopup({
                        password: {

                        },
                    })}
                >
                    Change Password
                </button>

                <h2 className={styles.titleSmall}>SMS Backup Authentication</h2>
                <div className={styles.accountRemoval}>
                    <div>
                        Add your phone as a backup 2FA method in case you lose your authentication app or backup codes. Your current phone number is 0001.
                    </div>

                    <div className={styles.buttonsContainer}>
                        <button className="blue">
                            Enable SMS Authentication
                        </button>

                        <button className="underline">
                            Change phone number
                        </button>
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
                        Deleting your account will remove all of your data from our servers. This action is irreversible.
                    </div>

                    <button className="red">
                        Delete Account
                    </button>
                </div>
            </div>
        </>
    );
};
