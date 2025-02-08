"use client";

import { getApiUrl } from "@/lib/uploadthing";
import { useEffect } from "react";

export function Init() {
    const sendToServer = (message: string, error: boolean) => {
        fetch(`${getApiUrl}/log`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: message.toString(),
                isError: error,
            }),
        });
    };

    useEffect(() => {
        if (process.env.NODE_ENV === "production") {
            console.log = () => {};

            console.error = (e) => {
                sendToServer(e, true);
            };

            console.debug = () => {};
        }
    }, []);

    return null;
}
