import { Icon, Tooltip, TooltipContent, TooltipTrigger, UserMention } from "@components";
import type { LocalMessage, ResponseMessage } from "@/type";
import SimpleMarkdown from "simple-markdown";
import styles from "../Message.module.css";
import { createElement } from "react";
import { nanoid } from "nanoid";
import hljs from "highlight.js";
import Link from "next/link";
import { getCodeFromName } from "@/lib/emojis";

export function FormatMessage({
    message,
    fixed = false,
}: {
    message: ResponseMessage | LocalMessage;
    fixed?: boolean;
}) {
    const newlineRule = {
        order: SimpleMarkdown.defaultRules.newline.order - 0.5,
        match: (source: any) => /^(\r\n|\r|\n)/.exec(source),
        parse: (capture: any) => ({ content: capture[1] }),
        react: () => <br key={nanoid()} />,
    };

    const emojiCharRule = {
        order: SimpleMarkdown.defaultRules.text.order,
        match: (source: any) => {
            const emojiRegex =
                /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;
            const match = emojiRegex.exec(source);

            if (!match || typeof match !== "string") {
                return null;
            }

            return match;
        },
        parse: (capture: any) => {
            const emoji = capture[0];
            console.log(emoji);
            return null;
            // const emojiHex = getEmojiHex(emoji);
            return { emoji };
        },
        react: (node: any, output: any, state: any) => {
            return null;
            return (
                <img
                    key={nanoid()}
                    alt={node.emoji}
                    className="emoji"
                    draggable={false}
                    src={`https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/72x72/${node.emojiHex}.png`}
                />
            );
        },
    };

    const headingRule = {
        order: SimpleMarkdown.defaultRules.heading.order,
        match: (source: any) => {
            return source.match(/^#{1,6} .+/);
        },
        parse: (capture: any) => {
            const level = capture[0].match(/^#{1,6}/)[0].length;
            const content = capture[0].slice(level + 1).trim();
            return {
                level,
                content,
            };
        },
        react: (node: any, _: any, state: any) => {
            const Tag = `h${node.level}`;
            return createElement(Tag, { key: state.key }, node.content);
        },
    };

    const emojiRule = {
        order: SimpleMarkdown.defaultRules.text.order - 0.5,
        match: (source: any) => /^:([a-zA-Z0-9_]+):/.exec(source),
        parse: (capture: any) => ({ name: capture[1], id: capture[2] }),
        react: (node: any) => {
            const hex = getCodeFromName(node.name);

            if (!hex) {
                return <span key={nanoid()}>{node.name}</span>;
            }

            return (
                <img
                    key={nanoid()}
                    alt={node.name}
                    className="emoji"
                    draggable={false}
                    src={`https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/72x72/${hex}.png`}
                />
            );
        },
    };

    const codeBlockRule = {
        match: SimpleMarkdown.blockRegex(/^```([\s\S]*?)```/),
        parse: (capture: any) => ({ content: capture[1] }),
        react: function (node: any) {
            const id = nanoid();
            const content = node.content.replace(/^[^\n]*\n/, "").replace(/\n[^\n]*$/, "");

            let language = node.content
                .match(/^[^\n]*\n/)?.[0]
                .replace(/^```/, "")
                .trim();

            return (
                <pre key={nanoid()}>
                    <code
                        className={`language-${language}`}
                        ref={(el) => {
                            if (el) hljs.highlightElement(el);
                        }}
                    >
                        {content}
                    </code>

                    <Tooltip>
                        <TooltipTrigger>
                            <button
                                type="button"
                                className={styles.copyCodeSnippet}
                                onClick={() => {
                                    try {
                                        navigator.clipboard.writeText(content);
                                        const el = document.getElementById(
                                            `copy-code-snippet-${id}`
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
                            <span id={`copy-code-snippet-${id}`}>Copy Code Snippet</span>
                        </TooltipContent>
                    </Tooltip>
                </pre>
            );
        },
    };

    const spoilerRule = {
        order: SimpleMarkdown.defaultRules.blockQuote.order + 0.5,
        match: (source: any) => /^\|\|([\s\S]+?)\|\|/.exec(source),
        parse: (capture: any, parse: any, state: any) => ({ content: parse(capture[1], state) }),
        react: (node: any, output: any) => {
            console.log(node);
            return (
                <span
                    key={nanoid()}
                    className={styles.spoiler}
                    onClick={(e) => e.currentTarget.classList.add(styles.display)}
                >
                    <span>{output(node.content)}</span>
                </span>
            );
        },
    };

    const userMentionRule = {
        order: SimpleMarkdown.defaultRules.text.order - 0.5,
        match: (source: any) => /^<@!?(\d+)>/.exec(source),
        parse: (capture: any) => ({ id: capture[1] }),
        react: (node: any) => {
            console.log("Message", message);
            const user = message.mentions?.find((u) => u.id === parseInt(node.id));

            return (
                <UserMention
                    full
                    fixed={fixed}
                    key={nanoid()}
                    user={user || { id: parseInt(node.id), displayName: "Unknown User" }}
                />
            );
        },
    };

    const linkRule = {
        ...SimpleMarkdown.defaultRules.link,
        react: (node: any, output: any, state: any) => (
            <Link
                key={nanoid()}
                target="_blank"
                href={node.target}
                rel="noopener noreferrer"
                className={styles.messageLink}
                style={{ color: "error" in message && message.error ? "var(--error-1)" : "" }}
            >
                {output(node.content, state)}
            </Link>
        ),
    };

    const rules = {
        ...SimpleMarkdown.defaultRules,
        spoiler: spoilerRule,
        userMention: userMentionRule,
        link: linkRule,
        codeBlock: codeBlockRule,
        emoji: emojiRule,
        heading: headingRule,
        emojiChar: emojiCharRule,
        newline: newlineRule,
        text: {
            ...SimpleMarkdown.defaultRules.text,
            match: SimpleMarkdown.anyScopeRegex(
                new RegExp(
                    SimpleMarkdown.defaultRules.text.match.regex.source.replace("?=", "?=\n|\r|")
                )
            ),
        },
    };

    const parser = SimpleMarkdown.parserFor(rules);
    const reactOutput = SimpleMarkdown.outputFor(rules, "react");

    const syntaxTree = parser(message.content);
    return <div>{reactOutput(syntaxTree)}</div>;
}
