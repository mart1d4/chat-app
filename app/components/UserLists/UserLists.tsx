"use client";

import { useMemo, useRef, useState } from "react";
import { lowercaseContains } from "@/lib/strings";
import { Icon, UserItem } from "@components";
import styles from "./UserLists.module.css";
import { useData } from "@/store";
import Image from "next/image";

const contentData: contentType = {
    all: {
        src: "/assets/system/no-friends.svg",
        width: 376,
        height: 162,
        description: "We are waiting on friends. You don't have to though!",
        match: "friends",
        title: "All Friends",
    },
    online: {
        src: "/assets/system/no-online.svg",
        width: 421,
        height: 218,
        description: "No one's around to play with us.",
        match: "online friends",
        title: "Online",
    },
    pending: {
        src: "/assets/system/no-pending.svg",
        width: 415,
        height: 200,
        description: "There are no pending requests. Here's us for now.",
        match: "pending requests",
        title: "Pending",
    },
    blocked: {
        src: "/assets/system/no-blocked.svg",
        width: 433,
        height: 232,
        description: "You can't unblock us.",
        match: "blocked users",
        title: "Blocked",
    },
    noSearch: {
        src: "/assets/system/nothing-found.svg",
        width: 421,
        height: 218,
        description: "We looked, but couldn't find anyone with that name.",
        match: "friends",
        title: "All Friends",
    },
};

type contentType = {
    [key: string]: {
        src: string;
        width: number;
        height: number;
        description: string;
        match: string;
        title: string;
    };
};

export const UserLists = ({ content }: { content: string }) => {
    const [search, setSearch] = useState("");

    const requestsReceived = useData((state) => state.received);
    const requestsSent = useData((state) => state.sent);

    const blockedUsers = useData((state) => state.blocked);
    const friends = useData((state) => state.friends);
    const searchBar = useRef<HTMLInputElement>(null);

    const pasteText = async () => {
        const text = await navigator.clipboard.readText();
        setSearch((prev) => prev + text);
        searchBar.current?.focus();
    };

    const list = useMemo(() => {
        if (content === "online") {
            return friends.filter((user) => user.status !== "offline");
        } else if (content === "all") {
            return friends;
        } else if (content === "pending") {
            const a = requestsReceived.map((user) => ({ ...user, req: "Received" }));
            const b = requestsSent.map((user) => ({ ...user, req: "Sent" }));
            return [...a, ...b].sort((a, b) => a.username.localeCompare(b.username));
        } else {
            return blockedUsers;
        }
    }, [content, friends, requestsReceived, requestsSent, blockedUsers]);

    const filteredList = useMemo(() => {
        if (search) {
            return list.filter((user) => lowercaseContains(user.username, search));
        }

        return list;
    }, [list, search]);

    const UserItems = useMemo(
        () => (
            <div className={styles.content}>
                <div
                    id="users-search"
                    className={styles.searchBar}
                >
                    <div>
                        <input
                            value={search}
                            ref={searchBar}
                            aria-label="Search"
                            placeholder="Search"
                            focus-id="users-search"
                            onChange={(e) => setSearch(e.target.value)}
                            onContextMenu={(e) => {
                                e.preventDefault();
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

                        <div
                            role="button"
                            className={styles.inputButton}
                            style={{ cursor: search.length ? "pointer" : "text" }}
                            onClick={() => {
                                if (search.length) {
                                    setSearch("");
                                    searchBar.current?.focus();
                                }
                            }}
                        >
                            <Icon
                                name={search.length ? "cross" : "search"}
                                size={20}
                            />
                        </div>
                    </div>
                </div>

                <h2 className={styles.title}>
                    {contentData[content]?.title} — {filteredList.length}
                </h2>

                <ul className={styles.listContainer + " scrollbar"}>
                    {filteredList.map((user) => (
                        <UserItem
                            key={user.id}
                            user={user}
                            content={content}
                        />
                    ))}
                </ul>
            </div>
        ),
        [filteredList]
    );

    if (list.length === 0) {
        return (
            <div className={styles.content}>
                <div className={styles.noData}>
                    <Image
                        priority
                        alt="No Users"
                        src={contentData[content].src}
                        width={contentData[content].width}
                        height={contentData[content].height}
                    />

                    <div>{contentData[content].description}</div>
                </div>
            </div>
        );
    }

    if (filteredList.length === 0 && search.length > 0) {
        return (
            <div className={styles.content}>
                <div
                    id="users-search"
                    className={styles.searchBar}
                >
                    <div>
                        <input
                            value={search}
                            ref={searchBar}
                            aria-label="Search"
                            placeholder="Search"
                            focus-id="users-search"
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <div
                            className={styles.inputButton}
                            role="button"
                            style={{ cursor: search.length ? "pointer" : "text" }}
                            onClick={() => {
                                setSearch("");
                                searchBar.current?.focus();
                            }}
                            tabIndex={0}
                        >
                            <Icon
                                name={search.length ? "cross" : "search"}
                                size={20}
                            />
                        </div>
                    </div>
                </div>

                <h2 className={styles.title}>
                    {contentData[content]?.title} — {filteredList.length}
                </h2>

                <div className={styles.noData}>
                    <Image
                        priority
                        src={contentData.noSearch.src}
                        alt="Nobody found with that username"
                        width={contentData.noSearch.width}
                        height={contentData.noSearch.height}
                    />

                    <div>{contentData.noSearch.description}</div>
                </div>
            </div>
        );
    }

    return UserItems;
};
