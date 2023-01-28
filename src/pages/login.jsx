import { useRef, useState, useEffect } from "react";
import axios from "../api/axios";
import useUserData from "../hooks/useUserData";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../styles/Auth.module.css";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";

const Login = () => {
    const { auth, setAuth } = useUserData();
    const router = useRouter();

    const uidInputRef = useRef();
    const passwordInputRef = useRef();

    const [uid, setUID] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (auth?.accessToken) router.push("/channels/@me");
        uidInputRef.current.focus();
    }, [auth]);

    useEffect(() => {
        setError("");
    }, [uid, password]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "/auth/login",
                JSON.stringify({ uid, password }),
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );
            setAuth({
                accessToken: response.data.accessToken,
                user: response.data.user,
            });
            setUsername("");
            setPassword("");
            router.push("/channels/@me");
        } catch (err) {
            if (!err?.response) setError("No Server Response");
            else setError(err.response.data.error);
            console.log(err.response.data.message);
        }
    };

    return (
        <>
            <Head>
                <title>Discord | Login</title>
            </Head>

            <div className={styles.wrapper}>
                <motion.form
                    onSubmit={handleSubmit}
                >
                    <div className={styles.loginContainer}>
                        <div className={styles.header}>
                            <h1>Welcome back!</h1>
                            <div>We're so excited to see you again!</div>
                        </div>
                        <div className={styles.loginBlock}>
                            <div>
                                <label
                                    htmlFor="uid"
                                    style={{
                                        color: error.length
                                            ? "var(--error-2)"
                                            : "var(--foreground-3)",
                                    }}
                                >
                                    Username
                                    {error.length ? (
                                        <span className={styles.errorLabel}>
                                            - {error}
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
                                        required
                                        autoCapitalize="off"
                                        autoComplete="off"
                                        autoCorrect="off"
                                        maxLength={32}
                                        minLength={4}
                                        spellCheck="false"
                                        aria-labelledby="uid"
                                        aria-describedby="uid"
                                        value={uid}
                                        onChange={(e) => setUID(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label
                                    htmlFor="password"
                                    style={{
                                        color: error.length
                                            ? "var(--error-2)"
                                            : "var(--foreground-3)",
                                    }}
                                >
                                    Password
                                    {error.length ? (
                                        <span className={styles.errorLabel}>
                                            - {error}
                                        </span>
                                    ) : (
                                        <span>*</span>
                                    )}
                                </label>
                                <div className={styles.inputContainer}>
                                    <input
                                        ref={passwordInputRef}
                                        id="password"
                                        type="password"
                                        name="password"
                                        aria-label="Password"
                                        required
                                        autoCapitalize="off"
                                        autoComplete="off"
                                        autoCorrect="off"
                                        maxLength={256}
                                        minLength={8}
                                        spellCheck="false"
                                        aria-labelledby="password"
                                        aria-describedby="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button>Forgot your password?</button>
                            <button type="submit">
                                <div>Log In</div>
                            </button>

                            <div>
                                <span>Need an account?</span>
                                <button>Register</button>
                            </div>
                        </div>
                    </div>
                </motion.form>
            </div>
            {/* <motion.main
                className={styles.main}
                initial={{
                    opacity: 0,
                    scale: 0.5,
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                }}
                exit={{
                    opacity: 0,
                    scale: 0.5,
                }}
                transition={{
                    duration: 0.5,
                    ease: "backInOut",
                }}
            >
                <form onSubmit={handleSubmit} className={styles.form}>
                    <h2 className={styles.formTitle}>Login</h2>

                    <div className={styles.inputsContainer}>
                        <div className={styles.inputContainer}>
                            <AnimatePresence>
                                <motion.label
                                    htmlFor="username"
                                    className={styles.label}
                                    animate={{
                                        opacity:
                                            usernameFocus || username ? 1 : 0.5,
                                        top:
                                            usernameFocus || username
                                                ? "-40%"
                                                : "50%",
                                        left:
                                            usernameFocus || username
                                                ? "5px"
                                                : "15px",
                                        transform:
                                            usernameFocus || username
                                                ? "translateY(0%)"
                                                : "translateY(-50%)",
                                    }}
                                    transition={{
                                        duration: 0.2,
                                        ease: "easeInOut",
                                    }}
                                >
                                    Username
                                </motion.label>
                            </AnimatePresence>
                            <input
                                type="text"
                                id="username"
                                ref={usernameRef}
                                autoComplete="off"
                                onChange={(e) => setUsername(e.target.value)}
                                value={username}
                                required
                                aria-describedby="uidnote"
                                onFocus={() => setUsernameFocus(true)}
                                onBlur={() => setUsernameFocus(false)}
                                className={styles.input}
                                placeholder={usernameFocus ? "Username" : ""}
                            />
                            {errorMessage && (
                                <div className={styles.error}>
                                    {errorMessage}
                                </div>
                            )}
                        </div>

                        <div className={styles.inputContainer}>
                            <AnimatePresence>
                                <motion.label
                                    htmlFor="password"
                                    className={styles.label}
                                    animate={{
                                        opacity:
                                            passwordFocus || password ? 1 : 0.5,
                                        top:
                                            passwordFocus || password
                                                ? "-40%"
                                                : "50%",
                                        left:
                                            passwordFocus || password
                                                ? "5px"
                                                : "15px",
                                        transform:
                                            passwordFocus || password
                                                ? "translateY(0%)"
                                                : "translateY(-50%)",
                                    }}
                                    transition={{
                                        duration: 0.2,
                                        ease: "easeInOut",
                                    }}
                                >
                                    Password
                                </motion.label>
                            </AnimatePresence>
                            <input
                                type="password"
                                id="password"
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                required
                                aria-describedby="passwordnote"
                                onFocus={() => setPasswordFocus(true)}
                                onBlur={() => setPasswordFocus(false)}
                                className={styles.input}
                                placeholder={passwordFocus ? "Password" : ""}
                            />
                        </div>

                        <button className={styles.button}>Login</button>
                    </div>

                    <div className={styles.bottomLinks}>
                        <Link href="/register" className={styles.link}>
                            Don't have an account?
                        </Link>

                        <Link href="/" className={styles.link}>
                            Go back home
                        </Link>
                    </div>
                </form>
            </motion.main> */}
        </>
    );
};

export default Login;
