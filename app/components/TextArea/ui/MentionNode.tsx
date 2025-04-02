import styles from "../plugins/Plugins.module.css";
import {
    type DOMConversionOutput,
    type SerializedTextNode,
    $applyNodeReplacement,
    type DOMConversionMap,
    type DOMExportOutput,
    type EditorConfig,
    type LexicalNode,
    type NodeKey,
    type Spread,
    TextNode,
} from "lexical";

export type SerializedMentionNode = Spread<
    {
        text: string;
        displayName: string;
    },
    SerializedTextNode
>;

function $convertMentionElement(domNode: HTMLElement): DOMConversionOutput | null {
    const textContent = domNode.textContent;
    const displayName = domNode.getAttribute("data-lexical-mention-name");

    if (displayName && textContent) {
        const node = $createMentionNode(textContent, displayName);
        return { node };
    }

    return null;
}

export class MentionNode extends TextNode {
    __displayName: string;

    constructor(text: string, displayName: string, key?: NodeKey) {
        super(text, key);
        this.__displayName = displayName;
    }

    static getType(): string {
        return "mention";
    }

    static clone(node: MentionNode): MentionNode {
        return new MentionNode(node.__text, node.__displayName, node.__key);
    }

    static importJSON(serializedNode: SerializedMentionNode): MentionNode {
        return $createMentionNode(serializedNode.text, serializedNode.displayName).updateFromJSON(
            serializedNode
        );
    }

    exportJSON(): SerializedMentionNode {
        return {
            ...super.exportJSON(),
            text: this.__text,
            displayName: this.__displayName,
        };
    }

    createDOM(_: EditorConfig): HTMLElement {
        const dom = document.createElement("span");

        dom.innerText = `@${this.__displayName}`;
        dom.className = styles.mention;
        dom.spellcheck = false;

        return dom;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement("span");
        element.setAttribute("data-lexical-mention", "true");

        if (this.__text !== this.__text) {
            element.setAttribute("data-lexical-mention-name", this.__displayName);
        }

        element.textContent = this.__text;
        return { element };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            span: (domNode: HTMLElement) => {
                if (!domNode.hasAttribute("data-lexical-mention")) {
                    return null;
                }

                return {
                    conversion: $convertMentionElement,
                    priority: 1,
                };
            },
        };
    }

    isTextEntity(): true {
        return true;
    }

    canInsertTextBefore(): boolean {
        return false;
    }

    canInsertTextAfter(): boolean {
        return false;
    }
}

export function $createMentionNode(text: string, displayName: string): MentionNode {
    const mentionNode = new MentionNode(text, displayName);
    mentionNode.setMode("token");
    return $applyNodeReplacement(mentionNode);
}

export function $isMentionNode(node: LexicalNode | null | undefined): node is MentionNode {
    return node instanceof MentionNode;
}
