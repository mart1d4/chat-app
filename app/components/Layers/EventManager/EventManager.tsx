"use client";

import { useWindowSettings } from "@/store";
import { useEffect } from "react";

export function EventManager() {
    const { shiftKeyDown, setShiftKeyDown, setWidthThreshold, widthThresholds } =
        useWindowSettings();

    const setWidthThresholds = () => {
        if (window.innerWidth <= 1200 && widthThresholds["1200"] === true) {
            setWidthThreshold(1200, false);
        } else if (window.innerWidth > 1200 && widthThresholds["1200"] === false) {
            setWidthThreshold(1200, true);
        } else if (window.innerWidth <= 767 && widthThresholds["767"] === true) {
            setWidthThreshold(767, false);
        } else if (window.innerWidth > 767 && widthThresholds["767"] === false) {
            setWidthThreshold(767, true);
        } else if (window.innerWidth <= 562 && widthThresholds["562"] === true) {
            setWidthThreshold(562, false);
        } else if (window.innerWidth > 562 && widthThresholds["562"] === false) {
            setWidthThreshold(562, true);
        } else {
            return;
        }
    };

    useEffect(() => {
        setWidthThresholds();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Shift" && !shiftKeyDown) setShiftKeyDown(true);
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === "Shift" && shiftKeyDown) setShiftKeyDown(false);
        };

        const handleResize = () => {
            setWidthThresholds();
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
        window.addEventListener("resize", handleResize);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("resize", handleResize);
        };
    }, [widthThresholds, shiftKeyDown]);

    return null;
}
