import { Icon, Tooltip, AvatarStatus } from "../";
import { useState, useEffect, useRef } from "react";
import styles from "./Title.module.css";
import useUserData from "../../hooks/useUserData";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/router";

const Title = () => {
    const [hover, setHover] = useState(false);
    const [show, setShow] = useState(false);
    const [search, setSearch] = useState("");
    const [filteredList, setFilteredList] = useState([]);
    const [chosen, setChosen] = useState([]);
    const [error, setError] = useState("");

    const { friends, setChannels } = useUserData();
    const axiosPrivate = useAxiosPrivate();
    const router = useRouter();

    const inputRef = useRef();

    useEffect(() => {
        if (search) {
            setFilteredList(friends?.filter((user) => {
                return user?.username?.toLowerCase().includes(search.toLowerCase());
            }));
        } else {
            setFilteredList(friends);
        }
    }, [search]);

    useEffect(() => {
        setFilteredList(friends?.sort(
            (a, b) => a?.username?.localeCompare(b.username)
        ));

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setShow(false);
            }
        };

        const handleOutsideClick = (e) => {
            if (e.target.closest(`.${styles.popup}`)) {
                return;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("click", handleOutsideClick);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("click", handleOutsideClick);
        };
    }, []);

    useEffect(() => {
        if (show) {
            inputRef.current.focus();
        }
    }, [show, chosen]);

    const createChannel = async () => {
        const recipientIDs = chosen?.map((user) => user?._id);

        const response = await axiosPrivate.post(
            `/users/@me/channels`,
            { recipients: recipientIDs },
        );

        if (!response.data.success) {
            setError(response.data.message);
        } else if (response.data.success) {
            if (response.data.message === "Channel created") {
                setChannels((prev) => [response.data.channel, ...prev]);
            }
            router.push(`/channels/@me/${response.data.channel._id}`);
        } else {
            setError("An error occurred.");
        }
    };

    return (
        <h2 className={styles.title}>
            <span>Direct Messages</span>
            <div
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onClick={() => {
                    if (show) {
                        setShow(false);
                        setChosen([]);
                        setSearch("");
                    } else {
                        setShow(true);
                    }
                }}
            >
                <Icon
                    name="add"
                    size={16}
                    viewbox="0 0 18 18"
                />

                <Tooltip show={hover}>
                    Create DM
                </Tooltip>

                {show && (
                    <div
                        className={styles.popup}
                        onMouseEnter={() => setHover(false)}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.header}>
                            <h1>Select Friends</h1>
                            <div>
                                {chosen?.length < 9 ?
                                    `You can add ${9 - chosen.length} more friend${9 - chosen.length === 1 ? "" : "s"
                                    }.`
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
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />

                                        <div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.scroller}>
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
                                        setShow(false);
                                        setChosen([]);
                                        setSearch("");
                                        createChannel();
                                    } else {
                                        setError("Please select at least one friend.");
                                    }
                                }}
                            >
                                Create DM
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </h2>
    )
}

export default Title;
