"use client";

import { type NodeKey, type SerializedTextNode, type Spread, TextNode } from "lexical";
import styles from "../Editor.module.css";

export type SerializedInlineStyleNode = Spread<
    {
        styleType: string; // Style type like bold, italic, etc.
    },
    SerializedTextNode
>;

export class InlineStyleNode extends TextNode {
    __transformed: boolean;
    __styleType: string;
    __text: string;

    static getType(): string {
        return "inlineStyle";
    }

    static clone(node: InlineStyleNode): InlineStyleNode {
        const clone = new InlineStyleNode(node.__text, node.__styleType, node.__key);
        clone.__transformed = node.__transformed; // Preserve transformation state
        return clone;
    }

    constructor(text: string, styleType: string, key?: NodeKey) {
        super(text, key);
        this.__transformed = false;
        this.__text = text;
        this.__styleType = styleType;
    }

    createDOM(): HTMLElement {
        const dom = document.createElement(this.__styleType); // Create element based on the style
        dom.className = styles[this.__styleType];
        dom.textContent = this.__text; // Set the styled text
        return dom;
    }

    updateDOM(): false {
        return false; // Prevent DOM updates
    }

    static importJSON(serializedNode: SerializedInlineStyleNode): InlineStyleNode {
        return new InlineStyleNode(serializedNode.text, serializedNode.styleType);
    }

    exportJSON(): SerializedInlineStyleNode {
        return {
            ...super.exportJSON(),
            styleType: this.__styleType,
        };
    }
}

export function $createInlineStyleNode(text: string, styleType: string): InlineStyleNode {
    return new InlineStyleNode(text, styleType);
}

export function $isInlineStyleNode(node: any): node is InlineStyleNode {
    return node instanceof InlineStyleNode;
}
