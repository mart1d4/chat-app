'use client';

import { Avatar, Icon, LoadingDots, EmojiPicker } from '@/app/app-components';
import { ReactElement, useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useContextHook from '@/hooks/useContextHook';
import { base } from '@uploadcare/upload-client';
import styles from './Settings.module.css';
import useLogout from '@/hooks/useLogout';
import filetypeinfo from 'magic-bytes.js';
import { v4 as uuidv4 } from 'uuid';

const allowedFileTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/apng', 'image/webp'];

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
            component: <Profiles />,
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
            component: <FriendRequests />,
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
    const [showTooltip, setShowTooltip] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [avatar, setAvatar] = useState<any>(null);

    const { setTooltip }: any = useContextHook({ context: 'tooltip' });
    const { setPopup }: any = useContextHook({ context: 'layer' });
    const { auth }: any = useContextHook({ context: 'auth' });

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const usernameRef = useRef<HTMLDivElement>(null);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(auth.user.id);

            setShowTooltip(true);
            setTooltip({
                text: 'Copied to clipboard',
                element: usernameRef.current,
                color: 'var(--success-1)',
            });
        } catch (err) {
            console.error(err);

            setShowTooltip(true);
            setTooltip({
                text: 'Failed to copy to clipboard',
                element: usernameRef.current,
                color: 'var(--error-1)',
            });
        }

        setTimeout(() => {
            setTooltip(null);
            setShowTooltip(false);
        }, 5000);
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
                <AnimatePresence>
                    {avatar && (
                        <motion.div
                            className={styles.saveAlert}
                            initial={{
                                transform: 'translateY(80px)',
                            }}
                            animate={{
                                transform: 'translateY(0)',
                            }}
                            exit={{
                                transform: 'translateY(80px)',
                            }}
                            transition={{
                                duration: 0.1,
                            }}
                        >
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
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className={styles.sectionTitle}>
                    <h2>My Account</h2>
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
                            accept='image/png, image/jpeg, image/gif, image/apng, image/webp'
                            onChange={async (e) => {
                                const file = e.target.files ? e.target.files[0] : null;
                                if (!file) return;

                                // Run checks
                                const maxFileSize = 1024 * 1024 * 10; // 10MB
                                if (file.size > maxFileSize) {
                                    return alert('File size is too large. Max 10MB');
                                }

                                const fileBytes = new Uint8Array(await file.arrayBuffer());
                                const fileType = filetypeinfo(fileBytes);

                                if (
                                    !fileType ||
                                    !allowedFileTypes.includes(fileType[0].mime as string)
                                ) {
                                    return alert(
                                        'File type is not supported. Supported file types are: PNG, JPEG, GIF, WEBP'
                                    );
                                }

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
                            <Avatar
                                src={avatar ? URL.createObjectURL(avatar) : auth.user.avatar}
                                relativeSrc={avatar !== null}
                                alt={auth.user.username}
                                size={80}
                                status={auth.user.status}
                            />
                        </div>

                        <div
                            ref={usernameRef}
                            className={styles.username}
                            onMouseEnter={(e) => {
                                if (showTooltip) return;
                                setTooltip({
                                    text: 'Copy user ID',
                                    element: e.currentTarget,
                                });
                            }}
                            onMouseLeave={() => {
                                if (showTooltip) return;
                                setTooltip(null);
                            }}
                            onClick={() => copyToClipboard()}
                        >
                            {auth?.user?.username}
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
                    <h2>Password and Authentication</h2>
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

                <h3>SMS Backup Authentication</h3>
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
                    <h3>Account Removal</h3>
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

const Profiles = () => {
    const { auth }: any = useContextHook({ context: 'auth' });
    const tabs = ['User Profile', 'Server Profiles'];

    const [activeTab, setActiveTab] = useState<0 | 1>(0);
    const [displayName, setDisplayName] = useState<string>(auth.user.username);
    const [primaryColor, setPrimaryColor] = useState<string>(auth.user.primaryColor);
    const [accentColor, setAccentColor] = useState<string>(auth.user.secondaryColor);
    const [description, setDescription] = useState<string>(auth.user.description || '');

    return (
        <>
            <div>
                <h2>Profiles</h2>

                <div className={styles.contentNav}>
                    {tabs.map((tab: string, index: number) => (
                        <div
                            key={uuidv4()}
                            onClick={() => setActiveTab(index as 0 | 1)}
                            style={{
                                color: activeTab === index ? 'var(--foreground-1)' : '',
                                cursor: activeTab === index ? 'default' : '',
                                borderBottom:
                                    activeTab === index ? '2px solid var(--accent-2)' : '',
                            }}
                        >
                            {tab}
                        </div>
                    ))}
                </div>

                <div className={styles.contentContainer}>
                    <div>
                        <div className={styles.customSection}>
                            <h3>Display Name</h3>

                            <input
                                className={styles.input}
                                type='text'
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                aria-label='Display Name'
                                placeholder={auth.user.username}
                                minLength={2}
                                maxLength={32}
                            />
                        </div>

                        <div className={styles.customSection}>
                            <h3>Avatar</h3>

                            <div className={styles.buttonContainer}>
                                <button className='blue'>Change Avatar</button>
                                <button className='underline'>Remove Avatar</button>
                            </div>
                        </div>

                        <div className={styles.customSection}>
                            <h3>Profile Banner</h3>

                            <div className={styles.buttonContainer}>
                                <button className='blue'>Change Banner</button>
                            </div>
                        </div>

                        <div className={styles.customSection}>
                            <h3>Profile Theme</h3>

                            <div className={styles.sectionContainer}>
                                <div className={styles.colorSwatch}>
                                    <div
                                        style={{
                                            backgroundColor: primaryColor,
                                            borderColor: primaryColor,
                                        }}
                                    >
                                        <Icon
                                            name='edit'
                                            size={14}
                                        />
                                    </div>

                                    <div>Primary</div>
                                </div>

                                <div className={styles.colorSwatch}>
                                    <div
                                        style={{
                                            backgroundColor: accentColor,
                                            borderColor: accentColor,
                                        }}
                                    >
                                        <Icon
                                            name='edit'
                                            size={14}
                                        />
                                    </div>

                                    <div>Accent</div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.customSection}>
                            <h3>About me</h3>

                            <div className={styles.description}>
                                You can use markdown and links if you'd like
                            </div>

                            <div className={styles.inputLarge}>
                                <div>
                                    <div>
                                        <div>
                                            <div
                                                role='textbox'
                                                spellCheck='true'
                                                aria-haspopup='listbox'
                                                aria-invalid='false'
                                                aria-label='Description'
                                                aria-multiline='true'
                                                aria-required='true'
                                                aria-autocomplete='list'
                                                autoCorrect='off'
                                                contentEditable='true'
                                                onDragStart={() => false}
                                                onDrop={() => false}
                                                onInput={(e) => {
                                                    const input = e.target as HTMLDivElement;
                                                    const text = input.innerText.toString();

                                                    setDescription(text);
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <EmojiPicker />
                                        </div>
                                    </div>
                                </div>

                                <div>{190 - description.length}</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3>Preview</h3>

                        <div></div>
                    </div>
                </div>
            </div>
        </>
    );
};

const FriendRequests = () => {
    return (
        <>
            <div>
                <div className={styles.sectionTitle}>
                    <h2>Friend Requests</h2>
                </div>

                <h2>Who can send you a friend request</h2>
            </div>
        </>
    );
};
