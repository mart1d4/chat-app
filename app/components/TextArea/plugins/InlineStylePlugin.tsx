"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createInlineStyleNode, InlineStyleNode } from "../ui/InlineStyleNode";
import { $createSymbolNode, SymbolNode } from "../ui/SymbolNode";
import { TextNode, type LexicalEditor } from "lexical";
import { useEffect } from "react";

const SYMBOL_ELEMENTS = {
    "*": "em",
    "**": "strong",
    ">": "q",
    "`": "code",
    __: "u",
    "~~": "s",
};

function $findAndTransformInlineStyle(node: TextNode): null | TextNode {
    const text = node.getTextContent();

    // Check for specific inline styles like bold (e.g., **bold** or *italic*)
    const match = text.match(/(\*\*|\*|>)([^\*\*|*|>]+)(\*\*|\*|>)/);

    if (match !== null) {
        const startSymbol = match[1] as keyof typeof SYMBOL_ELEMENTS; // Beginning symbol
        const content = match[2]; // Text inside the symbols
        const endSymbol = match[3]; // Ending symbol

        // Create nodes for symbols and inline content
        const startSymbolNode = $createSymbolNode(startSymbol);
        const inlineStyleNode = $createInlineStyleNode(content, SYMBOL_ELEMENTS[startSymbol]); // Type based on start symbol
        const endSymbolNode = $createSymbolNode(endSymbol);

        // Split and transform the nodes as needed
        let beforeNode: TextNode | null = null;
        let targetNode: TextNode | null = null;
        let afterNode: TextNode | null = null;

        const matchStart = match.index!;
        const matchEnd = matchStart + match[0].length;

        if (matchStart > 0) {
            [beforeNode, targetNode] = node.splitText(matchStart);
        } else {
            targetNode = node;
        }

        if (matchEnd < text.length) {
            [targetNode, afterNode] = targetNode!.splitText(matchEnd - matchStart);
        }

        targetNode!.replace(startSymbolNode);
        startSymbolNode.insertAfter(inlineStyleNode);
        inlineStyleNode.insertAfter(endSymbolNode);

        if (afterNode) {
            endSymbolNode.insertAfter(afterNode);
        }

        inlineStyleNode.selectNext();
        return inlineStyleNode;
    }

    return null;
}

function $textNodeTransform(node: TextNode): void {
    let targetNode: TextNode | null = node;

    while (targetNode !== null) {
        if (!targetNode.isSimpleText()) {
            return;
        }

        targetNode = $findAndTransformInlineStyle(targetNode);
    }
}

function useInlineStyles(editor: LexicalEditor): void {
    useEffect(() => {
        if (!editor.hasNodes([InlineStyleNode, SymbolNode])) {
            throw new Error(
                "InlineStylePlugin: InlineStyleNode or SymbolNode not registered on editor"
            );
        }

        return editor.registerNodeTransform(TextNode, $textNodeTransform);
    }, [editor]);
}

export function InlineStylePlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    useInlineStyles(editor);
    return null;
}
