export async function sendBrowserNotification(title: string, body: string, icon?: string) {
    if (!("Notification" in window)) {
        console.error("This browser does not support desktop notifications.");
        return;
    }

    if (Notification.permission === "granted") {
        new Notification(title, { body, icon });
    } else if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            new Notification(title, { body, icon });
        }
    }
}
