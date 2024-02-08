import { User } from "./db/types";

export function translateCap(str: string) {
    if (typeof str !== "string") {
        throw new Error(`translateCap expected a string, but got ${typeof str}`);
    }

    return str.replace(/_/g, " ").replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
}

export function sanitizeString(content: string) {
    if (typeof content !== "string") {
        throw new Error(`sanitizeString expected a string, but got ${typeof content}`);
    }

    const trimmedChars = ["\n", "\r", "\t", "\b", " "];
    const notAllowedUnicode: string[] = [];

    for (const char of trimmedChars) {
        while (content.startsWith(char)) {
            content = content.substring(1);
        }

        while (content.endsWith(char)) {
            content = content.substring(0, content.length - 1);
        }
    }

    for (const char of notAllowedUnicode) {
        while (content.includes(char)) {
            content = content.replace(char, "");
        }
    }

    return content;
}

export function getChannelName(recipients: Partial<User>[] = [], user?: Partial<User>) {
    if (recipients.length === 0) {
        return "Error fetching recipients";
    } else if (recipients.length === 1) {
        return `${recipients[0].displayName}'s Group`;
    } else {
        let name = "";
        for (const recipient of recipients) {
            if (recipient.displayName !== user?.displayName) {
                name += recipient.displayName + ", ";
            }
        }

        return name.substring(0, name.length - 2);
    }
}

export function getRelativeDate(date: Date) {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
        return "Just now";
    } else if (minutes < 60) {
        return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    } else if (hours < 24) {
        return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    } else {
        return `${days} day${days === 1 ? "" : "s"} ago`;
    }
}

export function getChannelIcon(channel, user) {
    if (channel.icon) return channel.icon;

    const recipients = channel.recipients?.filter((recipient) => recipient.id !== user.id);
    if (recipients.length > 0) return recipients[0].avatar;
    else return "178ba6e1-5551-42f3-b199-ddb9fc0f80de";
}
