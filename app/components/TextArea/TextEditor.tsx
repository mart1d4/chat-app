"use client";

import { AutoLinkPlugin, createLinkMatcherWithRegExp } from "@lexical/react/LexicalAutoLinkPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { InlineStylePlugin } from "./plugins/InlineStylePlugin";
import EmojiPickerPlugin from "./plugins/EmojiPickerPlugin";
import NewMentionsPlugin from "./plugins/MentionsPlugin";
import { InlineStyleNode } from "./ui/InlineStyleNode";
import { EmojisPlugin } from "./plugins/EmojisPlugin";
import { $getRoot, $getSelection } from "lexical";
import { MentionNode } from "./ui/MentionNode";
import { SymbolNode } from "./ui/SymbolNode";
import { AutoLinkNode } from "@lexical/link";
import { EmojiNode } from "./ui/EmojiNode";
import { EmojiButton } from "./EmojButton";
import styles from "./Editor.module.css";
import { useEmojiPicker } from "@/store";
import { useRef, useState } from "react";

const URL_REGEX =
    /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(?<![-.+():%])/;

export function TextEditor() {
    const initialConfig = {
        namespace: "MyEditor",
        theme: {},
        onError: (error: any) => console.error(error),
        nodes: [EmojiNode, AutoLinkNode, InlineStyleNode, SymbolNode, MentionNode],
    };

    return <LexicalComposer initialConfig={initialConfig}>{component}</LexicalComposer>;
}

function Content() {
    const [text, setText] = useState("");
    const [editor] = useLexicalComposerContext();
    const placeholder = "Write something...";

    function onChange(editorState: any) {
        const editorStateJSON = editorState.toJSON();
        editorStateRef.current = editorState;
        console.log(JSON.stringify(editorStateJSON, null, 4));
        const stringifiedEditorState = JSON.stringify(editor.getEditorState().toJSON());
        const parsedEditorState = editor.parseEditorState(stringifiedEditorState);

        const editorStateTextString = parsedEditorState.read(() => $getRoot().getTextContent());
        console.log("Plain text:", editorStateTextString);
        setText(editorStateTextString);
    }

    const editorStateRef = useRef(undefined);

    const { data: pickerData, setData: setPickerData } = useEmojiPicker();
    const containerRef = useRef(null);

    return {
        editor,
        text,
        component: (
            <div className={styles.wrapper}>
                <div
                    ref={containerRef}
                    className={styles.container}
                >
                    <HistoryPlugin />
                    <AutoFocusPlugin />
                    <OnChangePlugin onChange={onChange} />
                    <AutoLinkPlugin matchers={[createLinkMatcherWithRegExp(URL_REGEX)]} />

                    <EmojisPlugin />
                    <EmojiPickerPlugin />
                    <InlineStylePlugin />
                    <NewMentionsPlugin />

                    <RichTextPlugin
                        contentEditable={
                            <div className={styles.editor}>
                                <ContentEditable
                                    aria-placeholder={placeholder}
                                    placeholder={
                                        <div className={styles.placeholder}>{placeholder}</div>
                                    }
                                />
                            </div>
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                </div>

                <div className={styles.emojiPicker}>
                    <EmojiButton
                        open={pickerData.open && pickerData.container === containerRef.current}
                        setOpen={() => {
                            setPickerData({
                                open: true,
                                container: containerRef.current,
                                placement: "top-end",
                                onClick: (emoji) => {
                                    editor.update(() => {
                                        const selection = $getSelection();
                                        if (!selection) return;

                                        selection.insertText(`:${emoji}: `);
                                    });
                                },
                            });
                        }}
                    />
                </div>
            </div>
        ),
    };
}
