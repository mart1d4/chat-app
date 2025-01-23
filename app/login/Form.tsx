"use client";

import { Input, LoadingDots } from "@components";
import { getApiUrl } from "@/lib/uploadthing";
import { useRouter } from "next/navigation";
import styles from "../Auth.module.css";
import { useState } from "react";
import Link from "next/link";

export default function Form() {
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const router = useRouter();

    async function handleSubmit() {
        if (isLoading) return;
        setIsLoading(true);

        if (!username || !password) {
            setErrors({
                username: !username ? "Please enter your email or username." : "",
                password: !password ? "Please enter your password." : "",
            });

            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${getApiUrl}/auth/login`, {
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
        } catch (error) {
            console.error("An unexpected error occurred:", error);
            setErrors({ username: "An unexpected error occurred. Please try again." });
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
                    <h1>Welcome back!</h1>
                    <div>We're so excited to see you again!</div>
                </div>

                <div className={styles.loginBlock}>
                    <div>
                        <Input
                            autoFocus
                            name="username"
                            value={username}
                            error={errors.username}
                            label="Email or Username"
                            autoComplete="email username"
                            onChange={(value) => {
                                setUsername(value);
                                setErrors((prev) => ({ ...prev, username: "" }));
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 0 }}>
                        <Input
                            name="password"
                            value={password}
                            error={errors.password}
                            label="Password"
                            type="password"
                            autoComplete="current-password"
                            onChange={(value) => {
                                setPassword(value);
                                setErrors((prev) => ({ ...prev, password: "" }));
                            }}
                        />
                    </div>

                    <button
                        type="button"
                        className={styles.passwordForgot}
                        onClick={() => {}}
                    >
                        Forgot your password?
                    </button>

                    <button
                        type="submit"
                        className={"button " + styles.submit}
                    >
                        {isLoading ? <LoadingDots /> : "Log In"}
                    </button>

                    <div className={styles.bottomText}>
                        <span>Need an account?</span>
                        <Link href="/register">Register</Link>
                    </div>
                </div>
            </div>
        </form>
    );
}
