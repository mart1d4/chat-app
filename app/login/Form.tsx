"use client";

import { useRef, useState, useEffect } from "react";
import { sanitizeString } from "@/lib/strings";
import { useRouter } from "next/navigation";
import { LoadingDots } from "@components";
import styles from "../Auth.module.css";
import Link from "next/link";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function Form() {
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{
        username?: string;
        password?: string;
        server?: string;
    }>({});

    const usernameInputRef = useRef<HTMLInputElement>(null);
    const linkRef = useRef<HTMLAnchorElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && document.activeElement !== linkRef.current) {
                handleSubmit();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [username, password, isLoading]);

    useEffect(() => {
        setErrors({});
    }, [username, password]);

    async function handleSubmit() {
        if (isLoading || !username || !password) return;
        setIsLoading(true);

        try {
            const response = await fetch(`${apiUrl}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    username: sanitizeString(username),
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                router.push("/channels/me");
            } else {
                setErrors(data.errors);
            }
        } catch (error) {
            console.error("An unexpected error occurred:", error);
            setErrors({ username: "An unexpected error occurred. Please try again." });
        }

        setIsLoading(false);
    }

    return (
        <div className={styles.loginBlock}>
            <div>
                <label
                    htmlFor="username"
                    style={{
                        color:
                            errors.username || errors.server
                                ? "var(--error-light)"
                                : "var(--foreground-3)",
                    }}
                >
                    Email or Username
                    {errors.username || errors.server ? (
                        <span className={styles.errorLabel}>
                            {" "}
                            - {errors.username || errors.server}
                        </span>
                    ) : (
                        <span> *</span>
                    )}
                </label>

                <div className={styles.inputContainer}>
                    <input
                        ref={usernameInputRef}
                        id="username"
                        type="text"
                        name="username"
                        aria-label="Email or Username"
                        autoCapitalize="off"
                        autoComplete="email username"
                        autoCorrect="off"
                        spellCheck="false"
                        aria-labelledby="username-email"
                        aria-describedby="username-email"
                        value={username}
                        autoFocus
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
            </div>

            <div style={{ marginBottom: 0 }}>
                <label
                    htmlFor="password"
                    style={{
                        color: errors.username?.length
                            ? "var(--error-light)"
                            : "var(--foreground-3)",
                    }}
                >
                    Password
                    {errors.username?.length ? (
                        <span className={styles.errorLabel}>- {errors.username}</span>
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
                type="button"
                className={styles.passwordForgot}
                onClick={(e) => {
                    e.preventDefault();
                }}
            >
                Forgot your password?
            </button>

            <button
                type="submit"
                className={"button " + styles.buttonSubmit}
                onClick={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >
                {isLoading ? <LoadingDots /> : "Log In"}
            </button>

            <div className={styles.bottomText}>
                <span>Need an account?</span>
                <Link
                    ref={linkRef}
                    href="/register"
                >
                    Register
                </Link>
            </div>
        </div>
    );
}
