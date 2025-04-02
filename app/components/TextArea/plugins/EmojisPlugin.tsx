"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { getCodeFromName, isCorrectEmojiHex, isCorrectEmojiName } from "@/lib/emojis";
import { $createEmojiNode, EmojiNode } from "../ui/EmojiNode";
import type { LexicalEditor } from "lexical";
import { TextNode } from "lexical";
import { useEffect } from "react";

function $findAndTransformEmoji(node: TextNode): null | TextNode {
    const text = node.getTextContent();
    const emojiMatch = text.match(/:[a-z0-9_-]+:/);

    if (emojiMatch !== null) {
        const match = emojiMatch[0];
        const index = emojiMatch.index || 0;

        const correctName = isCorrectEmojiName(match);
        const correctHex = isCorrectEmojiHex(match.replace(/:/g, ""));

        if (!correctName && !correctHex) return null;

        const hex = correctHex ? match.replace(/:/g, "") : getCodeFromName(match);
        if (!hex) return null;

        const textbefore = text.substring(0, index);
        const nodes = node.splitText(index, index + match.length) || [null, null];
        const targetNode = textbefore ? nodes[1] : nodes[0];

        const emojiNode = $createEmojiNode(`:${hex}:`);
        targetNode.replace(emojiNode);

        const nextSibling = emojiNode.getNextSibling();

        if (nextSibling && nextSibling.getType() === "emoji") {
            // Need to figure out a way to put cursor after
            console.info("Need to figure out a way to put cursor after");
            emojiNode.select(match.length, match.length);
        } else {
            emojiNode.selectNext(0, 0);
        }

        return emojiNode;
    }

    return null;
}

function $textNodeTransform(node: TextNode): void {
    let targetNode: TextNode | null = node;

    while (targetNode !== null) {
        if (!targetNode.isSimpleText()) {
            return;
        }

        targetNode = $findAndTransformEmoji(targetNode);
    }
}

function useEmojis(editor: LexicalEditor): void {
    useEffect(() => {
        if (!editor.hasNodes([EmojiNode])) {
            throw new Error("EmojisPlugin: EmojiNode not registered on editor");
        }

        return editor.registerNodeTransform(TextNode, $textNodeTransform);
    }, [editor]);
}

export function EmojisPlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    useEmojis(editor);
    return null;
}
