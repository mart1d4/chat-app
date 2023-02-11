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

    const [isLoading, setIsLoading] = useState(false);

    const [uid, setUID] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (auth?.accessToken) router.push("/channels/@me");
    }, [auth]);

    useEffect(() => {
        uidInputRef.current.focus();
    }, []);

    useEffect(() => {
        setError("");
    }, [uid, password]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLoading) return;
        setIsLoading(true);

        const response = await axios.post(
            "/auth/login",
            { uid, password },
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );

        if (response.data.error) {
            setError(response.data.error || "An error occurred");
            setIsLoading(false);
        } else {
            setAuth({
                accessToken: response.data.accessToken,
                user: response.data.user,
            });

            setUID("");
            setPassword("");
            setIsLoading(false);
            router.push("/channels/@me");
        }
    };

    return (
        <>
            <Head>
                <title>Unthrust | Login</title>
            </Head>

            <div className={styles.wrapper}>
                <AnimatePresence>
                    <motion.form
                        onSubmit={handleSubmit}
                        initial={{
                            scale: 1.2,
                        }}
                        animate={{
                            scale: 1,
                        }}
                        exit={{
                            scale: 1.2,
                        }}
                        transition={{
                            duration: 0.3,
                            ease: "easeInOut",
                        }}
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
                                                ? "var(--error-light)"
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

                                <div style={{ marginBottom: 0 }}>
                                    <label
                                        htmlFor="password"
                                        style={{
                                            color: error.length
                                                ? "var(--error-light)"
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

                                <button className={styles.passwordForgot}>
                                    Forgot your password?
                                </button>
                                <button type="submit" className={styles.buttonSubmit}>
                                    <div className={isLoading ? styles.loading : ""}>
                                        {!isLoading && "Login"}
                                    </div>
                                </button>

                                <div>
                                    <span>Need an account?</span>
                                    <button
                                        onClick={() => {
                                            router.push("/register");
                                        }}
                                    >
                                        Register
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.form>
                </AnimatePresence>
            </div>
        </>
    );
};

export default Login;
