"use client";

import { usernameRegex } from "@/lib/verifications";
import { Input, LoadingDots } from "@components";
import { useRouter } from "next/navigation";
import styles from "../Auth.module.css";
import { getApiUrl } from "@/lib/urls";
import { useState } from "react";
import Link from "next/link";

export default function Register() {
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [match, setMatch] = useState("");

    const router = useRouter();

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

        if (password !== match) {
            setErrors((prev) => ({ ...prev, password: "Passwords do not match." }));
            return setIsLoading(false);
        }

        const response = await fetch(`${getApiUrl()}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                username,
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
        <form
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
        >
            <div className={styles.loginContainer}>
                <div className={styles.header}>
                    <h1>Create an account</h1>
                </div>

                <div className={styles.loginBlock}>
                    <div>
                        <Input
                            name="username"
                            label="Username"
                            value={username}
                            error={errors.username}
                            onChange={(value) => {
                                setUsername(value);
                                setErrors((prev) => ({ ...prev, username: "" }));
                            }}
                        />
                    </div>

                    <div>
                        <Input
                            type="password"
                            name="password"
                            label="Password"
                            value={password}
                            error={errors.password}
                            onChange={(value) => {
                                setPassword(value);
                                setErrors((prev) => ({ ...prev, password: "" }));
                            }}
                        />
                    </div>

                    <div>
                        <Input
                            value={match}
                            type="password"
                            name="password-match"
                            error={errors.password}
                            label="Confirm Password"
                            onChange={(value) => {
                                setMatch(value);
                                setErrors((prev) => ({ ...prev, password: "" }));
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className={"button " + styles.submit}
                    >
                        {isLoading ? <LoadingDots /> : "Register"}
                    </button>

                    <div className={styles.bottomText}>
                        <Link href="/login">Already have an account?</Link>
                    </div>
                </div>
            </div>
        </form>
    );
}
