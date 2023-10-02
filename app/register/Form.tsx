"use client";

import { useRef, useState, useEffect, MouseEvent } from "react";
import { trimMessage } from "@/lib/strings";
import { useRouter } from "next/navigation";
import { LoadingDots } from "@components";
import styles from "../Auth.module.css";
import Link from "next/link";

const USER_REGEX = /^.{2,32}$/;
const PWD_REGEX = /^.{8,256}$/;

export default function Register() {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [passwordMatch, setPasswordMatch] = useState<string>("");

    const [usernameError, setUsernameError] = useState<string>("");
    const [passwordError, setPasswordError] = useState<string>("");

    const uidInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            e.stopPropagation();
            if (e.key === "Enter") {
                handleSubmit(e as unknown as MouseEvent);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [username, password, passwordMatch, isLoading]);

    useEffect(() => {
        uidInputRef.current?.focus();
    }, [usernameError]);

    useEffect(() => {
        setUsernameError("");
    }, [username]);

    useEffect(() => {
        setPasswordError("");
    }, [password, passwordMatch]);

    const handleSubmit = async (e: MouseEvent): Promise<void> => {
        e.preventDefault();

        if (isLoading) return;
        setIsLoading(true);

        const v1: boolean = USER_REGEX.test(username);
        const v2: boolean = PWD_REGEX.test(password);

        if (!v1) {
            setUsernameError("Userame must be between 2 and 32 characters");
            return setIsLoading(false);
        }

        if (!v2) {
            setPasswordError("Password must be between 8 and 256 characters");
            return setIsLoading(false);
        }

        if (password !== passwordMatch) {
            setPasswordError("Passwords do not match");
            return setIsLoading(false);
        }

        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: trimMessage(username), password }),
        }).then((res) => res.json());

        if (!response.success) {
            if (response.message.includes("Username")) {
                setUsernameError(response.message);
            } else if (response.message.includes("Password")) {
                setPasswordError(response.message);
            } else {
                setUsernameError(response.message);
                setPasswordError(response.message);
            }
            setIsLoading(false);
        } else {
            setUsername("");
            setPassword("");
            setPasswordMatch("");
            setIsLoading(false);
            router.push("/login");
        }
    };

    return (
        <div className={styles.loginBlock}>
            <div>
                <label
                    htmlFor="username"
                    style={{ color: usernameError.length ? "var(--error-light)" : "var(--foreground-3)" }}
                >
                    Username
                    {usernameError.length > 0 && <span className={styles.errorLabel}>- {usernameError}</span>}
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
                    style={{ color: passwordError.length ? "var(--error-light)" : "var(--foreground-3)" }}
                >
                    Password
                    {passwordError.length > 0 && <span className={styles.errorLabel}>- {passwordError}</span>}
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
                    style={{ color: passwordError.length ? "var(--error-light)" : "var(--foreground-3)" }}
                >
                    Confirm Password
                    {passwordError.length > 0 && <span className={styles.errorLabel}>- {passwordError}</span>}
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
                className={styles.buttonSubmit}
                onClick={(e) => handleSubmit(e)}
            >
                {isLoading ? <LoadingDots /> : "Register"}
            </button>

            <div className={styles.bottomText}>
                <Link href="/login">Already have an account?</Link>
            </div>
        </div>
    );
}
