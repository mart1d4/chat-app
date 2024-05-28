import type { Message } from "@/type";

export function isInline(type: number) {
    return [2, 3, 4, 5, 6, 7, 8, 9].includes(type);
}

export function isMoreThan5Minutes(firstDate: Date, secondDate: Date) {
    const diff = Math.abs(new Date(firstDate).getTime() - new Date(secondDate).getTime());
    return diff / (1000 * 60) >= 5;
}

export function isLarge(messages: Message[], index: number) {
    if (index === 0 || messages[index].type === 1) return true;

    if (isInline(messages[index].type)) {
        if (isInline(messages[index - 1].type)) return false;
        return true;
    }

    if (![0, 1].includes(messages[index - 1].type)) return true;

    if (messages[index - 1].author.id !== messages[index].author.id) return true;
    if (isMoreThan5Minutes(messages[index - 1].createdAt, messages[index].createdAt)) return true;

    return false;
}

export function isNewDay(messages: Message[], index: number) {
    if (index === 0) return true;

    const firstDate = new Date(messages[index - 1].createdAt);
    const secondDate = new Date(messages[index].createdAt);

    return (
        firstDate.getDate() !== secondDate.getDate() ||
        firstDate.getMonth() !== secondDate.getMonth() ||
        firstDate.getFullYear() !== secondDate.getFullYear()
    );
}
