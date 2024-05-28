export function getLongDate(date: Date) {
    const dateFormatter = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const timeFormatter = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
    });

    const formattedDate = dateFormatter.format(new Date(date));
    const formattedTime = timeFormatter.format(new Date(date));

    return `${formattedDate} ${formattedTime}`;
}

export function getMidDate(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
    }).format(new Date(date));
}

export function getShortDate(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
    }).format(new Date(date));
}

export function getDayDate(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(new Date(date));
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
