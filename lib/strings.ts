export const translateCap = (str?: string) => {
    if (!str) {
        return '';
    }

    return str.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
};

export const trimMessage = (message: string) => {
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
