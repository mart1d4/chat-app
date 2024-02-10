import { ChannelTable, UserTable } from "./db/types";

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

export function getChannelName(
    channel: ChannelTable & {
        recipients: UserTable[];
    },
    user: UserTable
) {
    if (!channel) return "";
    if (channel.name) return channel.name;

    if (!channel.recipients) {
        console.error("Channel has no recipients");
        return "";
    }

    if (channel.recipients.length === 0) {
        console.error("Channel has no recipients");
        return "";
    } else if (channel.recipients.length === 1) {
        return `${channel.recipients[0].displayName}'s Group`;
    } else {
        let name = "";

        for (const recipient of channel.recipients) {
            if (recipient.displayName !== user.displayName) {
                name += recipient.displayName + ", ";
            }
        }

        return name.substring(0, name.length - 2);
    }
}

export function getChannelIcon(
    channel: ChannelTable & {
        recipients: UserTable[];
    },
    user: UserTable
) {
    if (!channel) return "178ba6e1-5551-42f3-b199-ddb9fc0f80de";
    if (channel.icon) return channel.icon;
    if (!channel.recipients) return "178ba6e1-5551-42f3-b199-ddb9fc0f80de";

    const recipients = channel.recipients?.filter((r) => r.id !== user.id);
    if (recipients.length === 1) return recipients[0].avatar;
    else return "178ba6e1-5551-42f3-b199-ddb9fc0f80de";
}

export function getFullChannel(
    channel: ChannelTable & {
        recipients: UserTable[];
    },
    user: UserTable
) {
    return {
        ...channel,
        name: getChannelName(channel, user),
        icon: getChannelIcon(channel, user),
    };
}
