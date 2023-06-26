'use client';

import { Avatar, Icon, LoadingDots, EmojiPicker } from '@/app/app-components';
import { ReactElement, useEffect, useState, useRef } from 'react';
import { getButtonColor } from '@/lib/colors/getColors';
import { AnimatePresence, motion } from 'framer-motion';
import useContextHook from '@/hooks/useContextHook';
import { base } from '@uploadcare/upload-client';
import styles from './Settings.module.css';
import Image from 'next/dist/client/image';
import useLogout from '@/hooks/useLogout';
import filetypeinfo from 'magic-bytes.js';
import { v4 as uuidv4 } from 'uuid';

const allowedFileTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/apng', 'image/webp'];

const avatars = [
    '178ba6e1-5551-42f3-b199-ddb9fc0f80de',
    '9a5bf989-b884-4f81-b26c-ca1995cdce5e',
    '7cb3f75d-4cad-4023-a643-18c329b5b469',
    '220b2392-c4c5-4226-8b91-2b60c5a13d0f',
    '51073721-c1b9-4d47-a2f3-34f0fbb1c0a8',
];

const getRandomAvatar = (): string => {
    const index = Math.floor(Math.random() * avatars.length);
    return avatars[index];
};

const Settings = (): ReactElement => {
    const [activeTab, setActiveTab] = useState<string>('My Account');

    const { showSettings, setShowSettings }: any = useContextHook({ context: 'layer' });
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });
    const { logout } = useLogout();

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowSettings(false);
            }
        };

        window.addEventListener('keydown', handleEsc);

        if (typeof showSettings !== 'boolean') {
            setActiveTab(showSettings.type);
        }

        return () => window.removeEventListener('keydown', handleEsc);
    }, [showSettings]);

    const tabs = [
        {
            name: 'User Settings',
            type: 'title',
        },
        {
            name: 'My Account',
            // @ts-ignore
            component: <MyAccount setActiveTab={setActiveTab} />,
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
                        transform: 'translateY(100%)',
                    }}
                    animate={{
                        transform: 'translateY(0%)',
                    }}
                    exit={{
                        transform: 'translateY(100%)',
                    }}
                    transition={{
                        duration: 0.5,
                        ease: 'backOut',
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
                                            if (tab.name === 'separator' || tab.type === 'title') return;
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
                                    <div
                                        onClick={() => {
                                            setTooltip(null);
                                            setShowSettings(false);
                                        }}
                                    >
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

const MyAccount = ({ setActiveTab }: any) => {
    const [showTooltip, setShowTooltip] = useState<boolean>(false);

    const { setTooltip }: any = useContextHook({ context: 'tooltip' });
    const { setPopup }: any = useContextHook({ context: 'layer' });
    const { auth }: any = useContextHook({ context: 'auth' });

    const usernameRef = useRef<HTMLDivElement>(null);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(auth.user.id);

            setShowTooltip(true);
            setTooltip({
                text: 'Copied to clipboard',
                element: usernameRef.current,
                color: 'var(--success-light)',
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

    return (
        <>
            <div>
                <div className={styles.sectionTitle}>
                    <h2>My Account</h2>
                </div>

                <div className={styles.userCard}>
                    <div
                        className={styles.userCardHeader}
                        style={{ backgroundColor: auth?.user.primaryColor }}
                    />

                    <div className={styles.userCardInfo}>
                        <div className={styles.userAvatar}>
                            <Avatar
                                src={auth.user.avatar}
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

                        <button
                            className='blue'
                            onClick={() => setActiveTab('Profiles')}
                        >
                            Edit User Profile
                        </button>
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
                        Add your phone as a backup 2FA method in case you lose your authentication app or backup codes.
                        Your current phone number is 0001.
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
                        Deleting your account will remove all of your data from our servers. This action is
                        irreversible.
                    </div>

                    <button className='red'>Delete Account</button>
                </div>
            </div>
        </>
    );
};

const Profiles = () => {
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });
    const { auth }: any = useContextHook({ context: 'auth' });
    const tabs = ['User Profile', 'Server Profiles'];

    const [avatar, setAvatar] = useState<File | string | null>(null);
    const [banner, setBanner] = useState<File | null>(null);
    const [activeTab, setActiveTab] = useState<0 | 1>(0);
    const [displayName, setDisplayName] = useState<string>(auth.user.displayName);
    const [primaryColor, setPrimaryColor] = useState<string>(auth.user.primaryColor);
    const [accentColor, setAccentColor] = useState<string>(auth.user.accentColor);
    const [description, setDescription] = useState<string>(auth.user.description || '');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLInputElement>(null);
    const primaryColorInputRef = useRef<HTMLInputElement>(null);
    const accentColorInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        descriptionRef.current!.innerText = description;
    }, []);

    const resetState = () => {
        setAvatar(null);
        setBanner(null);
        setDisplayName(auth.user.displayName);
        setPrimaryColor(auth.user.primaryColor);
        setAccentColor(auth.user.accentColor);
        setDescription(auth.user.description || '');
        const descRef = descriptionRef.current as HTMLInputElement;
        descRef.innerText = auth.user.description || '';
    };

    const saveUser = async () => {
        setIsLoading(true);
        let avatarUrl, bannerUrl;

        try {
            if (avatar || banner) {
                if (avatar && typeof avatar !== 'string') {
                    const result = await base(avatar as File, {
                        publicKey: process.env.NEXT_PUBLIC_CDN_TOKEN as string,
                        store: 'auto',
                    });

                    if (!result.file) {
                        console.error(result);
                    } else {
                        avatarUrl = result.file;
                    }
                }

                if (banner && typeof banner !== 'string') {
                    const result = await base(banner as File, {
                        publicKey: process.env.NEXT_PUBLIC_CDN_TOKEN as string,
                        store: 'auto',
                    });

                    if (!result.file) {
                        console.error(result);
                    } else {
                        bannerUrl = result.file;
                    }
                }
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`,
                },
                body: JSON.stringify({
                    avatar: avatarUrl ? avatarUrl : typeof avatar === 'string' ? avatar : undefined,
                    banner: bannerUrl ? bannerUrl : typeof banner === 'string' ? banner : undefined,
                    displayName: displayName !== auth.user.displayName ? displayName : undefined,
                    primaryColor: primaryColor !== auth.user.primaryColor ? primaryColor : undefined,
                    accentColor: accentColor !== auth.user.accentColor ? accentColor : undefined,
                    description: description !== auth.user.description ? description : undefined,
                }),
            });

            if (!response.ok) {
                console.error(response);
            }

            resetState();
        } catch (err) {
            console.error(err);
        }

        setIsLoading(false);
    };

    const needsSaving = () => {
        return (
            avatar ||
            banner ||
            displayName !== auth.user.displayName ||
            primaryColor !== auth.user.primaryColor ||
            accentColor !== auth.user.accentColor ||
            (description !== auth.user.description && description !== '')
        );
    };

    return (
        <>
            <div>
                <AnimatePresence>
                    {needsSaving() && (
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
                                    onClick={() => resetState()}
                                >
                                    Reset
                                </button>

                                <button
                                    className={description.length > 190 ? 'button green disabled' : 'button green'}
                                    onMouseEnter={(e) => {
                                        if (description.length > 190) {
                                            setTooltip({
                                                text: 'About me is too long',
                                                element: e.currentTarget,
                                                gap: 12,
                                            });
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        if (description.length > 190) {
                                            setTooltip(null);
                                        }
                                    }}
                                    onClick={() => {
                                        if (description.length > 190) {
                                            return;
                                        }
                                        saveUser();
                                    }}
                                >
                                    {isLoading ? <LoadingDots /> : 'Save Changes'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <input
                    ref={avatarInputRef}
                    className={styles.hiddenInput}
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

                        if (!fileType || !allowedFileTypes.includes(fileType[0].mime as string)) {
                            return alert('File type is not supported. Supported file types are: PNG, JPEG, GIF, WEBP');
                        }

                        const newFile = new File([file], 'image', {
                            type: file.type,
                        });

                        setAvatar(newFile);
                    }}
                />

                <input
                    ref={bannerInputRef}
                    className={styles.hiddenInput}
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

                        if (!fileType || !allowedFileTypes.includes(fileType[0].mime as string)) {
                            return alert('File type is not supported. Supported file types are: PNG, JPEG, GIF, WEBP');
                        }

                        const newFile = new File([file], 'image', {
                            type: file.type,
                        });

                        setBanner(newFile);
                    }}
                />

                <input
                    ref={primaryColorInputRef}
                    className={styles.hiddenInput}
                    type='color'
                    onChange={async (e) => {
                        setPrimaryColor(e.target.value);
                    }}
                />

                <input
                    ref={accentColorInputRef}
                    className={styles.hiddenInput}
                    type='color'
                    onChange={async (e) => {
                        setAccentColor(e.target.value);
                    }}
                />

                <h2>Profiles</h2>

                <div className={styles.contentNav}>
                    {tabs.map((tab: string, index: number) => (
                        <div
                            key={uuidv4()}
                            onClick={() => setActiveTab(index as 0 | 1)}
                            style={{
                                color: activeTab === index ? 'var(--foreground-1)' : '',
                                cursor: activeTab === index ? 'default' : '',
                                borderBottom: activeTab === index ? '2px solid var(--accent-2)' : '',
                            }}
                        >
                            {tab}
                        </div>
                    ))}
                </div>

                <div className={styles.contentInner}>
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
                                <button
                                    onClick={() => avatarInputRef.current?.click()}
                                    className='blue'
                                >
                                    Change Avatar
                                </button>
                                <button
                                    className='underline'
                                    onClick={() => {
                                        setAvatar(getRandomAvatar());
                                    }}
                                >
                                    Remove Avatar
                                </button>
                            </div>
                        </div>

                        <div className={styles.customSection}>
                            <h3>Profile Banner</h3>

                            <div className={styles.buttonContainer}>
                                <button
                                    className='blue'
                                    onClick={() => bannerInputRef.current?.click()}
                                >
                                    Change Banner
                                </button>
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
                                        onClick={() => primaryColorInputRef.current?.click()}
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
                                        onClick={() => accentColorInputRef.current?.click()}
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

                            <div className={styles.description}>You can use markdown and links if you'd like</div>

                            <div className={styles.inputLarge}>
                                <div className='scrollbar'>
                                    <div className={styles.inputLargeInner}>
                                        <div>
                                            <div
                                                ref={descriptionRef}
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

                                <div
                                    onMouseEnter={(e) => {
                                        setTooltip({
                                            text:
                                                description.length > 190
                                                    ? 'Message is too long'
                                                    : `${190 - description.length} characters remaining`,
                                            element: e.currentTarget,
                                        });
                                    }}
                                    onMouseLeave={() => setTooltip(null)}
                                    style={{
                                        color: description.length > 190 ? 'var(--error-1)' : '',
                                    }}
                                >
                                    {190 - description.length}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3>Preview</h3>

                        <div
                            className={styles.cardContainer}
                            style={
                                {
                                    '--card-primary-color': primaryColor,
                                    '--card-accent-color': accentColor,
                                    '--card-overlay-color': 'hsla(0, 0%, 0%, 0.6)',
                                    '--card-background-color': 'hsla(0, 0%, 0%, 0.45)',
                                    '--card-background-hover': 'hsla(0, 0%, 100%, 0.16)',
                                    '--card-divider-color': 'hsla(0, 0%, 100%, 0.24)',
                                    '--card-button-color': getButtonColor(primaryColor, accentColor),
                                    '--card-border-color': primaryColor,
                                } as React.CSSProperties
                            }
                        >
                            <div>
                                <svg
                                    className={styles.cardBanner}
                                    viewBox={`0 0 340 ${banner || auth.user.banner ? '120' : '90'}`}
                                >
                                    <mask id='card-banner-mask'>
                                        <rect
                                            fill='white'
                                            x='0'
                                            y='0'
                                            width='100%'
                                            height='100%'
                                        />
                                        <circle
                                            fill='black'
                                            cx='58'
                                            cy={banner || auth.user.banner ? 112 : 82}
                                            r='46'
                                        />
                                    </mask>

                                    <foreignObject
                                        x='0'
                                        y='0'
                                        width='100%'
                                        height='100%'
                                        overflow='visible'
                                        mask='url(#card-banner-mask)'
                                    >
                                        <div>
                                            <div
                                                className={styles.cardBannerBackground}
                                                style={{
                                                    backgroundColor: !auth.user.banner && !banner ? primaryColor : '',
                                                    backgroundImage:
                                                        auth.user.banner || banner
                                                            ? `url(${
                                                                  banner !== null && typeof banner !== 'string'
                                                                      ? URL.createObjectURL(banner)
                                                                      : `${process.env.NEXT_PUBLIC_CDN_URL}${
                                                                            banner ?? auth.user.banner
                                                                        }/`
                                                              })`
                                                            : '',
                                                    height: banner || auth.user.banner ? '120px' : '90px',
                                                }}
                                                onClick={() => bannerInputRef.current?.click()}
                                            />

                                            <div
                                                className={styles.cardBannerButton}
                                                aria-hidden='true'
                                            >
                                                Change Banner
                                            </div>
                                        </div>
                                    </foreignObject>
                                </svg>

                                <div
                                    className={styles.cardAvatar}
                                    style={{
                                        top: banner || auth.user.banner ? '76px' : '46px',
                                    }}
                                >
                                    <div
                                        className={styles.avatarImage}
                                        style={{
                                            backgroundImage: `url(${
                                                avatar !== null && typeof avatar !== 'string'
                                                    ? URL.createObjectURL(avatar)
                                                    : `${process.env.NEXT_PUBLIC_CDN_URL}${avatar ?? auth.user.avatar}/`
                                            })`,
                                        }}
                                        onClick={() => avatarInputRef.current?.click()}
                                    />

                                    <div className={styles.avatarOverlay}>{`Change\nAvatar`}</div>
                                    <div className={styles.imageUpload}></div>

                                    <div className={styles.cardAvatarStatus}>
                                        <div
                                            style={{
                                                backgroundColor: 'black',
                                            }}
                                        />

                                        <svg>
                                            <rect
                                                height='100%'
                                                width='100%'
                                                rx={8}
                                                ry={8}
                                                fill='var(--success-light)'
                                                mask='url(#svg-mask-status-online)'
                                            />
                                        </svg>
                                    </div>
                                </div>

                                <div className={styles.cardBadges}></div>

                                <div className={styles.cardBody}>
                                    <div className={styles.cardSection}>
                                        <h4>{displayName || auth.user.displayName}</h4>
                                        <div>{auth.user.username}</div>
                                    </div>

                                    {auth.user.customStatus && (
                                        <div className={styles.cardSection}>
                                            <div>{auth.user.customStatus}</div>
                                        </div>
                                    )}

                                    <div className={styles.cardDivider} />

                                    {description && (
                                        <div className={styles.cardSection}>
                                            <h4>About me</h4>
                                            <div>{description}</div>
                                        </div>
                                    )}

                                    <div className={styles.cardSectionLarge}>
                                        <h4>Customizing my profile</h4>

                                        <div>
                                            <div>
                                                <Image
                                                    alt='Fake Activity'
                                                    src='/assets/app/fake-activity.png'
                                                    width={48}
                                                    height={48}
                                                    draggable={false}
                                                />
                                            </div>

                                            <div className={styles.cardTime}>
                                                <div>User Profile</div>
                                                <StopWatch />
                                            </div>
                                        </div>

                                        <button>Example Button</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const StopWatch = () => {
    const [time, setTime] = useState<{
        hours: number;
        minutes: number;
        seconds: number;
    }>({
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const interval = setInterval(() => {
            let hour = time.hours;
            let minute = time.minutes;
            let second = time.seconds;

            if (second === 59) {
                second = 0;
                minute++;
            } else {
                second++;
            }

            if (minute === 59) {
                minute = 0;
                hour++;
            }

            setTime({
                hours: hour,
                minutes: minute,
                seconds: second,
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [time]);

    return (
        <div>
            <span>
                {`${time.hours > 0 ? time.hours + ':' : ''}${
                    time.minutes ? (time.minutes < 10 ? '0' + time.minutes + ':' : time.minutes + ':') : '00:'
                }${time.seconds ? (time.seconds < 10 ? '0' + time.seconds : time.seconds) : '00'}`}
            </span>
            {' elapsed'}
        </div>
    );
};

const FriendRequests = () => {
    return (
        <>
            <div>
                <div className={styles.sectionTitle}>
                    <h2>Friend Requests</h2>
                </div>

                <h3>Who can send you a friend request</h3>
            </div>
        </>
    );
};
