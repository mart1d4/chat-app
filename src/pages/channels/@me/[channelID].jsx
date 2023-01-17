import { useRouter } from "next/router";
import { AppHeader, Layout, NestedLayout, Message } from "../../../components";
import styles from "./Channels.module.css";
import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import useAuth from "../../../hooks/useAuth";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import useUserData from "../../../hooks/useUserData";
import Image from "next/image";
import { motion } from "framer-motion";

const scale = {
    hover: {
        scale: 1.15,
        transition: {
            duration: 0.1,
            ease: "circOut",
        }
    }
};

const Channels = () => {
    const [friend, setFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [hover, setHover] = useState(null);
    const [emojisPosIndex, setEmojisPosIndex] = useState(0);
    const [textContainerHeight, setTextContainerHeight] = useState(44);

    useEffect(() => {
        console.log(message);

        // Count the number of lines
        const lines = message.split("\n").length - 1;
        setTextContainerHeight(44 + (lines * 22));
    }, [message]);

    const emojisPos = [
        { x: 0, y: 0 },
        { x: 0, y: -22 },
        { x: 0, y: -44 },
        { x: 0, y: -66 },
        { x: 0, y: -88 },
        { x: -22, y: 0 },
        { x: -22, y: -22 },
        { x: -22, y: -44 },
        { x: -22, y: -66 },
        { x: -22, y: -88 },
        { x: -44, y: 0 },
        { x: -44, y: -22 },
        { x: -44, y: -44 },
        { x: -44, y: -66 },
        { x: -44, y: -88 },
        { x: -66, y: 0 },
        { x: -66, y: -22 },
        { x: -66, y: -44 },
        { x: -66, y: -66 },
        { x: -66, y: -88 },
        { x: -88, y: 0 },
        { x: -88, y: -22 },
        { x: -88, y: -44 },
        { x: -88, y: -66 },
        { x: -88, y: -88 },
        { x: -110, y: 0 },
        { x: -110, y: -22 },
        { x: -110, y: -44 },
        { x: -110, y: -66 },
        { x: -110, y: -88 },
        { x: -132, y: 0 },
        { x: -132, y: -22 },
        { x: -132, y: -44 },
        { x: -132, y: -66 },
        { x: -154, y: 0 },
        { x: -154, y: -22 },
        { x: -154, y: -44 },
        { x: -154, y: -66 },
        { x: -176, y: 0 },
        { x: -176, y: -22 },
        { x: -176, y: -44 },
        { x: -176, y: -66 },
        { x: -198, y: 0 },
        { x: -198, y: -22 },
        { x: -198, y: -44 },
        { x: -198, y: -66 },
        { x: -220, y: 0 },
        { x: -220, y: -22 },
        { x: -220, y: -44 },
        { x: -220, y: -66 },
    ]

    const { auth } = useAuth();
    const { channelList } = useUserData();
    const axiosPrivate = useAxiosPrivate();
    const router = useRouter();
    const textContainerRef = useRef(null);
    const scrollableContainer = useRef(null);

    useEffect(() => {
        if (!auth?.accessToken) router.push("/login");

        if (
            channelList?.filter(
                (channel) => channel._id.toString() === router.query.channelID
            ).length === 0
        ) {
            router.push("/channels/@me/friends");
        }

        setFriend(channelList?.filter(
            (channel) => channel._id.toString() === router.query.channelID
        )[0]?.members[0]);
    }, [router.query]);

    const isStart = (index) => {
        if (index === 0) return true;
        if (messages[index - 1].sender._id !== messages[index].sender._id) return true;
        return false;
    };

    const sendMessage = () => {
        if (message.length === 0) return;
        if (message.length > 4000) return;

        const newMessage = {
            sender: auth?.user,
            content: message,
            createdAt: new Date(),
        }

        setMessages((messages) => [...messages, newMessage]);
        setMessage("");
        textContainerRef.current.innerHTML = "";
    };

    return (
        <>
            <Head>
                <title>Discord | @{friend?.username}</title>
            </Head>
            <div className={styles.container}>
                <AppHeader
                    content="channels"
                    friend={friend}
                />
                <div className={styles.content}>
                    <main className={styles.main}>
                        <div className={styles.messagesWrapper}>
                            <div className={styles.messagesScrollableContainer}>
                                <div className={styles.scrollContent}>
                                    <ol className={styles.scrollContentInner}>
                                        <div className={styles.firstTimeMessageContainer}>
                                            <div className={styles.imageWrapper}>
                                                {friend?.avatar && (
                                                    <Image
                                                        src={friend?.avatar}
                                                        alt="Avatar"
                                                        width={80}
                                                        height={80}
                                                    />
                                                )}
                                            </div>
                                            <h3 className={styles.friendUsername}>
                                                {friend?.username}
                                            </h3>
                                            <div className={styles.descriptionContainer}>
                                                This is the beginning of your direct message history with <strong>@{friend?.username}</strong>.
                                                <div className={styles.descriptionActions}>
                                                    <button
                                                        style={{
                                                            backgroundColor: "var(--accent-primary)",
                                                        }}
                                                    >
                                                        Add Friend
                                                    </button>
                                                    <button
                                                        style={{
                                                            backgroundColor: "var(--background-light)",
                                                        }}
                                                    >
                                                        Block
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {messages?.map((message, index) =>
                                            <Message
                                                key={index}
                                                message={message}
                                                start={isStart(index)}
                                            />
                                        )}

                                        <div className={styles.scrollerSpacer} />
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <form
                            className={styles.form}
                        >
                            <div className={styles.textArea}>
                                <div
                                    className={styles.scrollableContainer}
                                    ref={scrollableContainer}
                                >
                                    <div className={styles.input}>
                                        <div className={styles.attachWrapper}>
                                            <button>
                                                <div>
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        width="24"
                                                        height="24"
                                                    >
                                                        <path fill="currentColor" d="M12 2.00098C6.486 2.00098 2 6.48698 2 12.001C2 17.515 6.486 22.001 12 22.001C17.514 22.001 22 17.515 22 12.001C22 6.48698 17.514 2.00098 12 2.00098ZM17 13.001H13V17.001H11V13.001H7V11.001H11V7.00098H13V11.001H17V13.001Z" />
                                                    </svg>
                                                </div>
                                            </button>
                                        </div>
                                        <div
                                            className={styles.textContainer}
                                            style={{
                                                height: `${textContainerHeight}px`,
                                            }}
                                        >
                                            <div>
                                                {message.length === 0 && (
                                                    <div className={styles.textContainerPlaceholder}>
                                                        Message @{friend?.username}
                                                    </div>
                                                )}

                                                <div
                                                    ref={textContainerRef}
                                                    className={styles.textContainerInner}
                                                    role="textbox"
                                                    spellCheck="true"
                                                    autoCorrect="off"
                                                    aria-multiline="true"
                                                    aria-label={`Message @${friend?.username}`}
                                                    aria-autocomplete="list"
                                                    contentEditable="true"
                                                    placeholder={`Message @${friend?.username}`}
                                                    onInput={(e) => setMessage(e.target.innerText)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" && e.shiftKey) {
                                                            e.preventDefault();
                                                            textContainerRef.current.innerHTML += "\n";
                                                            setMessage(textContainerRef.current.innerText);
                                                            // Place cursor at the end of the text
                                                            const range = document.createRange();
                                                            const sel = window.getSelection();
                                                            range.setStart(textContainerRef.current.childNodes[0], textContainerRef.current.innerText.length);
                                                            range.collapse(true);
                                                            sel.removeAllRanges();
                                                            sel.addRange(range);

                                                        } else if (e.key === "Enter" && !e.shiftKey) {
                                                            e.preventDefault();
                                                            sendMessage();
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className={styles.toolsContainer}>
                                            <button
                                                onMouseEnter={() => setHover(1)}
                                                onMouseLeave={() => setHover(null)}
                                            >
                                                <div className={styles.button}>
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        width="30"
                                                        height="30"
                                                    >
                                                        <g
                                                            fill="none"
                                                            fillRule="evenodd"
                                                        >
                                                            <path
                                                                d="m20 5h-16c-1.1 0-1.99.9-1.99 2l-.01 10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-10c0-1.1-.9-2-2-2zm-9 3h2v2h-2zm0 3h2v2h-2zm-3-3h2v2h-2zm0 3h2v2h-2zm-1 2h-2v-2h2zm0-3h-2v-2h2zm9 7h-8v-2h8zm0-4h-2v-2h2zm0-3h-2v-2h2zm3 3h-2v-2h2zm0-3h-2v-2h2z"
                                                                fill={
                                                                    hover === 1
                                                                        ? "var(--foreground-secondary)"
                                                                        : "var(--foreground-tertiary)"
                                                                }
                                                                fillRule="nonzero"
                                                            />
                                                            <path
                                                                d="m0 0h24v24h-24zm0 0h24v24h-24z"
                                                            />
                                                        </g>
                                                    </svg>
                                                </div>
                                            </button>
                                            <button
                                                onMouseEnter={() => setHover(2)}
                                                onMouseLeave={() => setHover(null)}
                                            >
                                                <div className={styles.button}>
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        width="24"
                                                        height="24"
                                                    >
                                                        <path
                                                            fill={
                                                                hover === 2
                                                                    ? "var(--foreground-secondary)"
                                                                    : "var(--foreground-tertiary)"
                                                            }
                                                            d="M2 2C0.895431 2 0 2.89543 0 4V20C0 21.1046 0.89543 22 2 22H22C23.1046 22 24 21.1046 24 20V4C24 2.89543 23.1046 2 22 2H2ZM9.76445 11.448V15.48C8.90045 16.044 7.88045 16.356 6.74045 16.356C4.11245 16.356 2.66045 14.628 2.66045 12.072C2.66045 9.504 4.23245 7.764 6.78845 7.764C7.80845 7.764 8.66045 8.004 9.32045 8.376L9.04445 10.164C8.42045 9.768 7.68845 9.456 6.83645 9.456C5.40845 9.456 4.71245 10.512 4.71245 12.06C4.71245 13.62 5.43245 14.712 6.86045 14.712C7.31645 14.712 7.64045 14.616 7.97645 14.448V12.972H6.42845V11.448H9.76445ZM11.5481 7.92H13.6001V16.2H11.5481V7.92ZM20.4724 7.92V9.636H17.5564V11.328H19.8604V13.044H17.5564V16.2H15.5164V7.92H20.4724Z"
                                                        />
                                                    </svg>
                                                </div>
                                            </button>
                                            <motion.button
                                                onMouseEnter={() => {
                                                    setHover(3)
                                                    setEmojisPosIndex(Math.floor(Math.random() * emojisPos.length))
                                                }}
                                                onMouseLeave={() => setHover(null)}
                                                whileHover="hover"
                                            >
                                                <div className={styles.button}>
                                                    <motion.div
                                                        className={styles.emojiButton}
                                                        style={{
                                                            filter: hover === 3 ? "grayscale(0%)" : "grayscale(100%)",
                                                            backgroundPosition: `${emojisPos[emojisPosIndex].x}px ${emojisPos[emojisPosIndex].y}px`
                                                        }}
                                                        variants={scale}
                                                    >

                                                    </motion.div>
                                                </div>
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </main>
                </div>
            </div>
        </>
    );
};

Channels.getLayout = function getLayout(page) {
    return (
        <Layout>
            <NestedLayout>{page}</NestedLayout>
        </Layout>
    );
};

export default Channels;
