"use client";

import { useShowChannels } from "@/store";
import { useEffect } from "react";

export function Init() {
    const { setShowChannels } = useShowChannels();

    useEffect(() => {
        setShowChannels(true);
    }, []);

    return null;
}
