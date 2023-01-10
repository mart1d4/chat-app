import { useRef, useState, useEffect } from "react";
import axios from "../api/axios";
import useAuth from "../hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../styles/Auth.module.css";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";

const Login = () => {
    const { auth, setAuth } = useAuth();
    const router = useRouter();

    const usernameRef = useRef();
    const errorRef = useRef();

    const [usernameFocus, setUsernameFocus] = useState(false);
    const [passwordFocus, setPasswordFocus] = useState(false);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (auth?.accessToken) router.push("/app");
        usernameRef.current.focus();
    }, []);

    useEffect(() => {
        setErrorMessage("");
    }, [username, password]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "/auth/login",
                JSON.stringify({ username, password }),
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
            router.push("/app");
        } catch (err) {
            if (!err?.response) {
                setErrorMessage("No Server Response");
            } else if (err.response?.status === 400) {
                setErrorMessage("Missing Username or Password");
            } else if (err.response?.status === 401) {
                setErrorMessage("Unauthorized");
            } else {
                setErrorMessage("Login Failed");
            }
            errorRef?.current?.focus();
        }
    };

    return (
        <>
            <Head>
                <title>Unthrust | Login</title>
            </Head>
            <motion.main
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
                <AnimatePresence>
                    {errorMessage && (
                        <motion.div
                            ref={errorRef}
                            className={styles.error}
                            initial={{
                                opacity: 0,
                                transform: "translateX(-50%) scale(0.5)",
                            }}
                            animate={{
                                opacity: 1,
                                transform: "translateX(-50%) scale(1)",
                            }}
                            exit={{
                                opacity: 0,
                                transform: "translateX(-50%) scale(0.5)",
                            }}
                            transition={{
                                duration: 0.2,
                                ease: "easeInOut",
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                            >
                                <circle cx="12" cy="12" r="9" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <p aria-live="assertive">{errorMessage}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

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
            </motion.main>
        </>
    );
};

export default Login;
