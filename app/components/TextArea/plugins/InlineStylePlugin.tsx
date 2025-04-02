"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, ElementNode, TextNode, type LexicalEditor } from "lexical";
import { useEffect } from "react";

type Format = "italic" | "bold" | "underline" | "strikethrough" | "code";

const matches: {
    [key: string]: {
        format: Format[];
        regexp: RegExp;
        numOfChars: number;
        style?: string;
    };
} = {
    italic: {
        format: ["italic"],
        regexp: /\*([^*]+)\*/,
        numOfChars: 2,
    },
    bold: {
        format: ["bold"],
        regexp: /\*\*([^*]+)\*\*/,
        numOfChars: 4,
    },
    italicAndBold: {
        format: ["italic", "bold"],
        regexp: /\*\*\*([^*]+)\*\*\*/,
        numOfChars: 6,
    },
    underline: {
        format: ["underline"],
        regexp: /__([^_]+)__/,
        numOfChars: 4,
        style: "text-decoration: underline",
    },
    strikethrough: {
        format: ["strikethrough"],
        regexp: /~~([^~]+)~~/,
        numOfChars: 4,
        style: "text-decoration: line-through",
    },
    code: {
        format: ["code"],
        regexp: /`([^`]+)`/,
        numOfChars: 2,
    },
};

function $findAndTransformInlineStyle(node: TextNode): null | ElementNode {
    return null;
    // const parent = node?.getParent();
    // if (!parent || !parent.getChildren().length) return null;

    // const textNodes = parent.getChildren();
    // if (!textNodes.length) return null;

    // let fullText = textNodes.map((n) => n.getTextContent()).join("");

    // // Get the RangeSelection for each match, and use the formatText method on that range
    // // to apply the inline style
    // Object.keys(matches).forEach((key) => {
    //     const { regexp, numOfChars, format, style } = matches[key];

    //     let match: RegExpExecArray | null;

    //     while ((match = regexp.exec(fullText))) {
    //         const [fullMatch, text] = match;
    //         const start = match.index;
    //         const end = start + fullMatch.length;

    //         const range = node.
    //         range.formatText(format, style);

    //         // Remove the match from the text
    //         fullText = fullText.slice(0, start) + fullText.slice(end);
    //     }
    // });
}

function $paragraphNodeTransform(node: TextNode): void {
    let targetNode: TextNode | null = node;

    while (targetNode !== null) {
        targetNode = $findAndTransformInlineStyle(targetNode);
    }
}

function useInlineStyles(editor: LexicalEditor): void {
    useEffect(() => {
        return editor.registerNodeTransform(TextNode, $paragraphNodeTransform);
    }, [editor]);
}

export function InlineStylePlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    useInlineStyles(editor);
    return null;
}
