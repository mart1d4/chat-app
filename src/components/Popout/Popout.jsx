import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useComponents from "../../hooks/useComponents";
import useUserData from "../../hooks/useUserData";
import { useEffect, useState, useRef } from "react";
import { Message, AvatarStatus, Icon } from "../";
import styles from "./Popout.module.css";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";

const Popout = ({ content }) => {
    const [pinnedMessages, setPinnedMessages] = useState(null);
    const [filteredList, setFilteredList] = useState([]);
    const [search, setSearch] = useState("");
    const [chosen, setChosen] = useState([]);

    const { friends, setChannels } = useUserData();
    const { setFixedLayer } = useComponents();
    const axiosPrivate = useAxiosPrivate();
    const router = useRouter();
    const inputRef = useRef();

    useEffect(() => {
        if (!content?.channel) {
            setFilteredList(friends?.sort(
                (a, b) => a?.username?.localeCompare(b.username)
            ));
            return;
        };

        const getPinnedMessages = async () => {
            const response = await axiosPrivate.get(
                `/channels/${content?.channel}/pins`,
            );

            setPinnedMessages(response.data.pins.reverse());
        };

        getPinnedMessages();
    }, [content]);

    useEffect(() => {
        if (content?.channel) return;

        if (search) {
            setFilteredList(friends?.filter((user) => {
                return user?.username?.toLowerCase().includes(search.toLowerCase());
            }));
        } else setFilteredList(friends);
    }, [search]);

    const createChannel = async () => {
        const recipientIDs = chosen?.map((user) => user?._id);

        const response = await axiosPrivate.post(
            `/users/@me/channels`,
            { recipients: recipientIDs },
        );

        if (response.data.success) {
            if (response.data.message === "Channel created") {
                setChannels((prev) => [response.data.channel, ...prev]);
            };
            router.push(`/channels/@me/${response.data.channel._id}`);
        };
    };

    if (content?.channel) {
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
                                {chosen?.length < 9 ?
                                    `You can add ${9 - chosen.length} more friend${9 - chosen.length === 1 ? "" : "s"}.`
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
                                            if (chosen?.length < 9) {
                                                setChosen([...chosen, friend]);
                                                setSearch("");
                                            }
                                        }
                                    }}
                                >
                                    <div>
                                        <div className={styles.friendAvatar}>
                                            <Image
                                                src={friend?.avatar}
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
