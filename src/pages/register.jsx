import { useRef, useState, useEffect } from "react";
import axios from "../api/axios";
import useUserData from "../hooks/useUserData";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../styles/Auth.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "../components";
import Head from "next/head";

const USER_REGEX = /^.{1,32}$/;
const PWD_REGEX = /^.{8,256}$/;

const Register = () => {
    const { auth } = useUserData();
    const router = useRouter();

    const usernameRef = useRef();
    const errorRef = useRef();

    const [username, setUsername] = useState("");
    const [validUsername, setValidUsername] = useState(false);
    const [usernameFocus, setUsernameFocus] = useState(false);

    const [password, setPassword] = useState("");
    const [validPassword, setValidPassword] = useState(false);
    const [passwordFocus, setPasswordFocus] = useState(false);

    const [matchPassword, setMatchPassword] = useState("");
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (auth?.accessToken) router.push("/channels/@me");
        usernameRef?.current?.focus();
    }, []);

    useEffect(() => {
        setValidUsername(USER_REGEX.test(username));
    }, [username]);

    useEffect(() => {
        setValidPassword(PWD_REGEX.test(password));
        setValidMatch(password === matchPassword);
    }, [password, matchPassword]);

    useEffect(() => {
        setErrorMessage("");
    }, [username, password, matchPassword]);

    useEffect(() => {
        setTimeout(() => {
            setErrorMessage("");
        }, 15000);
    }, [errorMessage]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const v1 = USER_REGEX.test(username);
        const v2 = PWD_REGEX.test(password);
        if (!v1 || !v2) {
            setErrorMessage("Invalid Entry");
            return;
        }
        try {
            await axios.post(
                "/auth/register",
                JSON.stringify({ username: username, password: password }),
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );
            setSuccess(true);
            setUsername("");
            setPassword("");
            setMatchPassword("");
            router.push("/login");
        } catch (err) {
            if (!err?.response) {
                setErrorMessage("No Server Response");
            } else if (err.response?.status === 422) {
                setErrorMessage("Username Taken");
            } else if (err.response?.status === 500) {
                setErrorMessage("Server Error");
            } else {
                setErrorMessage("Registration Failed");
            }
            errorRef?.current?.focus();
        }
    };

    return (
        <>
            <Head>
                <title>Discord | Register</title>
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
                    <h2 className={styles.formTitle}>Register</h2>

                    <div className={styles.inputsContainer}>
                        <div className={styles.inputContainer}>
                            <AnimatePresence>
                                <motion.label
                                    htmlFor="username"
                                    className={styles.label}
                                    animate={{
                                        opacity:
                                            usernameFocus || username
                                                ? 1
                                                : 0.5,
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
                                onChange={(e) =>
                                    setUsername(e.target.value)
                                }
                                value={username}
                                required
                                aria-invalid={
                                    validUsername ? "false" : "true"
                                }
                                aria-describedby="uidnote"
                                onFocus={() => setUsernameFocus(true)}
                                onBlur={() => setUsernameFocus(false)}
                                className={styles.input}
                                placeholder={
                                    usernameFocus ? "Username" : ""
                                }
                            />
                            <Tooltip
                                show={
                                    usernameFocus && username && !validUsername
                                }
                                pos="left"
                            >
                                <div>
                                    Must be less than 32 characters
                                </div>
                            </Tooltip>
                        </div>

                        <div className={styles.inputContainer}>
                            <AnimatePresence>
                                <motion.label
                                    htmlFor="password"
                                    className={styles.label}
                                    animate={{
                                        opacity:
                                            passwordFocus || password
                                                ? 1
                                                : 0.5,
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
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                value={password}
                                required
                                aria-invalid={
                                    validPassword ? "false" : "true"
                                }
                                aria-describedby="passwordnote"
                                onFocus={() => setPasswordFocus(true)}
                                onBlur={() => setPasswordFocus(false)}
                                className={styles.input}
                                placeholder={
                                    passwordFocus ? "Password" : ""
                                }
                            />
                            <Tooltip
                                show={passwordFocus && !validPassword}
                                pos="left"
                            >
                                <div>
                                    Must have at least 8 caracters
                                </div>
                            </Tooltip>
                        </div>

                        <div className={styles.inputContainer}>
                            <AnimatePresence>
                                <motion.label
                                    htmlFor="password"
                                    className={styles.label}
                                    animate={{
                                        opacity:
                                            matchFocus || matchPassword
                                                ? 1
                                                : 0.5,
                                        top:
                                            matchFocus || matchPassword
                                                ? "-40%"
                                                : "50%",
                                        left:
                                            matchFocus || matchPassword
                                                ? "5px"
                                                : "15px",
                                        transform:
                                            matchFocus || matchPassword
                                                ? "translateY(0%)"
                                                : "translateY(-50%)",
                                    }}
                                    transition={{
                                        duration: 0.2,
                                        ease: "easeInOut",
                                    }}
                                >
                                    Confirm Password
                                </motion.label>
                            </AnimatePresence>
                            <input
                                type="password"
                                id="passwordConfirm"
                                onChange={(e) =>
                                    setMatchPassword(e.target.value)
                                }
                                value={matchPassword}
                                required
                                aria-invalid={validMatch ? "false" : "true"}
                                aria-describedby="confirmnote"
                                onFocus={() => setMatchFocus(true)}
                                onBlur={() => setMatchFocus(false)}
                                className={styles.input}
                                placeholder={
                                    matchFocus ? "Confirm Password" : ""
                                }
                            />
                            <Tooltip
                                show={matchFocus && !validMatch}
                                pos="left"
                            >
                                Must match the first password input field.
                            </Tooltip>
                        </div>

                        <button
                            disabled={
                                !validUsername || !validPassword || !validMatch
                                    ? true
                                    : false
                            }
                            className={styles.button}
                        >
                            Register
                        </button>
                    </div>

                    <div className={styles.bottomLinks}>
                        <Link href="/login" className={styles.link}>
                            Already have an account?
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

export default Register;
