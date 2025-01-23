import { emojiCodesWithExt } from "./emoji-codes";
import { emojiList } from "./emoji-list";
import twemoji from "twemoji";

// get emojis from folder
export const getAllCodes = () => {
    return emojiCodesWithExt.map((emoji) => emoji.replace(".svg", ""));
};

export const mostUsedEmojiCodes = [
    "2764",
    "1f602",
    "1f914",
    "1f525",
    "1f44c",
    "1f4af",
    "1f44f",
    "1f64f",
    "1f60e",
    "1f4aa",
    "1f389",
    "2728",
];

export function getNamesFromCode(code: string) {
    for (const emojiGroup of Object.values(emojiList)) {
        for (const emoji of emojiGroup) {
            if (emoji.hex === code) {
                return emoji.names;
            }
        }
    }
}

export function getCodeFromName(name: string): string | undefined {
    for (const emojiGroup of Object.values(emojiList)) {
        for (const emoji of emojiGroup) {
            if (emoji.names.includes(name)) {
                return emoji.hex;
            }
        }
    }

    return undefined;
}

export function isCorrectTwemojiHex(hex: string) {
    return emojiCodesWithExt.map((emoji) => emoji.replace(".svg", "")).includes(hex);
}

export function isCorrectEmojiName(name: string): boolean {
    return Object.values(emojiList).some((emojiGroup) =>
        emojiGroup.some((emoji) => emoji.names.includes(name))
    );
}
