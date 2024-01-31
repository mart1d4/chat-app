import { useEffect, useMemo, useState } from "react";

const minute = 60 * 1000;
const hour = minute * 60;
const day = hour * 24;
const month = day * 30;
const year = day * 365;

export default function useRelativeTime(time: number) {
    const [now, setNow] = useState(() => Date.now());
    const locale = "en-US";

    useEffect(() => {
        if (now - time < minute) {
            const interval = setInterval(() => setNow(Date.now()), 10_000);
            return () => clearInterval(interval);
        }
    });

    return useMemo(() => {
        const elapsed = now - time;
        const intl = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

        if (elapsed < minute) {
            return intl.format(-Math.round(elapsed / 1000), "second");
        } else if (elapsed < hour) {
            return intl.format(-Math.round(elapsed / minute), "minute");
        } else if (elapsed < day) {
            return intl.format(-Math.round(elapsed / hour), "hour");
        } else if (elapsed < month) {
            return intl.format(-Math.round(elapsed / day), "day");
        } else if (elapsed < year) {
            return intl.format(-Math.round(elapsed / month), "month");
        } else {
            return intl.format(-Math.round(elapsed / year), "year");
        }
    }, [now, locale, time]);
}
