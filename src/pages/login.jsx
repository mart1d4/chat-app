import { useRef, useState, useEffect } from "react";
import axios from "../api/axios";
import useAuth from "../hooks/useAuth";
import { useRouter } from "next/router";
import styles from "../styles/Auth.module.css";
import Head from "next/head";

const Login = () => {
    const { auth, setAuth } = useAuth();
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
                <img
                    src="/assets/auth-background.svg"
                    alt=""
                    draggable="false"
                />

                <form>
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
                                    Email or Username
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
                                        autoCapitalize="off"
                                        autoComplete="off"
                                        autoCorrect="off"
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
                                        autoCapitalize="off"
                                        autoComplete="off"
                                        autoCorrect="off"
                                        spellCheck="false"
                                        aria-labelledby="password"
                                        aria-describedby="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                className={styles.passwordForgot}
                                onClick={(e) => {
                                    e.preventDefault();
                                    router.push("/forgot-password");
                                }}
                            >
                                Forgot your password?
                            </button>
                            <button
                                type="submit"
                                className={styles.buttonSubmit}
                                onClick={handleSubmit}
                            >
                                <div className={isLoading ? styles.loading : ""}>
                                    {!isLoading && "Login"}
                                </div>
                            </button>

                            <div className={styles.bottomText}>
                                <span>Need an account?</span>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        router.push("/register");
                                    }}
                                >
                                    Register
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default Login;
