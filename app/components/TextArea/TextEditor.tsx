"use client";

import { AutoLinkPlugin, createLinkMatcherWithRegExp } from "@lexical/react/LexicalAutoLinkPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { InlineStylePlugin } from "./plugins/InlineStylePlugin";
import { InlineStyleNode } from "./ui/InlineStyleNode";
import { EmojisPlugin } from "./plugins/EmojisPlugin";
import { SymbolNode } from "./ui/SymbolNode";
import { AutoLinkNode } from "@lexical/link";
import { EmojiNode } from "./ui/EmojiNode";
import styles from "./Editor.module.css";

const URL_REGEX =
    /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(?<![-.+():%])/;

export function TextEditor() {
    const placeholder = "Write something...";

    function onError(error: any) {
        console.error(error);
    }

    function onChange(editorState: any) {
        const editorStateJSON = editorState.toJSON();
        console.log(JSON.stringify(editorStateJSON, null, 4));
    }

    const initialConfig = {
        namespace: "MyEditor",
        theme: {},
        onError,
        nodes: [EmojiNode, AutoLinkNode, InlineStyleNode, SymbolNode],
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <HistoryPlugin />
            <AutoFocusPlugin />
            <AutoLinkPlugin matchers={[createLinkMatcherWithRegExp(URL_REGEX)]} />
            <EmojisPlugin />
            <OnChangePlugin onChange={onChange} />
            <InlineStylePlugin />

            <RichTextPlugin
                contentEditable={
                    <div className={styles.editor}>
                        <ContentEditable
                            aria-placeholder={placeholder}
                            placeholder={<div className={styles.placeholder}>{placeholder}</div>}
                        />
                    </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
            />
        </LexicalComposer>
    );
}
