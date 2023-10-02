"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trimMessage } from "@/lib/strings";
import { LoadingDots } from "@components";
import styles from "../Auth.module.css";
import Link from "next/link";

export default function Form() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");

    const usernameInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            e.stopPropagation();
            if (e.key === "Enter") {
                handleSubmit();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [username, password, isLoading]);

    useEffect(() => {
        setError("");
    }, [username, password]);

    const handleSubmit = async () => {
        if (isLoading || !username || !password) return;
        setIsLoading(true);

        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: trimMessage(username), password }),
        }).then((res) => res.json());

        if (!response.success) {
            setError(response.message || "An error occurred");
        } else {
            setUsername("");
            setPassword("");
            router.refresh();
        }

        setIsLoading(false);
    };

    return (
        <div className={styles.loginBlock}>
            <div>
                <label
                    htmlFor="username"
                    style={{ color: error.length ? "var(--error-light)" : "var(--foreground-3)" }}
                >
                    Email or Username
                    {error.length ? <span className={styles.errorLabel}> - {error}</span> : <span> *</span>}
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
                    style={{ color: error.length ? "var(--error-light)" : "var(--foreground-3)" }}
                >
                    Password
                    {error.length ? <span className={styles.errorLabel}>- {error}</span> : <span>*</span>}
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
                className={styles.buttonSubmit}
                onClick={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >
                {isLoading ? <LoadingDots /> : "Log In"}
            </button>

            <div className={styles.bottomText}>
                <span>Need an account?</span>
                <Link href="/register">Register</Link>
            </div>
        </div>
    );
}
