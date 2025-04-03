"use client";

import { useRequests } from "@/hooks/useRequests";
import { useSettings, useUrls } from "@/store";
import styles from "./FriendsPage.module.css";
import { UserLists } from "@components";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Content() {
    const tab = useSettings((s) => s.settings.friendTab);
    const { me, setMe } = useUrls();

    useEffect(() => {
        setMe("");
    }, []);

    if (tab === "add") return <AddFriend />;
    else return <UserLists content={tab} />;
}

export function AddFriend() {
    const [input, setInput] = useState("");
    const { addFriend } = useRequests();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h2>Add Friend</h2>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!input.length) return;
                        addFriend.send({ username: input }, { onComplete: () => setInput("") });
                    }}
                >
                    <div className={styles.description}>
                        You can add friends with their Spark username.
                    </div>

                    <div
                        id="add-friend-input"
                        className={styles.inputWrapper}
                        style={{
                            outline: addFriend.error
                                ? "1px solid var(--danger-0)"
                                : addFriend.data
                                ? "1px solid var(--success-0)"
                                : "",
                        }}
                    >
                        <div>
                            <input
                                type="text"
                                value={input}
                                minLength={2}
                                maxLength={32}
                                id={styles.input}
                                autoComplete="off"
                                aria-label="username"
                                ref={(el) => el?.focus()}
                                focus-id="add-friend-input"
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="You can add friends with their Spark username."
                            />
                        </div>

                        <button
                            type="submit"
                            tabIndex={!input.length ? -1 : 0}
                            className={`button blue ${!input.length ? "disabled" : ""}`}
                        >
                            Send Friend Request
                        </button>
                    </div>

                    {addFriend.error && <div className={styles.error}>{addFriend.error}</div>}
                    {addFriend.data && <div className={styles.valid}>{addFriend.data.message}</div>}
                </form>
            </header>

            <div className={styles.content}>
                <div className={styles.noData}>
                    <Image
                        priority
                        width={376}
                        height={162}
                        alt="Add Friend"
                        src="/assets/system/add-friend.svg"
                    />

                    <div>Wumpus is waiting on friends. You don't have to though!</div>
                </div>
            </div>
        </div>
    );
}
