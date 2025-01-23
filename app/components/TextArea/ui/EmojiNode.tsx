import type { EditorConfig, LexicalNode, NodeKey, SerializedTextNode, Spread } from "lexical";
import { $applyNodeReplacement, TextNode } from "lexical";

export type SerializedEmojiNode = Spread<
    {
        className: string; // Add a custom class name for styling emojis
    },
    SerializedTextNode
>;

export class EmojiNode extends TextNode {
    __className: string;
    __emoji: string;

    // Define the node type for Lexical
    static getType(): string {
        return "emoji";
    }

    // Create a clone of the node
    static clone(node: EmojiNode): EmojiNode {
        return new EmojiNode(node.__text, node.__key);
    }

    constructor(text: string, key?: NodeKey) {
        super(text, key); // Initialize the parent TextNode
        this.__className = "emoji"; // Default class name
        this.__emoji = text; // Store the emoji text
    }

    // Create the DOM structure for this node
    createDOM(config: EditorConfig): HTMLElement {
        const dom = document.createElement("img");
        dom.className = this.getClassName(); // Apply the class name
        dom.src = `/assets/emojis/${this.__emoji}.svg`; // Use emoji image
        dom.alt = this.__emoji; // Set the alt text
        return dom;
    }

    // Update the DOM only if necessary
    updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
        const inner = dom.firstChild;
        if (inner === null) {
            return true; // Recreate DOM if the inner span is missing
        }
        super.updateDOM(prevNode, inner as HTMLElement, config); // Update inner DOM
        return false; // No further updates are needed for this node
    }

    // Import the node from a serialized JSON structure
    static importJSON(serializedNode: SerializedEmojiNode): EmojiNode {
        return $createEmojiNode(serializedNode.text).updateFromJSON(serializedNode);
    }

    // Export the node to a serialized JSON structure
    exportJSON(): SerializedEmojiNode {
        return {
            ...super.exportJSON(), // Include parent TextNode serialization
            className: this.getClassName(), // Add the class name
        };
    }

    // Get the class name of the emoji node
    getClassName(): string {
        const self = this.getLatest(); // Ensure we're working with the latest version
        return self.__className;
    }
}

// Utility function to check if a node is an EmojiNode
export function $isEmojiNode(node: LexicalNode | null | undefined): node is EmojiNode {
    return node instanceof EmojiNode;
}

// Utility function to create a new EmojiNode
export function $createEmojiNode(emojiText: string): EmojiNode {
    const node = new EmojiNode(emojiText).setMode("token"); // Set to "token" mode
    return $applyNodeReplacement(node); // Replace the node in the editor
}
