import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import useFetchHelper from "@/hooks/useFetchHelper";
import { useUploadThing } from "@/lib/uploadthing";
import styles from "./Settings.module.css";
import type Cropper from "cropperjs";
import { useData } from "@/store";
import {
    InteractiveElement,
    TooltipContent,
    TooltipTrigger,
    PopoverContent,
    PopoverTrigger,
    DialogContent,
    ImageCropper,
    EmojiPicker,
    LoadingDots,
    ColorPicker,
    UserCard,
    Tooltip,
    Popover,
    Dialog,
    Alert,
    Icon,
} from "@components";

export function Profiles() {
    const setUser = useData((state) => state.setUser);
    const { sendRequest } = useFetchHelper();
    const user = useAuthenticatedUser();

    const tabs = ["User Profile", "Server Profiles"];

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [activeTab, setActiveTab] = useState<0 | 1>(0);
    const [isLoading, setIsLoading] = useState(false);

    const [cropper, setCropper] = useState<Cropper | null>(null);
    const [fileTemp, setFileTemp] = useState<File | null>(null);
    const [fileType, setFileType] = useState<"avatar" | "banner">("avatar");

    const [avatar, setAvatar] = useState<string | File | null>(user.avatar);
    const [banner, setBanner] = useState<string | File | null>(user.banner);
    const [displayName, setDisplayName] = useState(user.displayName);
    const [bannerColor, setBannerColor] = useState(user.bannerColor);
    const [accentColor, setAccentColor] = useState(user.accentColor);
    const [description, setDescription] = useState(user.description);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLInputElement>(null);

    const [avatarId, setAvatarId] = useState<string | null>(null);
    const [bannerId, setBannerId] = useState<string | null>(null);

    const { startUpload: uploadAvatar } = useUploadThing("imageUploader", {
        onClientUploadComplete: (files) => {
            const { key: fileId } = files[0];
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

    function resetState() {
        if (!user) return;

        setAvatar(user.avatar);
        setBanner(user.banner);
        setDisplayName(user.displayName);
        setBannerColor(user.bannerColor);
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
        bannerColor !== user.bannerColor ||
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
                    bannerColor: bannerColor !== user.bannerColor ? bannerColor : undefined,
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

    async function handleFileChange(
        e: React.ChangeEvent<HTMLInputElement> & { target: { files: FileList | null } },
        type: "avatar" | "banner"
    ) {
        const file = e.target.files ? e.target.files[0] : null;
        if (!file) return (e.target.value = "");

        // Run checks
        const maxFileSize = 1024 * 1024 * 4; // 4MB
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

        if (type === "avatar") {
            setFileType("avatar");
        } else {
            setFileType("banner");
        }

        setFileTemp(newFile);

        e.target.value = "";
    }

    async function handleCrop(canvas: HTMLCanvasElement) {
        if (!fileTemp) return;

        const blob = await new Promise<Blob>((resolve) =>
            canvas.toBlob((blob) => resolve(blob as any))
        );

        const newFile = new File([blob], "image", {
            type: fileTemp.type,
        });

        if (fileType === "avatar") {
            setAvatar(newFile);
        } else {
            setBanner(newFile);
        }

        setFileTemp(null);
    }

    return (
        <div>
            {(errors.avatar || errors.banner) && (
                <Alert
                    type="danger"
                    message={errors.avatar || errors.banner}
                />
            )}

            {fileTemp && (
                <Dialog
                    open={!!fileTemp}
                    onOpenChange={(v) => !v && setFileTemp(null)}
                >
                    <DialogContent
                        width={600}
                        leftLabel="Skip"
                        heading="Edit Image"
                        confirmLabel="Apply"
                        leftConfirm={() => {
                            if (fileType === "avatar") {
                                setAvatar(fileTemp);
                            } else {
                                setBanner(fileTemp);
                            }

                            setFileTemp(null);
                        }}
                        onConfirm={() => {
                            if (cropper) {
                                handleCrop(cropper.getCroppedCanvas());
                            }
                        }}
                    >
                        <ImageCropper
                            setCropper={setCropper}
                            src={URL.createObjectURL(fileTemp)}
                            aspectRatio={fileType === "avatar" ? 1 : 3}
                            alt={fileType === "avatar" ? "Crop Avatar" : "Crop Banner"}
                        />
                    </DialogContent>
                </Dialog>
            )}

            <input
                type="file"
                tabIndex={-1}
                ref={avatarInputRef}
                className={styles.hiddenInput}
                onChange={(e) => handleFileChange(e, "avatar")}
                accept="image/png,image/jpeg,image/gif,image/apng,image/webp"
            />

            <input
                type="file"
                tabIndex={-1}
                ref={bannerInputRef}
                className={styles.hiddenInput}
                onChange={(e) => handleFileChange(e, "banner")}
                accept="image/png, image/jpeg, image/gif, image/apng, image/webp"
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
                        <label className={styles.label}>Display Name</label>

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
                        <h3 className={styles.label}>Avatar</h3>

                        <div className={styles.buttonContainer}>
                            <button
                                onClick={() => avatarInputRef.current?.click()}
                                className="button blue"
                            >
                                Change Avatar
                            </button>

                            {avatar && (
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
                        <h3 className={styles.label}>Profile Banner</h3>

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
                        <label className={styles.label}>Profile Theme</label>

                        <div className={styles.sectionContainer}>
                            {!banner && (
                                <div className={styles.colorSwatch}>
                                    <Popover placement="right-start">
                                        <PopoverTrigger>
                                            <div>
                                                <InteractiveElement
                                                    element="div"
                                                    style={{
                                                        borderColor: bannerColor,
                                                        backgroundColor: bannerColor,
                                                    }}
                                                >
                                                    <Icon
                                                        size={14}
                                                        name="edit"
                                                    />
                                                </InteractiveElement>
                                            </div>
                                        </PopoverTrigger>

                                        <PopoverContent>
                                            <ColorPicker
                                                initColor={bannerColor}
                                                onColorChange={(color) => setBannerColor(color)}
                                            />
                                        </PopoverContent>
                                    </Popover>

                                    <div>Banner</div>
                                </div>
                            )}

                            <div className={styles.colorSwatch}>
                                <Popover placement="right-start">
                                    <PopoverTrigger>
                                        <div>
                                            <InteractiveElement
                                                element="div"
                                                style={{
                                                    backgroundColor: accentColor,
                                                    borderColor:
                                                        accentColor || "var(--border-light)",
                                                }}
                                            >
                                                <Icon
                                                    size={14}
                                                    name={accentColor ? "edit" : "add"}
                                                />
                                            </InteractiveElement>
                                        </div>
                                    </PopoverTrigger>

                                    <PopoverContent>
                                        <ColorPicker
                                            initColor={accentColor}
                                            onColorChange={(color) => setAccentColor(color)}
                                        />
                                    </PopoverContent>
                                </Popover>

                                <div>Accent</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.customSection}>
                        <label className={styles.label}>About me</label>

                        <div className={styles.description}>
                            You can use markdown and links if you'd like
                        </div>

                        <div
                            className={styles.inputLarge}
                            id="description"
                        >
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
                                            focus-id="description"
                                            onDragStart={() => false}
                                            onDrop={() => false}
                                            onInput={(e) => {
                                                const input = e.target as HTMLDivElement;
                                                const text = input.innerText.toString();
                                                setDescription(text === "" ? null : text);
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
                    <h3 className={styles.label}>Preview</h3>

                    <UserCard
                        mode="edit"
                        initUser={{
                            ...user,
                            displayName,
                            avatar,
                            banner,
                            bannerColor,
                            accentColor,
                            description,
                        }}
                        onAvatarClick={() => avatarInputRef.current?.click()}
                        onBannerClick={() => bannerInputRef.current?.click()}
                    />
                </div>
            </div>

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
                            {errors.server ? errors.server : "Careful — you have unsaved changes!"}
                        </p>

                        <div>
                            <button
                                type="button"
                                className="button underline"
                                onClick={() => resetState()}
                            >
                                Reset
                            </button>

                            <Tooltip
                                show={(description?.length || 0) > 190 || displayName.length < 2}
                            >
                                <TooltipTrigger>
                                    <button
                                        type="button"
                                        className={
                                            (description?.length || 0) > 190 ||
                                            displayName.length < 2
                                                ? "button green disabled"
                                                : "button green"
                                        }
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            if (
                                                (description?.length || 0) <= 190 &&
                                                displayName.length >= 2
                                            ) {
                                                saveUser();
                                            }
                                        }}
                                    >
                                        {isLoading ? <LoadingDots /> : "Save Changes"}
                                    </button>
                                </TooltipTrigger>

                                <TooltipContent>
                                    {displayName.length < 2
                                        ? "Display name must be at least 2 characters long"
                                        : "About me is too long"}
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
