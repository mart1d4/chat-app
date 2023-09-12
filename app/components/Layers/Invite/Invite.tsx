"use client";

import { useEffect, useState, useRef } from "react";
import useFetchHelper from "@/hooks/useFetchHelper";
import { useData, useLayers } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Icon, Avatar } from "@components";
import styles from "./Invite.module.css";
import Link from "next/link";

export const Invite = () => {
    const [filteredList, setFilteredList] = useState<TCleanUser[]>([]);
    const [search, setSearch] = useState<string>("");
    const [chosen, setChosen] = useState<TCleanUser[]>([]);
    const [copied, setCopied] = useState<boolean>(false);
    const [placesLeft, setPlacesLeft] = useState<number>(9);
    const [pinned, setPinned] = useState<TMessage[]>([]);

    const setLayers = useLayers((state) => state.setLayers);
    const user = useData((state) => state.user) as TUser;
    const channels = useData((state) => state.channels);
    const layers = useLayers((state) => state.layers);
    const friends = useData((state) => state.friends);
    const { sendRequest } = useFetchHelper();

    const inputLinkRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setLayers({
                    settings: {
                        type: "POPUP",
                        setNull: true,
                    },
                });
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        setFilteredList(friends);
        setPlacesLeft(9);
    }, []);

    useEffect(() => {
        if (chosen.length === 0) setPlacesLeft(9);
        else setPlacesLeft(9 - chosen.length);
    }, [chosen]);

    useEffect(() => {
        if (search)
            setFilteredList(friends.filter((user) => user.username.toLowerCase().includes(search.toLowerCase())));
        else setFilteredList(friends);
    }, [search, friends]);

    return (
        <div
            className={styles.popup}
            onContextMenu={(e) => e.preventDefault()}
        >
            <div className={styles.header}>
                <h1>Select Friends</h1>
                {friends.length > 0 && (
                    <>
                        <div>
                            {placesLeft > 0
                                ? `You can add ${placesLeft} more friend${placesLeft > 1 ? "s" : ""}.`
                                : "This group has a 10 member limit."}
                        </div>

                        <div className={styles.input}>
                            <div>
                                <div>
                                    {chosen?.map((friend) => (
                                        <div
                                            key={friend.username}
                                            className={styles.friendChip}
                                            onClick={() => {
                                                setChosen(chosen?.filter((user) => user.id !== friend.id));
                                            }}
                                        >
                                            {friend.username}
                                            <Icon
                                                name="close"
                                                size={12}
                                            />
                                        </div>
                                    ))}

                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder={
                                            chosen?.length
                                                ? "Find or start a conversation"
                                                : "Type the username of a friend"
                                        }
                                        value={search || ""}
                                        spellCheck="false"
                                        role="combobox"
                                        aria-autocomplete="list"
                                        aria-expanded="true"
                                        aria-haspopup="true"
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Backspace" && !search) {
                                                setChosen(chosen?.slice(0, -1));
                                            }
                                        }}
                                    />

                                    <div></div>
                                </div>
                            </div>

                            <div className={styles.addButton}>
                                <button
                                    className={chosen?.length ? "blue" : "blue disabled"}
                                    onClick={() => {
                                        if (chosen?.length) {
                                            setLayers({
                                                settings: {
                                                    type: "POPUP",
                                                    setNull: true,
                                                },
                                            });
                                        }
                                    }}
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </>
                )}

                <button
                    onClick={() =>
                        setLayers({
                            settings: {
                                type: "POPUP",
                                setNull: true,
                            },
                        })
                    }
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        role="image"
                    >
                        <path
                            fill="currentColor"
                            d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"
                        />
                    </svg>
                </button>
            </div>

            {friends.length > 0 && filteredList.length > 0 && (
                <>
                    <div className={styles.scroller + " scrollbar"}>
                        {filteredList.map((friend) => (
                            <div
                                key={friend.id}
                                className={styles.friend}
                                onClick={() => {
                                    if (chosen.includes(friend)) {
                                        setChosen(chosen?.filter((user) => user.id !== friend.id));
                                    } else {
                                        if (placesLeft > 0) {
                                            setChosen([...chosen, friend]);
                                            setSearch("");
                                        }
                                    }
                                }}
                            >
                                <div>
                                    <div className={styles.friendAvatar}>
                                        <Avatar
                                            src={friend.avatar}
                                            alt={friend.username}
                                            size={32}
                                            status={friend.status}
                                        />
                                    </div>

                                    <div className={styles.friendUsername}>{friend.username}</div>

                                    <div className={styles.friendCheck}>
                                        <div>
                                            {chosen?.includes(friend) && (
                                                <Icon
                                                    name="accept"
                                                    size={16}
                                                    fill="var(--accent-1)"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.separator} />

                    <div className={styles.footer}>
                        <h1>Or, send a server invite link to a friend</h1>

                        <div>
                            <div>
                                <input
                                    ref={inputLinkRef}
                                    type="text"
                                    readOnly
                                    value={`eee`}
                                    onClick={() => inputLinkRef.current?.select()}
                                />
                            </div>

                            <button
                                className={copied ? "green" : "blue"}
                                onClick={() => {
                                    navigator.clipboard.writeText(`eee`);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 1000);
                                }}
                            >
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>

                        <div>
                            Your invite link expires in 24 hours.
                            <span>Edit invite link.</span>
                        </div>
                    </div>
                </>
            )}

            {friends.length > 0 && filteredList.length === 0 && (
                <>
                    <div
                        className={styles.noFriends}
                        style={{
                            padding: "0 20px",
                            marginBottom: "20px",
                        }}
                    >
                        <div
                            style={{
                                backgroundImage: `url(https://ucarecdn.com/501ad905-28df-4c05-ae41-de0499966f4f/)`,
                                width: "85px",
                                height: "85px",
                            }}
                        />

                        <div>No results found</div>
                    </div>

                    <div className={styles.separator} />

                    <div className={styles.footer}>
                        <h1>Or, send an invite link to a friend!</h1>

                        <div>
                            <div>
                                <input
                                    ref={inputLinkRef}
                                    type="text"
                                    readOnly
                                    value={`ee`}
                                    onClick={() => inputLinkRef.current?.select()}
                                />
                            </div>

                            <button
                                className={copied ? "green" : "blue"}
                                onClick={() => {
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 1000);
                                }}
                            >
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>

                        <div>Your invite link expires in 24 hours.</div>
                    </div>
                </>
            )}

            {friends.length === 0 && (
                <div className={styles.noFriends}>
                    <div />

                    <div>You don't have any friends to add!</div>

                    <button
                        className="green"
                        onClick={() => {
                            setLayers({
                                settings: {
                                    type: "POPUP",
                                    setNull: true,
                                },
                            });
                            localStorage.setItem("friends-tab", "add");
                            router.push("/channels/me");
                        }}
                    >
                        Add Friend
                    </button>
                </div>
            )}
        </div>
    );
};
