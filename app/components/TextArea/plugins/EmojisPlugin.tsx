"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { getCodeFromName, isCorrectEmojiName } from "@/lib/emojis";
import { $createEmojiNode, EmojiNode } from "../ui/EmojiNode";
import type { LexicalEditor } from "lexical";
import { TextNode } from "lexical";
import { useEffect } from "react";

function $findAndTransformEmoji(node: TextNode): null | TextNode {
    const text = node.getTextContent();

    // If text contains an emoji (e.g. :smile: or :flag_us:), replace it with an EmojiNode
    const emojiMatch = text.match(/:[a-z_]+:/);

    if (emojiMatch !== null && isCorrectEmojiName(emojiMatch[0])) {
        const hex = getCodeFromName(emojiMatch[0]);
        if (!hex) return null;

        const emojiNode = $createEmojiNode(hex);

        // Get start and end index of the match
        const matchStart = emojiMatch.index!;
        const matchEnd = matchStart + emojiMatch[0].length;

        // Split the node to isolate the emoji text
        let beforeNode: TextNode | null = null;
        let targetNode: TextNode | null = null;
        let afterNode: TextNode | null = null;

        if (matchStart > 0) {
            [beforeNode, targetNode] = node.splitText(matchStart);
        } else {
            targetNode = node;
        }

        if (matchEnd < text.length) {
            [targetNode, afterNode] = targetNode!.splitText(matchEnd - matchStart);
        }

        // Replace the targetNode (matched text) with the emojiNode
        targetNode!.replace(emojiNode);

        // Reattach afterNode (text following the emoji) if it exists
        if (afterNode) {
            emojiNode.insertAfter(afterNode);
        }

        emojiNode.selectNext();

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
