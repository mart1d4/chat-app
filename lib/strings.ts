import type { Channel, User } from "@/type";

export function translateCap(str: string) {
    if (typeof str !== "string") {
        console.error(`translateCap expected a string, but got ${typeof str}`);
        return "";
    }

    return str.replace(/_/g, " ").replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
}

export function sanitizeString(content: string) {
    if (typeof content !== "string") {
        console.error(`sanitizeString expected a string, but got ${typeof content}`);
        return "";
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

export function getChannelName(channel: Channel, user: User) {
    if (channel.name) return channel.name;

    if (channel.recipients.length === 1) {
        return `${channel.recipients[0].displayName}'s Group`;
    } else {
        let name = "";

        for (const recipient of channel.recipients) {
            if (recipient.id !== user.id) {
                name += recipient.displayName + ", ";
            }
        }

        return name.substring(0, name.length - 2);
    }
}

export function getChannelIcon(channel: Channel, user: User) {
    if (channel.icon) return channel.icon;

    const recipients = channel.recipients.filter((r) => r.id !== user.id);
    return recipients[0].avatar;
}

export function getFullChannel(channel: Channel, user: User) {
    return {
        ...channel,
        name: getChannelName(channel, user),
        icon: getChannelIcon(channel, user),
    };
}

export function lowercaseContains(str1: string, str2: string) {
    return str1.toLowerCase().includes(str2.toLowerCase());
}
