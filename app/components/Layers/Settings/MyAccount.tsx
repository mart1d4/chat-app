import { useData, useLayers } from "@/store";
import styles from "./Settings.module.css";
import { useState, useRef } from "react";
import { Avatar } from "@components";

export function MyAccount({ setActiveTab }: any) {
    return null;
    const [showTooltip, setShowTooltip] = useState(false);

    const setLayers = useLayers((state) => state.setLayers);
    const user = useData((state) => state.user);

    const usernameRef = useRef<HTMLDivElement>(null);

    async function copyToClipboard() {
        if (!usernameRef.current) return;

        try {
            await navigator.clipboard.writeText(user.id);

            setShowTooltip(true);
            setTooltip({
                text: "Copied to clipboard",
                element: usernameRef.current,
                color: "var(--success-light)",
            });
        } catch (err) {
            setShowTooltip(true);
            setTooltip({
                text: "Failed to copy to clipboard",
                element: usernameRef.current,
                color: "var(--error-1)",
            });
        }

        setTimeout(() => {
            setTooltip(null);
            setShowTooltip(false);
        }, 5000);
    }

    const fields = [
        {
            title: "Username",
            value: user.username,
            edit: true,
            func: () => {
                setLayers({
                    settings: {
                        type: "POPUP",
                    },
                    content: {
                        type: "UPDATE_USERNAME",
                    },
                });
            },
        },
        {
            title: "Email",
            value: user.email ?? "You haven't added an email yet.",
            edit: !!user.email,
        },
        {
            title: "Phone Number",
            value: user.phone || "You haven't added a phone number yet.",
            edit: !!user.phone,
        },
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
                        style={{
                            backgroundColor: !user.banner ? user.primaryColor : "",
                            backgroundImage: user.banner
                                ? `url(${process.env.NEXT_PUBLIC_CDN_URL}${user.banner}/-/format/webp/)`
                                : "",
                        }}
                    />

                    <div className={styles.userCardInfo}>
                        <div className={styles.userAvatar}>
                            <Avatar
                                src={user.avatar}
                                alt={user.username}
                                type="avatars"
                                size={80}
                                status={user.status}
                            />
                        </div>

                        <div
                            ref={usernameRef}
                            className={styles.username}
                            onMouseEnter={(e) => {
                                if (showTooltip) return;
                                setTooltip({
                                    text: "Copy user ID",
                                    element: e.currentTarget,
                                });
                            }}
                            onMouseLeave={() => {
                                if (showTooltip) return;
                                setTooltip(null);
                            }}
                            onClick={() => copyToClipboard()}
                        >
                            {user.username}
                        </div>

                        <button
                            className="button blue"
                            onClick={() => setActiveTab("Profiles")}
                        >
                            Edit User Profile
                        </button>
                    </div>

                    <div>
                        {fields.map((field) => (
                            <div
                                className={styles.field}
                                key={field.title}
                            >
                                <div>
                                    <h3>{field.title}</h3>
                                    <div>{field.value}</div>
                                </div>

                                <button
                                    className="button grey"
                                    onClick={() => field.func && field.func()}
                                >
                                    {field.edit ? "Edit" : "Add"}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.divider} />

            <section className={styles.section}>
                <div className={styles.sectionTitle}>
                    <h2>Password and Authentication</h2>
                </div>

                <button
                    className="button blue"
                    style={{ marginBottom: "28px" }}
                    onClick={() => {
                        setLayers({
                            settings: {
                                type: "POPUP",
                            },
                            content: {
                                type: "UPDATE_PASSWORD",
                            },
                        });
                    }}
                >
                    Change Password
                </button>

                <h3>Authenticator App</h3>
                <div className={styles.content}>
                    <div>
                        Protect your account with an extra layer of security. Once configured,
                        you'll be required to enter your password and complete one additional step
                        in order to sign in.
                    </div>

                    <div className={styles.buttonsContainer}>
                        <button className="button blue disabled">Enable Authenticator App</button>
                    </div>
                </div>

                <h3>Security keys</h3>
                <div className={styles.content}>
                    <div>
                        Add an additional layer of protection to your account with a Security Key.
                    </div>

                    <div className={styles.buttonsContainer}>
                        <button className="button blue disabled">Register a Security Key</button>
                    </div>
                </div>

                {user.phone && (
                    <>
                        <h3>SMS Backup Authentication</h3>
                        <div className={styles.content}>
                            <div>
                                Add your phone as a backup 2FA method in case you lose your
                                authentication app or backup codes. Your current phone number is
                                0001.
                            </div>

                            <div className={styles.buttonsContainer}>
                                <button className="button blue">Enable SMS Authentication</button>

                                <button className="button underline">Change phone number</button>
                            </div>
                        </div>
                    </>
                )}
            </section>

            <div className={styles.divider} />

            <section className={styles.section}>
                <div className={styles.sectionTitle}>
                    <h3>Account Removal</h3>
                </div>

                <div className={styles.content}>
                    <div>
                        Deleting your account will remove all of your data from our servers. This
                        action is irreversible.
                    </div>

                    <button className="button red">Delete Account</button>
                </div>
            </section>
        </>
    );
}
