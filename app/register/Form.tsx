"use client";

import { passwordRegex, usernameRegex } from "@/lib/verifications";
import { useRef, useState, useEffect } from "react";
import { sanitizeString } from "@/lib/strings";
import { useRouter } from "next/navigation";
import { LoadingDots } from "@components";
import styles from "../Auth.module.css";
import Link from "next/link";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function Register() {
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordMatch, setPasswordMatch] = useState("");
    const [errors, setErrors] = useState<{
        username?: string;
        password?: string;
        server?: string;
    }>({});

    const uidInputRef = useRef<HTMLInputElement>(null);
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
    }, [username, password, passwordMatch, isLoading]);

    useEffect(() => {
        uidInputRef.current?.focus();
    }, [errors?.username]);

    useEffect(() => {
        setErrors((prev) => ({ ...prev, username: "" }));
    }, [username]);

    useEffect(() => {
        setErrors((prev) => ({ ...prev, password: "" }));
    }, [password, passwordMatch]);

    async function handleSubmit() {
        if (isLoading) return;
        setIsLoading(true);

        if (!usernameRegex.test(username)) {
            setErrors((prev) => ({
                ...prev,
                username: "Username can only use letters, numbers, underscores and periods.",
            }));
            return setIsLoading(false);
        }

        if (username.length < 2) {
            setErrors((prev) => ({ ...prev, username: "Must be at least 2 characters." }));
            return setIsLoading(false);
        }

        if (username.length > 32) {
            setErrors((prev) => ({ ...prev, username: "Cannot be more than 32 characters." }));
            return setIsLoading(false);
        }

        if (password.length < 6) {
            setErrors((prev) => ({ ...prev, password: "Must be at least 6 characters." }));
            return setIsLoading(false);
        }

        if (password.length > 72) {
            setErrors((prev) => ({ ...prev, password: "Cannot be more than 72 characters." }));
            return setIsLoading(false);
        }

        if (password !== passwordMatch) {
            setErrors((prev) => ({ ...prev, password: "Passwords do not match." }));
            return setIsLoading(false);
        }

        const response = await fetch(`${apiUrl}/auth/register`, {
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

        setIsLoading(false);
    }

    return (
        <div className={styles.loginBlock}>
            <div>
                <label
                    htmlFor="username"
                    style={{
                        color:
                            errors.username?.length || errors.server?.length
                                ? "var(--error-light)"
                                : "var(--foreground-3)",
                    }}
                >
                    Username
                    {(!!errors.username?.length || !!errors.server?.length) && (
                        <span className={styles.errorLabel}>
                            - {errors.username || errors.server}
                        </span>
                    )}
                </label>
                <div className={styles.inputContainer}>
                    <input
                        ref={uidInputRef}
                        id="username"
                        type="text"
                        name="username"
                        aria-label="Username"
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                        minLength={2}
                        maxLength={32}
                        spellCheck="false"
                        aria-labelledby="username"
                        aria-describedby="username"
                        value={username}
                        autoFocus
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label
                    htmlFor="password"
                    style={{
                        color: errors.password?.length
                            ? "var(--error-light)"
                            : "var(--foreground-3)",
                    }}
                >
                    Password
                    {!!errors.password?.length && (
                        <span className={styles.errorLabel}>- {errors.password}</span>
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
                        color: errors.password?.length
                            ? "var(--error-light)"
                            : "var(--foreground-3)",
                    }}
                >
                    Confirm Password
                    {!!errors.password?.length && (
                        <span className={styles.errorLabel}>- {errors.password}</span>
                    )}
                </label>
                <div className={styles.inputContainer}>
                    <input
                        id="password-match"
                        type="password"
                        name="password-match"
                        aria-label="Confirm Password"
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
                className={"button " + styles.buttonSubmit}
                onClick={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >
                {isLoading ? <LoadingDots /> : "Register"}
            </button>

            <div className={styles.bottomText}>
                <Link
                    ref={linkRef}
                    href="/login"
                >
                    Already have an account?
                </Link>
            </div>
        </div>
    );
}
