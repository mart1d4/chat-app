import { useRef, useState, useEffect } from "react";
import axios from "../api/axios";
import useAuth from "../hooks/useAuth";
import { useRouter } from "next/router";
import styles from "../styles/Auth.module.css";
import Head from "next/head";

const USER_REGEX = /^.{2,32}$/;
const PWD_REGEX = /^.{8,256}$/;

const Register = () => {
    const { auth } = useAuth();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordMatch, setPasswordMatch] = useState("");

    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const uidInputRef = useRef();

    // useEffect(() => {
    //     if (auth?.accessToken) router.push("/channels/@me");
    // }, [auth]);

    useEffect(() => {
        uidInputRef.current.focus();
    }, []);

    useEffect(() => {
        setUsernameError("");
    }, [username]);

    useEffect(() => {
        setPasswordError("");
    }, [password, passwordMatch]);

    useEffect(() => {
        uidInputRef.current.focus();
    }, [usernameError]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLoading) return;
        setIsLoading(true);

        const v1 = USER_REGEX.test(username);
        const v2 = PWD_REGEX.test(password);

        if (!v1) {
            setUsernameError("Invalid Username");
            setIsLoading(false);
        }
        if (!v2) {
            setPasswordError("Invalid Password");
            setIsLoading(false);
        }
        if (!v1 || !v2) return;

        if (password !== passwordMatch) {
            setPasswordError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            await axios.post(
                "/auth/register",
                { username: username, password: password },
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );
            setUsername("");
            setPassword("");
            setPasswordMatch("");
            setIsLoading(false);
            router.push("/login");
        } catch (err) {
            if (!err?.response) {
                setUsernameError("No Server Response");
                setPasswordError("No Server Response");
            } else if (err.response?.status === 422) {
                setUsernameError("Username Taken");
            } else if (err.response?.status === 500) {
                setUsernameError("Server Error");
                setPasswordError("Server Error");
            } else {
                setUsernameError("Unknown Error");
                setPasswordError("Unknown Error");
            }
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Unthrust | Register</title>
            </Head>

            <div className={styles.wrapper + " " + styles.wrapperRegister}>
                <img
                    src="/assets/auth-background.svg"
                    alt=""
                    draggable="false"
                />

                <form>
                    <div className={styles.loginContainer}>
                        <div className={styles.header}>
                            <h1>Create an account</h1>
                        </div>
                        <div className={styles.loginBlock}>
                            <div>
                                <label
                                    htmlFor="uid"
                                    style={{
                                        color: usernameError.length
                                            ? "var(--error-light)"
                                            : "var(--foreground-3)",
                                    }}
                                >
                                    Username
                                    {usernameError.length ? (
                                        <span className={styles.errorLabel}>
                                            - {usernameError}
                                        </span>
                                    ) : (
                                        <span>*</span>
                                    )}
                                </label>
                                <div className={styles.inputContainer}>
                                    <input
                                        ref={uidInputRef}
                                        id="uid"
                                        type="text"
                                        name="username"
                                        aria-label="Username"
                                        autoCapitalize="off"
                                        autoComplete="off"
                                        autoCorrect="off"
                                        minLength={2}
                                        maxLength={32}
                                        spellCheck="false"
                                        aria-labelledby="uid"
                                        aria-describedby="uid"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    style={{
                                        color: passwordError.length
                                            ? "var(--error-light)"
                                            : "var(--foreground-3)",
                                    }}
                                >
                                    Password
                                    {passwordError.length ? (
                                        <span className={styles.errorLabel}>
                                            - {passwordError}
                                        </span>
                                    ) : (
                                        <span>*</span>
                                    )}
                                </label>
                                <div className={styles.inputContainer}>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        aria-label="Password"
                                        autoCapitalize="off"
                                        autoComplete="off"
                                        autoCorrect="off"
                                        maxLength={256}
                                        spellCheck="false"
                                        aria-labelledby="password"
                                        aria-describedby="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="password-match"
                                    style={{
                                        color: passwordError.length
                                            ? "var(--error-light)"
                                            : "var(--foreground-3)",
                                    }}
                                >
                                    Password Match
                                    {passwordError.length ? (
                                        <span className={styles.errorLabel}>
                                            - {passwordError}
                                        </span>
                                    ) : (
                                        <span>*</span>
                                    )}
                                </label>
                                <div className={styles.inputContainer}>
                                    <input
                                        id="password-match"
                                        type="password"
                                        name="password-match"
                                        aria-label="Password Match"
                                        autoCapitalize="off"
                                        autoComplete="off"
                                        autoCorrect="off"
                                        maxLength={256}
                                        spellCheck="false"
                                        aria-labelledby="password-match"
                                        aria-describedby="password-match"
                                        value={passwordMatch}
                                        onChange={(e) => setPasswordMatch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={styles.buttonSubmit}
                                onClick={handleSubmit}
                            >
                                <div className={isLoading ? styles.loading : ""}>
                                    {!isLoading && "Register"}
                                </div>
                            </button>

                            <div className={styles.bottomText}>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        router.push("/login");
                                    }}
                                >
                                    Already have an account?
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default Register;
