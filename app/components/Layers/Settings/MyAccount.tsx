import styles from "./Settings.module.css";
import {
    TooltipContent,
    TooltipTrigger,
    DialogContent,
    DialogTrigger,
    Tooltip,
    Dialog,
    Avatar,
    Input,
    Alert,
} from "@components";
import useFetchHelper from "@/hooks/useFetchHelper";
import { getCdnUrl } from "@/lib/uploadthing";
import { useState } from "react";
import { useData } from "@/store";

const defaultTooltip = {
    text: "Copy user ID",
    color: "var(--background-dark-1)",
};

export function MyAccount({ setActiveTab }: any) {
    const setUser = useData((state) => state.setUser);
    const user = useData((state) => state.user);
    const { sendRequest } = useFetchHelper();

    const [tooltip, setTooltip] = useState(defaultTooltip);

    const [confirmPassword, setConfirmPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [password, setPassword] = useState("");

    const [username, setUsername] = useState(user?.username);

    const [verificationLinkSent, setVerificationLinkSent] = useState(false);
    const [verificationCodeSent, setVerificationCodeSent] = useState(false);
    const [revealEmail, setRevealEmail] = useState(false);
    const [emailToken, setEmailToken] = useState("");
    const [emailCode, setEmailCode] = useState("");
    const [email, setEmail] = useState("");

    const [revealPhone, setRevealPhone] = useState(false);
    const [phone, setPhone] = useState("");

    const [errors, setErrors] = useState<{
        [key: string]: string;
    }>({});
    const [loading, setLoading] = useState<{
        [key: string]: boolean;
    }>({});

    if (!user) return null;

    async function copyToClipboard() {
        if (!user) return;

        try {
            await navigator.clipboard.writeText(user.id);

            setTooltip({
                text: "Copied to clipboard",
                color: "var(--success-light)",
            });
        } catch (err) {
            setTooltip({
                text: "Failed to copy to clipboard",
                color: "var(--error-1)",
            });
        }

        setTimeout(() => {
            setTooltip(defaultTooltip);
        }, 5000);
    }

    async function handlePasswordChange() {
        if (!newPassword) {
            return setErrors({ newPassword: "Your new password cannot be empty." });
        } else if (newPassword.length < 6) {
            return setErrors({ newPassword: "Must be 6 or more in length." });
        } else if (newPassword.length > 72) {
            return setErrors({ newPassword: "Must be 72 or fewer in length." });
        }

        if (newPassword !== confirmPassword) {
            return setErrors({ confirmPassword: "Passwords do not match!" });
        }

        if (!password) {
            return setErrors({ password: "Your current password cannot be empty." });
        }

        setLoading({ password: true });

        try {
            const { data, errors } = await sendRequest({
                query: "UPDATE_USER",
                body: {
                    password,
                    newPassword,
                },
            });

            if (data) {
                setPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setErrors({});
                document.getElementById("change-password")?.click();
            } else if (errors) {
                setErrors(errors);
            }
        } catch (err) {
            console.error(err);
        }

        setLoading({ password: false });
    }

    async function handleUsernameChange() {
        if (!username) {
            return setErrors({ username: "Your new username cannot be empty." });
        } else if (username.length < 2) {
            return setErrors({ username: "Must be 2 or more in length." });
        } else if (username.length > 32) {
            return setErrors({ username: "Must be 32 or fewer in length." });
        } else if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
            return setErrors({
                username: "Must only contain numbers, letters, underscores, or periods.",
            });
        } else if (username === user!.username) {
            return setErrors({ username: "You already have that username." });
        }

        if (!password) {
            return setErrors({ password: "Your current password cannot be empty." });
        }

        setLoading({ username: true });

        try {
            const { data, errors } = await sendRequest({
                query: "UPDATE_USER",
                body: {
                    password,
                    username,
                },
            });

            if (data) {
                setUser({ ...user, username });
                setPassword("");
                setErrors({});
                document.getElementById("change-username")?.click();
            } else if (errors) {
                setErrors(errors);
            }
        } catch (err) {
            console.error(err);
        }

        setLoading({ username: false });
    }

    async function sendEmailVerificationCode(alertOnSuccess = false) {
        if (loading.email) return;
        setLoading({ email: true });

        try {
            const { data, errors } = await sendRequest({
                query: "GET_EMAIL_VERIFICATION_CODE",
            });

            if (data) {
                setVerificationCodeSent(true);

                if (alertOnSuccess) {
                    setErrors({ server: "Verification code sent." });
                }
            } else if (errors) {
                setErrors(errors);
            }
        } catch (err) {
            console.error(err);
            setErrors({ server: "Failed to send verification code." });
        }

        setLoading({ email: false });
    }

    async function verifyEmailCode() {
        if (loading.email) return;
        setLoading({ email: true });

        try {
            const { data, errors } = await sendRequest({
                query: "VERIFY_EMAIL_CODE",
                body: {
                    code: emailCode,
                },
            });

            if (data?.token) {
                setEmailCode("");
                setEmailToken(data.token);
            } else if (errors) setErrors(errors);
        } catch (err) {
            console.error(err);
            setErrors({ email: "Failed to verify code." });
        }

        setLoading({ email: false });
    }

    async function updateEmail() {
        if (loading.email) return;
        setLoading({ email: true });

        if (!email) {
            setErrors({ email: "Your new email cannot be empty." });
            setLoading({ email: false });
            return;
        }

        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            setErrors({ email: "Invalid email address." });
            setLoading({ email: false });
            return;
        }

        if (!password) {
            setErrors({ password: "Your current password cannot be empty." });
            setLoading({ email: false });
            return;
        }

        try {
            const { data, errors } = await sendRequest({
                query: "UPDATE_USER",
                body: {
                    email,
                    password,
                    emailToken,
                },
            });

            if (data) {
                setPassword("");
                setEmailToken("");
                setErrors({});
                setVerificationLinkSent(true);
            } else if (errors) {
                setErrors(errors);
            }
        } catch (err) {
            console.error(err);
            setErrors({ email: "Failed to update email." });
        }

        setLoading({ email: false });
    }

    const askForNewEmail = (!user.email || emailToken) && !verificationLinkSent;
    const askForEmailCode = !!user.email && !verificationLinkSent && verificationCodeSent;

    return (
        <>
            <div>
                {errors.server && (
                    <Alert
                        type="danger"
                        message={errors.server}
                    />
                )}

                <div className={styles.sectionTitle}>
                    <h2>My Account</h2>
                </div>

                <div className={styles.userCard}>
                    <div
                        className={styles.userCardHeader}
                        style={{
                            backgroundColor: !user.banner ? user.primaryColor : "",
                            backgroundImage: user.banner
                                ? `url(${getCdnUrl()}/${user.banner})`
                                : "",
                        }}
                    />

                    <div className={styles.userCardInfo}>
                        <div className={styles.userAvatar}>
                            <Avatar
                                src={user.avatar}
                                alt={user.username}
                                size={80}
                                status={user.status}
                            />
                        </div>

                        <Tooltip background={tooltip.color}>
                            <TooltipTrigger>
                                <div
                                    className={styles.username}
                                    onClick={() => copyToClipboard()}
                                >
                                    {user.username}
                                </div>
                            </TooltipTrigger>

                            <TooltipContent>{tooltip.text}</TooltipContent>
                        </Tooltip>

                        <button
                            className="button blue"
                            onClick={() => setActiveTab("Profiles")}
                        >
                            Edit User Profile
                        </button>
                    </div>

                    <div>
                        <div className={styles.field}>
                            <div>
                                <h3>Username</h3>
                                <div>{user.username}</div>
                            </div>

                            <Dialog>
                                <DialogTrigger>
                                    <button
                                        id="change-username"
                                        className="button grey"
                                    >
                                        Edit
                                    </button>
                                </DialogTrigger>

                                <DialogContent
                                    heading="Change your username"
                                    description="Enter a new username and your existing password."
                                    confirmLabel="Done"
                                    confirmLoading={loading.username}
                                    onConfirm={handleUsernameChange}
                                >
                                    <Input
                                        type="text"
                                        label="Username"
                                        name="new-username"
                                        value={username}
                                        onChange={(e) => {
                                            setUsername(e);
                                            setErrors({ ...errors, username: "" });
                                        }}
                                        error={errors.username}
                                        description="Please only use numbers, letters, underscores _ , or periods."
                                    />

                                    <Input
                                        type="password"
                                        label="Password"
                                        name="password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e);
                                            setErrors({ ...errors, password: "" });
                                        }}
                                        error={errors.password}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className={styles.field}>
                            <div>
                                <h3>Email</h3>
                                <div>
                                    {user.email
                                        ? revealEmail
                                            ? user.email
                                            : "*".repeat(user.email.indexOf("@")) +
                                              user.email.slice(user.email.indexOf("@"))
                                        : "You haven't added an email yet."}

                                    {user.email && (
                                        <button
                                            className={styles.reveal}
                                            onClick={() => setRevealEmail((prev) => !prev)}
                                        >
                                            {revealEmail ? "Hide" : "Reveal"}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <Dialog>
                                <DialogTrigger>
                                    <button
                                        className="button grey"
                                        id="change-email"
                                    >
                                        {!!user.email ? "Edit" : "Add"}
                                    </button>
                                </DialogTrigger>

                                <DialogContent
                                    centered
                                    contentCentered
                                    heading={
                                        askForNewEmail
                                            ? "Enter an email address"
                                            : askForEmailCode
                                            ? "Enter code"
                                            : verificationLinkSent
                                            ? "Confirm your new email"
                                            : "Verify email address"
                                    }
                                    headingIcon="stamp"
                                    confirmLabel={
                                        askForNewEmail
                                            ? "Done"
                                            : askForEmailCode
                                            ? "Next"
                                            : verificationLinkSent
                                            ? "Okay"
                                            : "Send Verification Code"
                                    }
                                    confirmLoading={loading.email}
                                    description={
                                        askForEmailCode
                                            ? "Check your email: we sent you a verification code. Enter it here to verify you're really you."
                                            : askForNewEmail
                                            ? "Enter a new email address and your existing password."
                                            : undefined
                                    }
                                    hideCancel={
                                        verificationLinkSent || (user.email && verificationCodeSent)
                                    }
                                    onConfirm={() => {
                                        if (askForNewEmail) {
                                            updateEmail();
                                        } else if (askForEmailCode) {
                                            verifyEmailCode();
                                        } else if (user.email && !verificationCodeSent) {
                                            sendEmailVerificationCode();
                                        } else {
                                            document.getElementById("change-email")?.click();
                                        }
                                    }}
                                    onCancel={() => {
                                        if (askForNewEmail) {
                                            if (user.email) {
                                                setVerificationCodeSent(false);
                                                setEmailCode("");
                                                setEmailToken("");
                                            }
                                        } else if (askForEmailCode) {
                                            setVerificationCodeSent(false);
                                            setEmailCode("");
                                        } else if (verificationLinkSent) {
                                            setVerificationCodeSent(false);
                                            setVerificationLinkSent(false);
                                        }
                                    }}
                                >
                                    {askForNewEmail ? (
                                        <>
                                            <Input
                                                type="email"
                                                label="Email"
                                                value={email}
                                                error={errors.email}
                                                onChange={(e) => {
                                                    setEmail(e);
                                                    setErrors({ ...errors, email: "" });
                                                }}
                                            />

                                            <Input
                                                type="password"
                                                label="Current Password"
                                                value={password}
                                                error={errors.password}
                                                onChange={(e) => {
                                                    setPassword(e);
                                                    setErrors({ ...errors, password: "" });
                                                }}
                                            />
                                        </>
                                    ) : verificationLinkSent ? (
                                        <>
                                            <p>
                                                To finish, we sent a verification email to:
                                                <br />
                                                <strong className={styles.email}>{email}</strong>
                                            </p>

                                            <div className={styles.checkSpam}>
                                                <p>
                                                    Didn't get the email? Make sure to check your
                                                    spam folder.
                                                </p>
                                            </div>
                                        </>
                                    ) : askForEmailCode ? (
                                        <div>
                                            <Input
                                                type="text"
                                                label="Verification Code"
                                                value={emailCode}
                                                error={errors.code}
                                                onChange={(e) => setEmailCode(e)}
                                            />

                                            <button
                                                type="button"
                                                className={styles.resendCode}
                                                onClick={() => sendEmailVerificationCode(true)}
                                            >
                                                Didn't receive a code or it expried? Resend it.
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <p>
                                                We'll need to verify your old email address,
                                                <br />
                                                <strong className={styles.email}>
                                                    {user.email}
                                                </strong>
                                                , in order to change it.
                                            </p>

                                            <p style={{ marginBottom: "16px" }}>
                                                Lost access to your email? Please contact your email
                                                provider to regain access.
                                            </p>
                                        </>
                                    )}
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className={styles.field}>
                            <div>
                                <h3>Phone number</h3>
                                <div>
                                    {user.phone
                                        ? "**********"
                                        : "You haven't added a phone number yet."}
                                </div>
                            </div>

                            <button className="button grey">{!!user.phone ? "Edit" : "Add"}</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.divider} />

            <section className={styles.section}>
                <div className={styles.sectionTitle}>
                    <h2>Password and Authentication</h2>
                </div>

                <Dialog>
                    <DialogTrigger>
                        <button
                            id="change-password"
                            className="button blue"
                            style={{ marginBottom: "28px" }}
                        >
                            Change Password
                        </button>
                    </DialogTrigger>

                    <DialogContent
                        centered
                        heading="Update your password"
                        description="Enter your current password and a new password."
                        confirmLabel="Done"
                        confirmLoading={loading.password}
                        onConfirm={handlePasswordChange}
                    >
                        <Input
                            type="password"
                            label="Current Password"
                            value={password}
                            error={errors.password}
                            onChange={(e) => {
                                setPassword(e);
                                setErrors({ ...errors, password: "" });
                            }}
                        />

                        <Input
                            type="password"
                            label="New Password"
                            value={newPassword}
                            error={errors.newPassword}
                            onChange={(e) => {
                                setNewPassword(e);
                                setErrors({ ...errors, newPassword: "" });
                            }}
                        />

                        <Input
                            type="password"
                            label="Confirm New Password"
                            value={confirmPassword}
                            error={errors.confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e);
                                setErrors({ ...errors, confirmPassword: "" });
                            }}
                        />
                    </DialogContent>
                </Dialog>

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
