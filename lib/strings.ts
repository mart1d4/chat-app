import type { AppUser, DMChannel, KnownUser } from "@/type";

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

export function getChannelName(
    channel: DMChannel & {
        recipients: KnownUser[];
    },
    user: AppUser
): string {
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

export function getChannelIcon(
    channel: DMChannel & {
        recipients: KnownUser[];
    },
    user: AppUser
): string {
    if (channel.icon || channel.type === 1) return channel.icon;

    const recipients = channel.recipients.filter((r) => r.id !== user.id);
    return recipients[0]?.avatar || "";
}

export function getFullChannel(
    channel: DMChannel & {
        recipients: KnownUser[];
    },
    user: AppUser | null
) {
    if (!user) return null;

    return {
        ...channel,
        name: getChannelName(channel, user),
        icon: getChannelIcon(channel, user),
    };
}

export function lowercaseContains(str1: string, str2: string) {
    return str1.toLowerCase().includes(str2.toLowerCase());
}
