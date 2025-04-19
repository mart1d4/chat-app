import type { Channel, LocalMessage, ResponseMessage } from "@/type";
import Markdown, { RuleType } from "markdown-to-jsx";
import { Fragment, useEffect, useRef, type Key } from "react";
import { emojiCodes } from "@/lib/emoji-codes";
import styles from "../Message.module.css";
import { nanoid } from "nanoid";
import hljs from "highlight.js";
import Image from "next/image";
import Link from "next/link";
import {
    TooltipContent,
    TooltipTrigger,
    UserMention,
    MenuTrigger,
    UserMenu,
    Tooltip,
    Icon,
    Menu,
} from "@components";

export function FormatMessage({
    message,
    channel,
    reference = false,
}: {
    message: ResponseMessage | LocalMessage;
    channel: Channel;
    reference?: boolean;
}) {
    const isEmojiOnly = isEmojiOnlyMessage(message.content) && !reference;

    return (
        <span style={{ whiteSpace: "pre-wrap" }}>
            <Markdown
                children={addnewlines(message.content)}
                options={{
                    forceBlock: true,
                    disableParsingRawHTML: true,
                    overrides: {
                        // code: SyntaxHighlightedCode,
                        pre: SyntaxHighlightedCode,
                        a: {
                            component: LinkElement,
                            props: { message },
                        },
                    },
                    renderRule(next, node, renderChildren, state) {
                        if (node?.type === RuleType.text) {
                            const text = node.text;

                            // Regex for emojis and mentions
                            const emojiRegex = /:([a-zA-Z0-9_]+|[a-fA-F0-9]+(?:-[a-fA-F0-9]+)*):/g;
                            const mentionRegex = /<@([a-zA-Z0-9_]+)>/g;
                            const spoilerRegex = /\|\|([\s\S]+?)\|\|/g;

                            if (spoilerRegex.test(text)) {
                                console.log("Spoiler detected:", text);

                                const parts = [];
                                let lastIndex = 0;

                                text.replace(spoilerRegex, (match, spoilerContent, index) => {
                                    // Push the text before the spoiler
                                    if (index > lastIndex) {
                                        parts.push(text.slice(lastIndex, index));
                                    }

                                    // Push the spoiler content wrapped in a Spoiler component
                                    parts.push(
                                        <span
                                            className={styles.spoiler}
                                            key={state.key || nanoid()}
                                            onClick={(e) =>
                                                e.currentTarget.classList.add(styles.display)
                                            }
                                        >
                                            <span>{renderChildren(spoilerContent, state)}</span>
                                        </span>
                                    );

                                    lastIndex = index + match.length;
                                    return match;
                                });

                                // Push the remaining text after the last spoiler
                                if (lastIndex < text.length) {
                                    parts.push(text.slice(lastIndex));
                                }

                                // Return the parts as a React fragment
                                return <>{parts}</>;
                            }

                            // Combined regex to match both emojis and mentions
                            const combinedRegex = new RegExp(
                                `${emojiRegex.source}|${mentionRegex.source}`,
                                "g"
                            );

                            // Split the text into parts based on matches
                            const parts = [];
                            let lastIndex = 0;

                            text.replace(combinedRegex, (match, emoji, mention, index) => {
                                // Push the text before the match
                                if (index > lastIndex) {
                                    parts.push(text.slice(lastIndex, index));
                                }

                                // Push the matched emoji or mention
                                if (emoji) {
                                    parts.push(
                                        Emoji({
                                            code: emoji,
                                            reference,
                                            isEmojiOnly,
                                            key: state.key,
                                        })
                                    );
                                } else if (mention) {
                                    parts.push(
                                        Mention({
                                            channel,
                                            key: state.key,
                                            userId: mention,
                                            mentions: message.mentions,
                                        })
                                    );
                                }

                                lastIndex = index + match.length;
                                return match;
                            });

                            // Push the remaining text after the last match
                            if (lastIndex < text.length) {
                                parts.push(text.slice(lastIndex));
                            }

                            // Return the parts as a React fragment
                            return <>{parts}</>;
                        }

                        return next();
                    },
                }}
            />
        </span>
    );
}

