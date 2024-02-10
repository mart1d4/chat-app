export const getLongDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
    }).format(new Date(date));
};

export const getMidDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
    }).format(new Date(date));
};

export const getShortDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
    }).format(new Date(date));
};

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
