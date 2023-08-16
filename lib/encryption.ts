import Cryptr from 'cryptr';

export const encryptMessage = (content: null | string) => {
    if (content) {
        const cryptr = new Cryptr(process.env.MESSAGES_SECRET as string);
        content = cryptr.encrypt(content);
    }

    return content;
};

export const decryptMessage = (content: null | string) => {
    if (content) {
        const cryptr = new Cryptr(process.env.MESSAGES_SECRET as string);
        content = cryptr.decrypt(content);
    }

    return content;
};
