import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useComponents from "../../hooks/useComponents";
import useUserData from "../../hooks/useUserData";
import { useEffect, useState, useRef } from "react";
import { Message, AvatarStatus, Icon } from "../";
import styles from "./Popout.module.css";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import useAuth from "../../hooks/useAuth";

const Popout = ({ content }) => {
    const [pinnedMessages, setPinnedMessages] = useState(null);
    const [filteredList, setFilteredList] = useState([]);
    const [search, setSearch] = useState("");
    const [chosen, setChosen] = useState([]);
    const [copied, setCopied] = useState(false);
    const [placesLeft, setPlacesLeft] = useState(9);

    const { friends, channels, setChannels } = useUserData();
    const { setFixedLayer } = useComponents();
    const axiosPrivate = useAxiosPrivate();
    const { auth } = useAuth();
    const router = useRouter();
    const inputRef = useRef();
    const inputLinkRef = useRef();

    useEffect(() => {
        if (!content?.pinned) {
            const recipientsIds = content?.channel?.recipients?.map(
                (recipient) => recipient._id
            );

            const filteredFriends = friends?.filter((friend) => {
                return !recipientsIds?.includes(friend?._id);
            }).sort(
                (a, b) => a?.username?.localeCompare(b.username)
            );

            setFilteredList(filteredFriends);
            setPlacesLeft(10 - content?.channel?.recipients?.length);

            return;
        };

        const getPinnedMessages = async () => {
            const response = await axiosPrivate.get(
                `/channels/${content?.channel?._id}/pins`,
            );

            setPinnedMessages(response.data.pins.reverse());
        };

        getPinnedMessages();
    }, [content]);

    useEffect(() => {
        if (content?.pinned) return;
        if (content?.channel) {
            if (chosen?.length === 0) {
                setPlacesLeft(10 - content?.channel?.recipients?.length);
            } else {
                setPlacesLeft(10 - content?.channel?.recipients?.length - chosen?.length);
            }
        } else {
            if (chosen?.length === 0) {
                setPlacesLeft(9);
            } else {
                setPlacesLeft(9 - chosen?.length);
            }
        };
    }, [chosen]);

    useEffect(() => {
        if (content?.pinned) return;

        const recipientsIds = content?.channel?.recipients?.map(
            (recipient) => recipient._id
        );

        const filteredFriends = friends?.filter((friend) => {
            return !recipientsIds?.includes(friend?._id);
        }).sort(
            (a, b) => a?.username?.localeCompare(b.username)
        );

        if (search) {
            setFilteredList(filteredFriends?.filter((user) => {
                return user?.username?.toLowerCase().includes(search.toLowerCase());
            }));
        } else {
            setFilteredList(filteredFriends);
        };
    }, [search]);

    const createChannel = async (channelID) => {
        let allRecipients = [...chosen];

        if (content?.channel) {
            allRecipients = [...allRecipients, ...content?.channel?.recipients];
            allRecipients = allRecipients?.filter((recipient) => {
                return recipient?._id !== auth?.user?._id;
            });
        };

        const recipientIDs = allRecipients?.map((recipient) => recipient?._id);

        const response = await axiosPrivate.post(
            `/users/@me/channels`,
            {
                recipients: recipientIDs,
                addToChannel: channelID ? channelID : null,
            },
        );

        if (response.data.success) {
            if (response.data.message.includes("updated")) {
                setChannels((prev) => {
                    const updatedChannels = prev?.map((channel) => {
                        if (channel?._id === response.data.channel?._id) {
                            return response.data.channel;
                        } else {
                            return channel;
                        };
                    });

                    return updatedChannels;
                });
            } else {
                if (!channels?.map((channel) => channel._id).includes(response.data.channel._id)) {
                    setChannels((prev) => [response.data.channel, ...prev]);
                };
            };
            router.push(`/channels/@me/${response.data.channel._id}`);
        };
    };

    if (content?.pinned) {
        return (
            <div className={styles.pinContainer}>
                <div>
                    <h1>Pinned Messages</h1>
                </div>

                <div className="scrollbar">
                    {(!pinnedMessages || pinnedMessages.length === 0) ? (
                        <div className={styles.noPinnedContent}>
                            <div />

                            <div>
                                This direct message doesn't have <br />
                                any pinned messages... yet.
                            </div>
                        </div>
                    ) :
                        pinnedMessages.map((message) => (
                            <div
                                key={uuidv4()}
                                className={styles.messageContainer}
                            >
                                <Message message={message} noInt={true} />
                            </div>
                        ))
                    }
                </div>

                {(!pinnedMessages || pinnedMessages.length === 0) && (
                    <div className={styles.noPinnedBottom}>
                        <div>
                            <div>
                                Protip:
                            </div>

                            <div>
                                You and { } can pin a message from its cog content.
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    } else {
        return (
            <div className={styles.popup}>
                <div className={styles.header}>
                    <h1>Select Friends</h1>
                    {friends.length > 0 && (
                        <>
                            <div>
                                {placesLeft > 0 ?
                                    `You can add ${placesLeft} more friend${placesLeft > 1 ? "s" : ""}.`
                                    : "This group has a 10 member limit."}
                            </div>

                            <div className={styles.input}>
                                <div>
                                    <div>
                                        {chosen?.map((friend) => (
                                            <div
                                                key={uuidv4()}
                                                className={styles.friendChip}
                                                onClick={() => setChosen(chosen?.filter((user) => user !== friend))}
                                            >
                                                {friend?.username}
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
                                                chosen?.length ?
                                                    "Find or start a conversation"
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

                                        <div>
                                        </div>
                                    </div>
                                </div>

                                {content?.channel?.type === 1 && (
                                    <div className={styles.addButton}>
                                        <button
                                            className={chosen?.length ? "blue" : "blue disabled"}
                                            onClick={() => {
                                                if (chosen?.length) {
                                                    createChannel(content?.channel?._id)
                                                };
                                            }}
                                        >
                                            Add
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {(friends.length > 0 && filteredList.length > 0) && (
                    <>
                        <div className={styles.scroller + " scrollbar"}>
                            {filteredList?.map((friend) => (
                                <div
                                    key={uuidv4()}
                                    className={styles.friend}
                                    onClick={() => {
                                        if (chosen?.includes(friend)) {
                                            setChosen(chosen?.filter((user) => user !== friend));
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
                                            <Image
                                                src={friend?.avatar || "/assets/default-avatars/blue.png"}
                                                alt={friend?.username}
                                                width={32}
                                                height={32}
                                            />

                                            <AvatarStatus
                                                status={friend?.status}
                                                background="var(--background-4)"
                                            />
                                        </div>

                                        <div className={styles.friendUsername}>
                                            {friend?.username}
                                        </div>

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

                        {content?.channel?.type === 1 ? (
                            <div className={styles.footer}>
                                <h1>Or, send an invite link to a friend!</h1>

                                <div>
                                    <div>
                                        <input
                                            ref={inputLinkRef}
                                            type="text"
                                            readOnly
                                            value={`https://unthrust.com/${content?.channel?._id}`}
                                            onClick={() => inputLinkRef.current.select()}
                                        />
                                    </div>

                                    <button
                                        className={copied ? "green" : "blue"}
                                        onClick={() => {
                                            navigator.clipboard.writeText(`https://unthrust.com/${content?.channel?._id}`);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 1000);
                                        }}
                                    >
                                        {copied ? "Copied" : "Copy"}
                                    </button>
                                </div>

                                <div>Your invite link expires in 24 hours.</div>
                            </div>
                        ) : (
                            <div className={styles.footer}>
                                <button
                                    className="blue"
                                    onClick={() => {
                                        setFixedLayer(null);
                                        createChannel();
                                    }}
                                >
                                    Create DM
                                </button>
                            </div>
                        )}
                    </>
                )}

                {(friends.length > 0 && filteredList.length === 0) && (
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
                                    backgroundImage: `url(/assets/nothing-found.svg)`,
                                    width: "85px",
                                    height: "85px",
                                }}
                            />

                            <div>
                                No friends found that are not already in this DM.
                            </div>

                        </div>

                        <div className={styles.separator} />

                        {content?.channel?.type === 1 ? (
                            <div className={styles.footer}>
                                <h1>Or, send an invite link to a friend!</h1>

                                <div>
                                    <div>
                                        <input
                                            ref={inputLinkRef}
                                            type="text"
                                            readOnly
                                            value={`https://unthrust.com/${content?.channel?._id}`}
                                            onClick={() => inputLinkRef.current.select()}
                                        />
                                    </div>

                                    <button
                                        className={copied ? "green" : "blue"}
                                        onClick={() => {
                                            navigator.clipboard.writeText(`https://unthrust.com/${content?.channel?._id}`);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 1000);
                                        }}
                                    >
                                        {copied ? "Copied" : "Copy"}
                                    </button>
                                </div>

                                <div>Your invite link expires in 24 hours.</div>
                            </div>
                        ) : (
                            <div className={styles.footer}>
                                <button
                                    className="blue"
                                    onClick={() => {
                                        if (chosen?.length) {
                                            setFixedLayer(null);
                                            createChannel();
                                        }
                                    }}
                                >
                                    Create DM
                                </button>
                            </div>
                        )}
                    </>
                )}

                {friends.length === 0 && (
                    <div className={styles.noFriends}>
                        <div
                            style={{
                                backgroundImage: `url(/assets/no-friends-popout.svg)`,
                                width: "171px",
                                height: "86px",
                            }}
                        />

                        <div>
                            You don't have any friends to add!
                        </div>

                        <button
                            className="green"
                            onClick={() => {
                                setFixedLayer(null);
                                localStorage.setItem("friends-tab", "add");
                                router.push("/channels/@me");
                            }}
                        >
                            Add Friend
                        </button>
                    </div>
                )}
            </div>
        );
    };
};

export default Popout;
