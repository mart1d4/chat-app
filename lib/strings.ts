export const translateCap = (str?: string) => {
    if (!str) {
        return '';
    }

    return str.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
};

export const trimMessage = (message: string) => {
    if (!message) {
        return null;
    }

    const notAllowedUnicode: string[] = [];

    while (message.startsWith('\n')) {
        message = message.substring(1);
    }

    while (message.endsWith('\n')) {
        message = message.substring(0, message.length - 1);
    }

    for (const char of notAllowedUnicode) {
        while (message.includes(char)) {
            message = message.replace(char, '');
        }
    }

    return message;
};

export const getChannelName = (channel: TChannel, userId: TUser['id']): string => {
    let name;

    if (!channel) {
        return '';
    }

    if (channel.type === 'DM') {
        const user = channel.recipients.find((user) => user.id !== userId) as TUser;
        name = user.username;
    } else if (channel.type === 'GROUP_DM' && !channel.name) {
        if (channel.recipients.length > 1) {
            const filtered = channel.recipients.filter((user) => user.id !== userId);
            name = filtered.map((user) => user.username).join(', ');
        } else {
            name = `${channel.recipients[0].username}'s Group`;
        }
    } else {
        name = channel.name as string;
    }

    return name;
};

export const getRelativeDate = (timestamp: Date, hours?: boolean) => {
    // If date is earlier than 2 days, return a relative date like 'Yesterday at 10:00 AM'
    // Otherwise, return a date like '10/15/2020 10:00 AM'
    // If hours is true, the relative date should display like '10 hours ago'

    const date = new Date(timestamp);

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffInDays = diff / (1000 * 3600 * 24);
    const diffInHours = diff / (1000 * 3600);

    if (diffInDays < 2) {
        if (hours) {
            return `${Math.round(diffInHours)} hours ago`;
        }

        const options = { hour: 'numeric', minute: 'numeric', hour12: true };
        return `Yesterday at ${date.toLocaleString('en-US', options)}`;
    }

    const options = {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    };
    return date.toLocaleString('en-US', options);
};
