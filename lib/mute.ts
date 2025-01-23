type MuteDuration = "15m" | "1h" | "3h" | "8h" | "24h" | "always";

export function isStillMuted(duration: MuteDuration, startedAt: Date | string) {
    const now = new Date();
    const startedAtDate = new Date(startedAt); // Ensure it's a Date object
    const startedAtPlusDuration = new Date(startedAtDate);

    switch (duration) {
        case "15m":
            startedAtPlusDuration.setMinutes(startedAtDate.getMinutes() + 15);
            break;
        case "1h":
            startedAtPlusDuration.setHours(startedAtDate.getHours() + 1);
            break;
        case "3h":
            startedAtPlusDuration.setHours(startedAtDate.getHours() + 3);
            break;
        case "8h":
            startedAtPlusDuration.setHours(startedAtDate.getHours() + 8);
            break;
        case "24h":
            startedAtPlusDuration.setDate(startedAtDate.getDate() + 1);
            break;
        case "always":
            return true;
    }

    return now < startedAtPlusDuration;
}

export function getDateUntilEnd(duration: MuteDuration, startedAt: Date | string) {
    const startedAtDate = new Date(startedAt);
    const startedAtPlusDuration = new Date(startedAt);

    switch (duration) {
        case "15m":
            startedAtPlusDuration.setMinutes(startedAtDate.getMinutes() + 15);
            break;
        case "1h":
            startedAtPlusDuration.setHours(startedAtDate.getHours() + 1);
            break;
        case "3h":
            startedAtPlusDuration.setHours(startedAtDate.getHours() + 3);
            break;
        case "8h":
            startedAtPlusDuration.setHours(startedAtDate.getHours() + 8);
            break;
        case "24h":
            startedAtPlusDuration.setDate(startedAtDate.getDate() + 1);
            break;
        case "always":
            return null;
    }

    return startedAtPlusDuration;
}
