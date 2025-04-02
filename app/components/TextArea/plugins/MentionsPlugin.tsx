"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import { $createMentionNode } from "../ui/MentionNode";
import { $createTextNode, TextNode } from "lexical";
import type { ChannelRecipient } from "@/type";
import styles from "./Plugins.module.css";
import { Avatar } from "@components";
import {
    useBasicTypeaheadTriggerMatch,
    LexicalTypeaheadMenuPlugin,
    type MenuTextMatch,
    MenuOption,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";

const PUNCTUATION = "\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%'\"~=<>_:;";
const NAME = "\\b[A-Z][^\\s" + PUNCTUATION + "]";

const DocumentMentionsRegex = {
    NAME,
    PUNCTUATION,
};

const PUNC = DocumentMentionsRegex.PUNCTUATION;

const TRIGGER = "@";

// Chars we expect to see in a mention (non-space, non-punctuation).
const VALID_CHARS = "[^" + TRIGGER + PUNC + "\\s]";

// Non-standard series of chars. Each series must be preceded and followed by
// a valid char.
const VALID_JOINS =
    "(?:" +
    "\\.[ |$]|" + // E.g. "r. " in "Mr. Smith"
    " |" + // E.g. " " in "Josh Duck"
    "[" +
    PUNC +
    "]|" + // E.g. "-' in "Salier-Hellendag"
    ")";

const LENGTH_LIMIT = 33;

const AtSignMentionsRegex = new RegExp(
    "(^|\\s|\\()(" +
        "[" +
        TRIGGER +
        "]" + // The "@" symbol
        "((?:" +
        VALID_CHARS +
        VALID_JOINS +
        "){0," + // Allows 0 or more valid characters after "@" (instead of forcing at least 1)
        LENGTH_LIMIT +
        "})?" + // Makes the entire mention part optional
        ")$"
);

// 50 is the longest alias length limit.
const ALIAS_LENGTH_LIMIT = 32;

// Regex used to match alias.
const AtSignMentionsRegexAliasRegex = new RegExp(
    "(^|\\s|\\()(" +
        "[" +
        TRIGGER +
        "]" +
        "((?:" +
        VALID_CHARS +
        "){0," +
        ALIAS_LENGTH_LIMIT +
        "})?" +
        ")$"
);

// At most, 5 suggestions are shown in the popup.
const SUGGESTION_LIST_LENGTH_LIMIT = 10;

const mentionsCache = new Map();

const dummyLookupService = {
    search(
        string: string,
        members: ChannelRecipient[],
        callback: (results: Array<string>) => void
    ): void {
        setTimeout(() => {
            const results = members
                .map((u) => u.displayName)
                .filter((mention) => mention.toLowerCase().includes(string.toLowerCase()));

            callback(results);
        }, 500);
    },
};

function useMentionLookupService(mentionString: string | null, members: ChannelRecipient[]) {
    const [results, setResults] = useState<Array<string>>([]);

    useEffect(() => {
        const cachedResults = mentionsCache.get(mentionString);

        if (mentionString == null) {
            setResults([]);
            return;
        }

        if (cachedResults === null) {
            return;
        } else if (cachedResults !== undefined) {
            setResults(cachedResults);
            return;
        }

        mentionsCache.set(mentionString, null);

        dummyLookupService.search(mentionString, members, (newResults) => {
            mentionsCache.set(mentionString, newResults);
            setResults(newResults);
        });
    }, [mentionString]);

    return results;
}

function checkForAtSignMentions(text: string, minMatchLength: number): MenuTextMatch | null {
    let match = AtSignMentionsRegex.exec(text);

    if (match === null) {
        match = AtSignMentionsRegexAliasRegex.exec(text);
    }
    if (match !== null) {
        // The strategy ignores leading whitespace but we need to know it's
        // length to add it to the leadOffset
        const maybeLeadingWhitespace = match[1];

        const matchingString = match[3] || "";
        if (matchingString.length >= minMatchLength) {
            return {
                leadOffset: match.index + maybeLeadingWhitespace.length,
                matchingString,
                replaceableString: match[2],
            };
        }
    }
    return null;
}

function getPossibleQueryMatch(text: string): MenuTextMatch | null {
    return checkForAtSignMentions(text, 0);
}

class MentionTypeaheadOption extends MenuOption {
    userId: string;
    displayName: string;

    constructor(userId: string, displayName: string) {
        super(userId);
        this.userId = userId;
        this.displayName = displayName;
    }
}

function MentionsTypeaheadMenuItem({
    index,
    isSelected,
    onClick,
    onMouseEnter,
    option,
    members,
}: {
    index: number;
    isSelected: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    option: MentionTypeaheadOption;
    members: ChannelRecipient[];
}) {
    const user = members.find((u) => u.id == option.userId);
    if (!user) return null;

    return (
        <li
            key={option.key}
            tabIndex={-1}
            className={styles.mentionContainer}
            ref={option.setRefElement}
            role="option"
            aria-selected={isSelected}
            id={"typeahead-item-" + index}
            onMouseEnter={onMouseEnter}
            onClick={onClick}
        >
            <div>
                <div className={styles.avatar}>
                    <Avatar
                        size={24}
                        type="user"
                        status="online"
                        fileId={user.avatar}
                        generateId={user.id}
                        alt={user.displayName}
                    />
                </div>

                <div className={styles.displayName}>{user.displayName}</div>
                <div className={styles.username}>{user.username}</div>
            </div>
        </li>
    );
}

export default function NewMentionsPlugin({
    members,
}: {
    members: ChannelRecipient[];
}): JSX.Element | null {
    const [editor] = useLexicalComposerContext();

    const [queryString, setQueryString] = useState<string | null>(null);

    const results = useMentionLookupService(queryString, members);

    const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
        minLength: 0,
    });

    const options = useMemo(
        () =>
            members
                .filter((m) => results.includes(m.displayName))
                .map((m) => new MentionTypeaheadOption(m.id, m.displayName))
                .slice(0, SUGGESTION_LIST_LENGTH_LIMIT),
        [results, members]
    );

    const onSelectOption = useCallback(
        (
            selectedOption: MentionTypeaheadOption,
            nodeToReplace: TextNode | null,
            closeMenu: () => void
        ) => {
            editor.update(() => {
                const mentionNode = $createMentionNode(
                    `<@${selectedOption.userId}>`,
                    selectedOption.displayName
                );

                if (nodeToReplace) {
                    nodeToReplace.replace(mentionNode);
                }

                // Insert a space after the mention
                const spaceNode = $createTextNode(" ");
                mentionNode.insertAfter(spaceNode);

                spaceNode.select();
                closeMenu();
            });
        },
        [editor]
    );

    const checkForMentionMatch = useCallback(
        (text: string) => {
            const slashMatch = checkForSlashTriggerMatch(text, editor);
            if (slashMatch !== null) {
                return null;
            }
            return getPossibleQueryMatch(text);
        },
        [checkForSlashTriggerMatch, editor]
    );

    return (
        <LexicalTypeaheadMenuPlugin<MentionTypeaheadOption>
            onQueryChange={setQueryString}
            onSelectOption={onSelectOption}
            triggerFn={checkForMentionMatch}
            options={options}
            menuRenderFn={(
                anchorElementRef,
                { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
            ) => {
                if (anchorElementRef.current && results.length) {
                    return (
                        <div className={`${styles.mentionPopover} scrollbar`}>
                            <div>
                                <h3>Members</h3>
                            </div>

                            <ul>
                                {options.map((option, i: number) => (
                                    <MentionsTypeaheadMenuItem
                                        index={i}
                                        isSelected={selectedIndex === i}
                                        onClick={() => {
                                            setHighlightedIndex(i);
                                            selectOptionAndCleanUp(option);
                                        }}
                                        onMouseEnter={() => {
                                            setHighlightedIndex(i);
                                        }}
                                        key={option.key}
                                        option={option}
                                        members={members}
                                    />
                                ))}
                            </ul>
                        </div>
                    );
                }

                return null;
            }}
        />
    );
}
