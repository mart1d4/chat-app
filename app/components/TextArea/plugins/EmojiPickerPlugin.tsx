"use client";

import { $createTextNode, $getSelection, $isRangeSelection, TextNode } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useMemo, useState } from "react";
import { emojiList } from "@/lib/emoji-list";
import styles from "./Plugins.module.css";
import Image from "next/image";
import {
    useBasicTypeaheadTriggerMatch,
    LexicalTypeaheadMenuPlugin,
    MenuOption,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";

const MAX_EMOJI_SUGGESTION_COUNT = 10;

class EmojiOption extends MenuOption {
    hex: string;
    names: string[];
    hasStyles: boolean;

    constructor(hex: string, names: string[], hasStyles: boolean) {
        super(hex);
        this.hex = hex;
        this.names = names;
        this.hasStyles = hasStyles;
        this.setRefElement = this.setRefElement.bind(this);
    }
}

function EmojiMenuItem({
    index,
    isSelected,
    onClick,
    onMouseEnter,
    option,
}: {
    index: number;
    isSelected: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    option: EmojiOption;
}) {
    return (
        <li
            role="option"
            tabIndex={-1}
            key={option.hex}
            onClick={onClick}
            ref={option.setRefElement}
            aria-selected={isSelected}
            onMouseEnter={onMouseEnter}
            id={"typeahead-item-" + index}
            className={`${styles.mentionContainer} ${styles.small}`}
        >
            <div>
                <Image
                    width={20}
                    height={20}
                    alt={option.hex}
                    src={`/assets/emojis/${option.hex}.svg`}
                />
                <div className={styles.displayName}>{option.names.join(" ")}</div>
            </div>
        </li>
    );
}

export default function EmojiPickerPlugin() {
    const [search, setSearch] = useState<string | null>(null);
    const [editor] = useLexicalComposerContext();

    const emojis = Object.values(emojiList).flat();

    const checkForTriggerMatch = useBasicTypeaheadTriggerMatch(":", {
        minLength: 2,
    });

    const options: EmojiOption[] = useMemo(() => {
        return emojis
            .filter((e) => (search !== null ? e.names.some((n) => n.includes(search)) : true))
            .slice(0, MAX_EMOJI_SUGGESTION_COUNT)
            .map((e) => new EmojiOption(e.hex, e.names, e.hasStyles));
    }, [emojis, search]);

    const onSelectOption = useCallback(
        (selectedOption: EmojiOption, nodeToRemove: TextNode | null, closeMenu: () => void) => {
            editor.update(() => {
                const selection = $getSelection();

                if (!$isRangeSelection(selection) || selectedOption == null) {
                    return;
                }

                if (nodeToRemove) {
                    nodeToRemove.remove();
                }

                selection.insertNodes([$createTextNode(`:${selectedOption.hex}:`)]);
                closeMenu();
            });
        },
        [editor]
    );

    return (
        <LexicalTypeaheadMenuPlugin
            onQueryChange={setSearch}
            onSelectOption={onSelectOption}
            triggerFn={checkForTriggerMatch}
            options={options}
            menuRenderFn={(_, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }) => {
                if (!options.length) {
                    return null;
                }

                return (
                    <div className={`${styles.mentionPopover} scrollbar`}>
                        <div>
                            <h3>Emoji Matching :{search}</h3>
                        </div>

                        <ul>
                            {options.map((option, index) => (
                                <EmojiMenuItem
                                    index={index}
                                    option={option}
                                    key={option.hex}
                                    isSelected={selectedIndex === index}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                    onClick={() => {
                                        setHighlightedIndex(index);
                                        selectOptionAndCleanUp(option);
                                    }}
                                />
                            ))}
                        </ul>
                    </div>
                );
            }}
        />
    );
}
