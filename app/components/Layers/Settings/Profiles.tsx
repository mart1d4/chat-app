import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip/Tooltip";
import { Icon, LoadingDots, EmojiPicker, Alert } from "@components";
import { useEffect, useState, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useFetchHelper from "@/hooks/useFetchHelper";
import { useUploadThing } from "@/lib/uploadthing";
import { getButtonColor } from "@/lib/getColors";
import { getRandomAvatar } from "@/lib/avatars";
import styles from "./Settings.module.css";
import type { User } from "@/type";
import { useData } from "@/store";
import Image from "next/image";

const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;

export function Profiles() {
    const user = useData((state) => state.user) as User;
    const setUser = useData((state) => state.setUser);
    const { sendRequest } = useFetchHelper();

    const tabs = ["User Profile", "Server Profiles"];

    const [activeTab, setActiveTab] = useState<0 | 1>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{
        [key: string]: string;
    }>({});

    const [avatar, setAvatar] = useState<string | File>(user.avatar);
    const [banner, setBanner] = useState<string | File | null>(user.banner);
    const [displayName, setDisplayName] = useState(user.displayName);
    const [primaryColor, setPrimaryColor] = useState(user.primaryColor);
    const [accentColor, setAccentColor] = useState(user.accentColor);
    const [description, setDescription] = useState(user.description);

    const primaryColorInputRef = useRef<HTMLInputElement>(null);
    const accentColorInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLInputElement>(null);

    const [avatarId, setAvatarId] = useState<string | null>(null);
    const [bannerId, setBannerId] = useState<string | null>(null);

    const { startUpload: uploadAvatar } = useUploadThing("imageUploader", {
        onClientUploadComplete: (files) => {
            const { key: fileId } = files[0];
            if (!fileId) throw new Error("No file ID returned from cdn.");
            setAvatarId(fileId);
        },
        onUploadError: (error) => {
            console.error(error);
            setErrors({ avatar: "An error occured while uploading your avatar" });
            setIsLoading(false);

            setTimeout(() => {
                setErrors({});
            }, 5000);
        },
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    const { startUpload: uploadBanner } = useUploadThing("imageUploader", {
        onClientUploadComplete: (files) => {
            const { key: fileId } = files[0];
            if (!fileId) throw new Error("No file ID returned from cdn.");
            setBannerId(fileId);
        },
        onUploadError: (error) => {
            console.error(error);
            setErrors({ banner: "An error occured while uploading your banner" });
            setIsLoading(false);

            setTimeout(() => {
                setErrors({});
            }, 5000);
        },
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    useEffect(() => {
        resetState();
    }, [user]);

    useEffect(() => {
        if (avatarId || bannerId) {
            saveUser();
        }
    }, [avatarId, bannerId]);

    const randomAvatar = getRandomAvatar(user.id);

    function resetState() {
        if (!user) return;

        setAvatar(user.avatar);
        setBanner(user.banner);
        setDisplayName(user.displayName);
        setPrimaryColor(user.primaryColor);
        setAccentColor(user.accentColor);
        setDescription(user.description);
        setAvatarId(null);
        setBannerId(null);
        setErrors({});
        setIsLoading(false);

        const desc = descriptionRef.current;
        if (desc) desc.innerText = user.description || "";
    }

    const needsSaving =
        avatar !== user.avatar ||
        banner !== user.banner ||
        displayName !== user.displayName ||
        primaryColor !== user.primaryColor ||
        accentColor !== user.accentColor ||
        description !== user.description;

    async function saveUser() {
        if (isLoading && !avatarId && !bannerId) return;
        setIsLoading(true);

        if (avatar instanceof File && !avatarId) {
            uploadAvatar([avatar]);
            return;
        }

        if (banner instanceof File && !bannerId) {
            uploadBanner([banner]);
            return;
        }

        try {
            const { errors, data } = await sendRequest({
                query: "UPDATE_USER",
                body: {
                    avatar: avatar !== user.avatar ? avatarId || avatar : undefined,
                    banner: banner !== user.banner ? bannerId || banner : undefined,
                    displayName: displayName !== user.displayName ? displayName : undefined,
                    primaryColor: primaryColor !== user.primaryColor ? primaryColor : undefined,
                    accentColor: accentColor !== user.accentColor ? accentColor : undefined,
                    description: description !== user.description ? description : undefined,
                },
            });

            if (data?.user) {
                setUser({ ...user, ...data.user });
                setErrors({});
            } else if (errors) {
                setErrors(errors);
            }
        } catch (err) {
            console.error(err);
            setErrors({ server: "An error occurred while saving your profile" });
        }
    }

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
                                              ? `${cdnUrl}${banner}`
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
                            typeof avatar === "string"
                                ? `${cdnUrl}${avatar}`
                                : URL.createObjectURL(avatar as File)
                        })`,
                    }}
                    onClick={() => avatarInputRef.current?.click()}
                />

                <div className={styles.avatarOverlay}>
                    <Icon name="edit" />
                </div>

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
        [avatar, banner]
    );

    return (
        <>
            <div>
                {(errors.avatar || errors.banner) && (
                    <Alert
                        message={errors.avatar || errors.banner}
                        type="danger"
                    />
                )}

                <AnimatePresence>
                    {needsSaving && (
                        <motion.div
                            className={styles.saveAlert}
                            initial={{ transform: "translateY(80px)" }}
                            animate={{ transform: "translateY(0)" }}
                            exit={{ transform: "translateY(80px)" }}
                            transition={{ duration: 0.1 }}
                        >
                            <p>
                                {errors.server
                                    ? errors.server
                                    : "Careful — you have unsaved changes!"}
                            </p>

                            <div>
                                <button
                                    type="button"
                                    className="button underline"
                                    onClick={() => resetState()}
                                >
                                    Reset
                                </button>

                                <Tooltip showOn={(description?.length || 0) > 190}>
                                    <TooltipTrigger>
                                        <button
                                            type="button"
                                            className={
                                                (description?.length || 0) > 190
                                                    ? "button green disabled"
                                                    : "button green"
                                            }
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                if ((description?.length || 0) <= 190) {
                                                    saveUser();
                                                }
                                            }}
                                        >
                                            {isLoading ? <LoadingDots /> : "Save Changes"}
                                        </button>
                                    </TooltipTrigger>

                                    <TooltipContent>About me is too long</TooltipContent>
                                </Tooltip>
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
                        const maxFileSize = 1024 * 1024 * 4; // 10MB
                        if (file.size > maxFileSize) {
                            setErrors({
                                avatar: "File size is too large. A maximum of 4MB is allowed",
                            });

                            setTimeout(() => {
                                setErrors({});
                            }, 5000);

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
                        const maxFileSize = 1024 * 1024 * 4; // 10MB
                        if (file.size > maxFileSize) {
                            setErrors({
                                banner: "File size is too large. A maximum of 4MB is allowed",
                            });

                            setTimeout(() => {
                                setErrors({});
                            }, 5000);

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

                                {avatar !== randomAvatar && (
                                    <button
                                        className="button underline"
                                        onClick={() => setAvatar(randomAvatar)}
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

                                <Tooltip>
                                    <TooltipTrigger>
                                        <div
                                            style={{
                                                color:
                                                    (description?.length || 0) > 190
                                                        ? "var(--error-1)"
                                                        : "",
                                            }}
                                        >
                                            {190 - (description?.length || 0)}
                                        </div>
                                    </TooltipTrigger>

                                    <TooltipContent>
                                        {(description?.length || 0) > 190
                                            ? "Message is too long"
                                            : `${
                                                  190 - (description?.length || 0)
                                              } characters remaining`}
                                    </TooltipContent>
                                </Tooltip>
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
                                                    src="/assets/system/fake-activity.png"
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
