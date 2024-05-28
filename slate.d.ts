import type { ChannelRecipient } from "./type";
import { HistoryEditor } from "slate-history";
import { ReactEditor } from "slate-react";
import { BaseEditor } from "slate";

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

export type ParagraphElement = {
    type: "paragraph";
    children: CustomText[];
};

export type HeadingElement = {
    type: "heading";
    level: number;
    children: CustomText[];
};

export type MentionElement = {
    type: "mention";
    recipient: ChannelRecipient;
    children: CustomText[];
};

export type CustomElement = ParagraphElement | HeadingElement | MentionElement;

export type FormattedText = { text: string; bold?: true };

export type CustomText = FormattedText;

declare module "slate" {
    interface CustomTypes {
        Editor: CustomEditor;
        Element: CustomElement;
        Text: CustomText;
    }
}
