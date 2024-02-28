import { useData, useLayers, useTooltip } from "@/lib/store";
import { Icon, LoadingDots, EmojiPicker } from "@components";
import { useEffect, useState, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useFetchHelper from "@/hooks/useFetchHelper";
import { base } from "@uploadcare/upload-client";
import { getButtonColor } from "@/lib/getColors";
import styles from "./Settings.module.css";
import filetypeinfo from "magic-bytes.js";
import Image from "next/image";

const allowedFileTypes = ["image/png", "image/jpeg", "image/gif", "image/apng", "image/webp"];

const avatars = [
    "178ba6e1-5551-42f3-b199-ddb9fc0f80de",
    "9a5bf989-b884-4f81-b26c-ca1995cdce5e",
    "7cb3f75d-4cad-4023-a643-18c329b5b469",
    "220b2392-c4c5-4226-8b91-2b60c5a13d0f",
    "51073721-c1b9-4d47-a2f3-34f0fbb1c0a8",
];

export function Profiles() {
    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);
    const user = useData((state) => state.user);
    const { sendRequest } = useFetchHelper();

    const tabs = ["User Profile", "Server Profiles"];

    const [activeTab, setActiveTab] = useState<0 | 1>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [avatar, setAvatar] = useState<string | File>(user.avatar);
    const [banner, setBanner] = useState<string | File | undefined>(user.banner);
    const [displayName, setDisplayName] = useState<string>(user.displayName);
    const [primaryColor, setPrimaryColor] = useState<string>(user.primaryColor);
    const [accentColor, setAccentColor] = useState<string>(user.accentColor);
    const [description, setDescription] = useState<string>(user.description ?? "");

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLInputElement>(null);
    const primaryColorInputRef = useRef<HTMLInputElement>(null);
    const accentColorInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        descriptionRef.current!.innerText = description;
    }, []);

    const resetState = () => {
        setAvatar(user.avatar);
        setBanner(user.banner);
        setDisplayName(user.displayName);
        setPrimaryColor(user.primaryColor);
        setAccentColor(user.accentColor);
        setDescription(user.description ?? "");
        const descRef = descriptionRef.current as HTMLInputElement;
        descRef.innerText = user.description ?? "";
    };

    const saveUser = async () => {
        setIsLoading(true);
        let avatarUrl, bannerUrl;

        try {
            if (avatar || banner) {
                if (avatar && typeof avatar !== "string") {
                    const result = await base(avatar as File, {
                        publicKey: process.env.NEXT_PUBLIC_CDN_TOKEN as string,
                        store: "auto",
                    });

                    if (!result.file) console.error(result);
                    else avatarUrl = result.file;
                }

                if (banner && typeof banner !== "string") {
                    const result = await base(banner as File, {
                        publicKey: process.env.NEXT_PUBLIC_CDN_TOKEN as string,
                        store: "auto",
                    });

                    if (!result.file) console.error(result);
                    else bannerUrl = result.file;
                }
            }

            const response = await sendRequest({
                query: "UPDATE_USER",
                data: {
                    avatar: avatarUrl ? avatarUrl : avatar !== user.avatar ? avatar : undefined,
                    banner: bannerUrl ? bannerUrl : banner !== user.banner ? banner : undefined,
                    displayName: displayName !== user.displayName ? displayName : undefined,
                    primaryColor: primaryColor !== user.primaryColor ? primaryColor : undefined,
                    accentColor: accentColor !== user.accentColor ? accentColor : undefined,
                    description: description !== user.description ? description : undefined,
                },
            });

            if (response.success) {
                if (bannerUrl) setBanner(bannerUrl);
                if (avatarUrl) setAvatar(avatarUrl);
            }
        } catch (err) {
            console.error(err);
        }

        setIsLoading(false);
    };

    const needsSaving = () => {
        return (
            avatar !== user.avatar ||
            banner !== user.banner ||
            displayName !== user.displayName ||
            primaryColor !== user.primaryColor ||
            accentColor !== user.accentColor ||
            description !== user.description
        );
    };

    const CardBanner = useMemo(
        () => (
            <svg
                className={styles.cardBanner}
                viewBox={`0 0 340 ${banner || banner ? "120" : "90"}`}
            >
                <mask id="card-banner-mask">
                    <rect
                        fill="white"
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                    />
                    <circle
                        fill="black"
                        cx="58"
                        cy={banner || banner ? 112 : 82}
                        r="46"
                    />
                </mask>

                <foreignObject
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    overflow="visible"
                    mask="url(#card-banner-mask)"
                >
                    <div>
                        <button
                            className={styles.cardBannerBackground}
                            style={{
                                backgroundColor: !banner ? primaryColor : "",
                                backgroundImage: banner
                                    ? `url(${
                                          typeof banner === "string"
                                              ? `${process.env.NEXT_PUBLIC_CDN_URL}${banner}/`
                                              : URL.createObjectURL(banner as File)
                                      })`
                                    : "",
                                height: banner ? "120px" : "90px",
                            }}
                            onClick={() => bannerInputRef.current?.click()}
                        />

                        <div
                            className={styles.cardBannerButton}
                            aria-hidden="true"
                        >
                            Change Banner
                        </div>
                    </div>
                </foreignObject>
            </svg>
        ),
        [banner, primaryColor]
    );

    const CardAvatar = useMemo(
        () => (
            <div
                className={styles.cardAvatar}
                style={{ top: banner ? "76px" : "46px" }}
            >
                <button
                    className={styles.avatarImage}
                    style={{
                        backgroundImage: `url(${
                            avatar !== null && typeof avatar !== "string"
                                ? URL.createObjectURL(avatar)
                                : `${process.env.NEXT_PUBLIC_CDN_URL}${avatar ?? user.avatar}/`
                        })`,
                    }}
                    onClick={() => avatarInputRef.current?.click()}
                />

                <div className={styles.avatarOverlay}>
                    <Icon name="edit" />
                </div>

                {/* <div
                    className={styles.imageUpload}
                    style={{
                        backgroundImage: `url('https://ucarecdn.com/8d8a32ee-a129-4f46-bd8d-da53b814ba94/')`,
                    }}
                /> */}

                <div className={styles.cardAvatarStatus}>
                    <div style={{ backgroundColor: "black" }} />

                    <svg>
                        <rect
                            height="100%"
                            width="100%"
                            rx={8}
                            ry={8}
                            fill="var(--success-light)"
                            mask="url(#svg-mask-status-online)"
                        />
                    </svg>
                </div>
            </div>
        ),
        [avatar, user.avatar, banner]
    );

    return (
        <>
            <div>
                <AnimatePresence>
                    {needsSaving() && (
                        <motion.div
                            className={styles.saveAlert}
                            initial={{ transform: "translateY(80px)" }}
                            animate={{ transform: "translateY(0)" }}
                            exit={{ transform: "translateY(80px)" }}
                            transition={{ duration: 0.1 }}
                        >
                            <p>Careful — you have unsaved changes!</p>

                            <div>
                                <button
                                    className="button underline"
                                    onClick={() => resetState()}
                                >
                                    Reset
                                </button>

                                <button
                                    className={
                                        description.length > 190
                                            ? "button green disabled"
                                            : "button green"
                                    }
                                    onMouseEnter={(e) => {
                                        if (description.length > 190) {
                                            setTooltip({
                                                text: "About me is too long",
                                                element: e.currentTarget,
                                                gap: 12,
                                            });
                                        }
                                    }}
                                    onMouseLeave={() =>
                                        description.length > 190 && setTooltip(null)
                                    }
                                    onClick={() => description.length <= 190 && saveUser()}
                                >
                                    {isLoading ? <LoadingDots /> : "Save Changes"}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <input
                    tabIndex={-1}
                    ref={avatarInputRef}
                    className={styles.hiddenInput}
                    type="file"
                    accept="image/png, image/jpeg, image/gif, image/apng, image/webp"
                    onChange={async (e) => {
                        const file = e.target.files ? e.target.files[0] : null;
                        if (!file) return (e.target.value = "");

                        // Run checks
                        const maxFileSize = 1024 * 1024 * 10; // 10MB
                        if (file.size > maxFileSize) {
                            setLayers({
                                settings: {
                                    type: "POPUP",
                                },
                                content: {
                                    type: "WARNING",
                                    warning: "FILE_SIZE",
                                },
                            });
                            return (e.target.value = "");
                        }

                        const fileBytes = new Uint8Array(await file.arrayBuffer());
                        const fileType = filetypeinfo(fileBytes)?.[0].mime?.toString();

                        if (!fileType || !allowedFileTypes.includes(fileType)) {
                            setLayers({
                                settings: {
                                    type: "POPUP",
                                },
                                content: {
                                    type: "WARNING",
                                    warning: "FILE_TYPE",
                                },
                            });
                            return (e.target.value = "");
                        }

                        const newFile = new File([file], "image", {
                            type: file.type,
                        });

                        setAvatar(newFile);
                        e.target.value = "";
                    }}
                />

                <input
                    tabIndex={-1}
                    ref={bannerInputRef}
                    className={styles.hiddenInput}
                    type="file"
                    accept="image/png, image/jpeg, image/gif, image/apng, image/webp"
                    onChange={async (e) => {
                        const file = e.target.files ? e.target.files[0] : null;
                        if (!file) return (e.target.value = "");

                        // Run checks
                        const maxFileSize = 1024 * 1024 * 10; // 10MB
                        if (file.size > maxFileSize) {
                            setLayers({
                                settings: {
                                    type: "POPUP",
                                },
                                content: {
                                    type: "WARNING",
                                    warning: "FILE_SIZE",
                                },
                            });
                            return (e.target.value = "");
                        }

                        const fileBytes = new Uint8Array(await file.arrayBuffer());
                        const fileType = filetypeinfo(fileBytes);

                        if (!fileType || !allowedFileTypes.includes(fileType[0].mime as string)) {
                            setLayers({
                                settings: {
                                    type: "POPUP",
                                },
                                content: {
                                    type: "WARNING",
                                    warning: "FILE_TYPE",
                                },
                            });
                            return (e.target.value = "");
                        }

                        const newFile = new File([file], "image", {
                            type: file.type,
                        });

                        setBanner(newFile);
                        e.target.value = "";
                    }}
                />

                <input
                    tabIndex={-1}
                    ref={primaryColorInputRef}
                    className={styles.hiddenInput}
                    type="color"
                    onChange={async (e) => setPrimaryColor(e.target.value)}
                />

                <input
                    tabIndex={-1}
                    ref={accentColorInputRef}
                    className={styles.hiddenInput}
                    type="color"
                    onChange={async (e) => setAccentColor(e.target.value)}
                />

                <div className={styles.sectionTitle}>
                    <h2>Profiles</h2>
                </div>

                <div className={styles.contentNav}>
                    {tabs.map((tab: string, index: number) => (
                        <div
                            key={tab + index}
                            onClick={() => setActiveTab(index as 0 | 1)}
                            style={{
                                color: activeTab === index ? "var(--foreground-1)" : "",
                                cursor: activeTab === index ? "default" : "",
                                borderBottom:
                                    activeTab === index ? "2px solid hsl(235, 86.1%, 77.5%)" : "",
                            }}
                        >
                            {tab}
                        </div>
                    ))}
                </div>

                <div className={styles.contentInner}>
                    <div>
                        <section className={styles.customSection}>
                            <label>Display Name</label>

                            <input
                                className={styles.input}
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                aria-label="Display Name"
                                placeholder={user.username}
                                minLength={2}
                                maxLength={32}
                            />
                        </section>

                        <div className={styles.customSection}>
                            <h3>Avatar</h3>

                            <div className={styles.buttonContainer}>
                                <button
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="button blue"
                                >
                                    Change Avatar
                                </button>

                                {!avatars.includes(typeof avatar === "string" ? avatar : "") && (
                                    <button
                                        className="button underline"
                                        onClick={() => setAvatar(null)}
                                    >
                                        Remove Avatar
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className={styles.customSection}>
                            <h3>Profile Banner</h3>

                            <div className={styles.buttonContainer}>
                                <button
                                    className="button blue"
                                    onClick={() => bannerInputRef.current?.click()}
                                >
                                    Change Banner
                                </button>

                                {banner && (
                                    <button
                                        className="button underline"
                                        onClick={() => setBanner(null)}
                                    >
                                        Remove Banner
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className={styles.customSection}>
                            <label>Profile Theme</label>

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
                                            name="edit"
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
                                            name="edit"
                                            size={14}
                                        />
                                    </div>

                                    <div>Accent</div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.customSection}>
                            <label>About me</label>

                            <div className={styles.description}>
                                You can use markdown and links if you'd like
                            </div>

                            <div className={styles.inputLarge}>
                                <div className="scrollbar">
                                    <div className={styles.inputLargeInner}>
                                        <div>
                                            <div
                                                ref={descriptionRef}
                                                role="textbox"
                                                spellCheck="true"
                                                aria-haspopup="listbox"
                                                aria-invalid="false"
                                                aria-label="Description"
                                                aria-multiline="true"
                                                aria-required="true"
                                                aria-autocomplete="list"
                                                autoCorrect="off"
                                                contentEditable="true"
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
                                                    ? "Message is too long"
                                                    : `${
                                                          190 - description.length
                                                      } characters remaining`,
                                            element: e.currentTarget,
                                        });
                                    }}
                                    onMouseLeave={() => setTooltip(null)}
                                    style={{
                                        color: description.length > 190 ? "var(--error-1)" : "",
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
                                    "--card-primary-color": primaryColor,
                                    "--card-accent-color": accentColor,
                                    "--card-overlay-color": "hsla(0, 0%, 0%, 0.6)",
                                    "--card-background-color": "hsla(0, 0%, 0%, 0.45)",
                                    "--card-background-hover": "hsla(0, 0%, 100%, 0.16)",
                                    "--card-divider-color": "hsla(0, 0%, 100%, 0.24)",
                                    "--card-button-color": getButtonColor(
                                        primaryColor,
                                        accentColor
                                    ),
                                    "--card-border-color": primaryColor,
                                } as React.CSSProperties
                            }
                        >
                            <div>
                                {CardBanner}
                                {CardAvatar}

                                <div className={styles.cardBadges}></div>

                                <div className={styles.cardBody}>
                                    <div className={styles.cardSection}>
                                        <h4>{displayName || user.displayName}</h4>
                                        <div>{user.username}</div>
                                    </div>

                                    {user.customStatus && (
                                        <div className={styles.cardSection}>
                                            <div>{user.customStatus}</div>
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
                                                    alt="Fake Activity"
                                                    src="https://ucarecdn.com/5346d913-15ae-4ab3-af18-cd0df14d7678/"
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

                                        <button
                                            className="button"
                                            tabIndex={-1}
                                        >
                                            Example Button
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function StopWatch() {
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
                {`${time.hours > 0 ? time.hours + ":" : ""}${
                    time.minutes
                        ? time.minutes < 10
                            ? "0" + time.minutes + ":"
                            : time.minutes + ":"
                        : "00:"
                }${time.seconds ? (time.seconds < 10 ? "0" + time.seconds : time.seconds) : "00"}`}
            </span>
            {" elapsed"}
        </div>
    );
}
