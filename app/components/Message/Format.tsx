import SimpleMarkdown from "simple-markdown";
import styles from "./Message.module.css";
import { UserMention } from "./Mention";
import type { Message } from "@/type";
import { nanoid } from "nanoid";
import Link from "next/link";

export function FormatMessage({ message, fixed = false }: { message: Message; false?: boolean }) {
    const spoilerRule = {
        order: SimpleMarkdown.defaultRules.em.order - 0.5,
        match: (source) => /^\|\|([\s\S]+?)\|\|/.exec(source),
        parse: (capture, parse, state) => ({ content: parse(capture[1], state) }),
        react: (node, output) => (
            <span
                key={nanoid()}
                className={styles.spoiler}
                onClick={(e) => e.currentTarget.classList.add(styles.display)}
            >
                <span>{output(node.content)}</span>
            </span>
        ),
    };

    const userMentionRule = {
        order: SimpleMarkdown.defaultRules.text.order - 0.5,
        match: (source) => /^<@!?(\d+)>/.exec(source),
        parse: (capture) => ({ id: capture[1] }),
        react: (node) => {
            const user = message.mentions?.find((u) => u.id === parseInt(node.id));
            return (
                <UserMention
                    key={nanoid()}
                    user={user || { id: parseInt(node.id), displayName: "Unknown User" }}
                    full={true}
                    fixed={fixed}
                />
            );
        },
    };

    const linkRule = {
        ...SimpleMarkdown.defaultRules.link,
        react: (node, output, state) => (
            <Link
                key={nanoid()}
                href={node.target}
                key={`${message.id}-link-${state.key}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.messageLink}
                style={{ color: message.error ? "var(--error-1)" : "" }}
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
    };

    const parser = SimpleMarkdown.parserFor(rules);
    const reactOutput = SimpleMarkdown.outputFor(rules, "react");

    const syntaxTree = parser(message.content);
    return <div>{reactOutput(syntaxTree)}</div>;
}
