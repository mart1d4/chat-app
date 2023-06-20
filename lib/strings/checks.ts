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
