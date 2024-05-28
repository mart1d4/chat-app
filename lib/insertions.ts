import { customAlphabet } from "nanoid";

export function getNanoId() {
    return customAlphabet("123456789ABCDEFGHJKLMNPQRSTUVWXYZ.", 12)();
}

export function getNanoIdInt(): number {
    return parseInt(customAlphabet("1234567890", 12)());
}
