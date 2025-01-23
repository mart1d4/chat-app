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

export function getMidDate(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const timePassedToday = now.getHours() * 60 * 60 * 1000 + now.getMinutes() * 60 * 1000;
    const timePassedYesterday = timePassedToday + 24 * 60 * 60 * 1000;

    if (diff < timePassedToday) {
        return `Today at ${new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "numeric",
        }).format(date)}`;
    } else if (diff < timePassedYesterday) {
        return `Yesterday at ${new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "numeric",
        }).format(date)}`;
    }

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
    if (typeof date === "string") {
        date = new Date(date);
    }

    if (new Date().getDate() === date.getDate()) {
        return "Today";
    } else if (new Date().getDate() - date.getDate() === 1) {
        return "Yesterday";
    }

    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

export function getRelativeDate(date: Date) {
    if (!date) {
        return "Just now";
    }

    if (typeof date === "string") {
        date = new Date(date);
    }

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
