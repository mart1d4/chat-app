"use client";

import useFetchHelper from "@/hooks/useFetchHelper";
import styles from "./AddFriend.module.css";
import { useState } from "react";
import Image from "next/image";

export function AddFriend() {
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState("");
    const [valid, setValid] = useState("");

    const { sendRequest } = useFetchHelper();

    async function pasteText() {
        const text = await navigator.clipboard.readText();
        setInput((prev) => prev + text);
        const input = document.getElementById(styles.input) as HTMLInputElement;
        input.focus();
    }

    async function handleSubmit(e: React.MouseEvent | React.KeyboardEvent) {
        e.preventDefault();
        if (!input.length || loading) return;

        try {
            setLoading(true);

            const { errors, data } = await sendRequest({
                query: "ADD_FRIEND",
                body: { username: input },
            });

            if (data) {
                setValid(data.message);
                setInput("");
            } else if (errors) {
                setErrors(errors);
            }
        } catch (error) {
            console.error(error);
            setErrors({ server: "Something went wrong." });
        } finally {
            setLoading(false);
        }
    }

    const isError = errors?.username || errors?.server;

    return (
        <div className={styles.content}>
            <header className={styles.header}>
                <h2>Add Friend</h2>

                <form autoComplete="off">
                    <div className={styles.description}>
                        You can add friends with their Spark username.
                    </div>

                    <div
                        className={styles.inputWrapper}
                        style={{
                            outline: isError
                                ? "1px solid var(--error-1)"
                                : !!valid.length
                                ? "1px solid var(--success-1)"
                                : "",
                        }}
                    >
                        <div>
                            <input
                                ref={(el) => el?.focus()}
                                id={styles.input}
                                type="text"
                                autoComplete="off"
                                placeholder="You can add friends with their Spark username."
                                aria-label="username"
                                minLength={2}
                                maxLength={32}
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    setErrors({});
                                    setValid("");
                                }}
                                onContextMenu={(e) => {
                                    // setLayers({
                                    //     settings: { type: "MENU", event: e },
                                    //     content: {
                                    //         type: "INPUT",
                                    //         input: true,
                                    //         pasteText,
                                    //     },
                                    // });
                                }}
                            />
                        </div>

                        <button
                            className={`button blue ${!input.length ? "disabled" : ""}`}
                            onClick={(e) => handleSubmit(e)}
                        >
                            Send Friend Request
                        </button>
                    </div>

                    {(errors.username || errors.server) && (
                        <div className={styles.error}>{errors.username || errors.server}</div>
                    )}

                    {!!valid.length && <div className={styles.valid}>{valid}</div>}
                </form>
            </header>

            <div className={styles.content}>
                <div className={styles.noData}>
                    <Image
                        src="/assets/system/add-friend.svg"
                        alt="Add Friend"
                        width={376}
                        height={162}
                        priority
                    />

                    <div>Wumpus is waiting on friends. You don't have to though!</div>
                </div>
            </div>
        </div>
    );
}