function isEmojiOnlyMessage(message: string) {
    // Regex to match individual emojis (your provided regex)
    const emojiRegex = /^(:([a-zA-Z0-9_]+|[a-fA-F0-9]+(?:-[a-fA-F0-9]+)*):\s*)+$/g;

    // Match all emojis in the string
    const matches = message.match(emojiRegex);

    // Check if the string contains only emojis and at most 5 of them
    return !!matches && matches.length <= 30 && matches.join("") === message;
}

function LinkElement(props: any) {
    const hasError = "error" in props.message && props.message.error;

    return (
        <Link
            key={nanoid()}
            target="_blank"
            href={props.href}
            rel="noopener noreferrer"
            className={styles.messageLink}
            style={{ color: hasError ? "var(--danger-0)" : "" }}
        >
            {props.href}
        </Link>
    );
}

function Emoji({
    key,
    code,
    reference,
    isEmojiOnly,
}: {
    key?: Key;
    code: string;
    reference?: boolean;
    isEmojiOnly?: boolean;
}) {
    const emoji = `:${code}:`;

    if (!emojiCodes.includes(code)) {
        return <span key={nanoid()}>{emoji}</span>;
    }

    return (
        <Tooltip
            delay={500}
            key={key || nanoid()}
            show={reference ? false : undefined}
        >
            <TooltipTrigger>
                <Image
                    alt={emoji}
                    className="emoji"
                    draggable={false}
                    width={reference ? 18 : isEmojiOnly ? 48 : 22}
                    height={reference ? 18 : isEmojiOnly ? 48 : 22}
                    style={{ marginBottom: reference ? "-3px" : undefined }}
                    src={`https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/72x72/${code}.png`}
                />
            </TooltipTrigger>

            <TooltipContent>
                <div>
                    <p style={{ textAlign: "center" }}>{emoji}</p>
                    <span style={{ color: "var(--fg-4)" }}>Click to learn more</span>
                </div>
            </TooltipContent>
        </Tooltip>
    );
}

function Mention({
    key,
    userId,
    channel,
    mentions,
}: {
    key?: Key;
    userId: string;
    channel: Channel;
    mentions: ResponseMessage["mentions"];
}) {
    const user = mentions?.find((u) => u.id === parseInt(userId));

    return (
        <span
            key={key || nanoid()}
            onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            <Menu
                positionOnClick
                openOnRightClick
                placement="bottom-start"
            >
                <MenuTrigger>
                    <span>
                        <UserMention
                            full
                            user={user || { id: parseInt(userId), displayName: "unknown-user" }}
                        />
                    </span>
                </MenuTrigger>

                {user && (
                    <UserMenu
                        user={user}
                        type="author"
                        channelType={channel.type}
                    />
                )}
            </Menu>
        </span>
    );
}

function SyntaxHighlightedCode(props: any) {
    const ref = useRef<HTMLPreElement | null>(null);

    useEffect(() => {
        const childProps = props.children?.props || {};

        if (ref.current && childProps.className?.includes("lang-") && hljs) {
            hljs.highlightElement(ref.current.children[0] as HTMLElement);

            // hljs won't reprocess the element unless this attribute is removed
            ref.current.children[0].removeAttribute("data-highlighted");
        }
    }, [props.children]);

    return (
        <pre
            ref={ref}
            key={nanoid()}
        >
            <Fragment {...props} />

            <Tooltip>
                <TooltipTrigger>
                    <button
                        type="button"
                        className={styles.copyCodeSnippet}
                        onClick={() => {
                            try {
                                navigator.clipboard.writeText(props.children as string);
                                const el = document.getElementById(
                                    `copy-code-snippet-${props.id}`
                                )!;
                                el.innerText = "Copied!";
                                setTimeout(() => {
                                    el.innerText = "Copy Code Snippet";
                                }, 2000);
                            } catch (e) {
                                console.error(e);
                            }
                        }}
                    >
                        <Icon
                            size={20}
                            name="copy"
                        />
                    </button>
                </TooltipTrigger>

                <TooltipContent>
                    <span id={`copy-code-snippet-${props.id}`}>Copy Code Snippet</span>
                </TooltipContent>
            </Tooltip>
        </pre>
    );
}

export function addnewlines(text: string): string {
    const newText = text.replace(/\n\n/g, "\n​\n");
    return newText;
}
