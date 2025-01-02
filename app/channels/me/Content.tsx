"use client";

import { AddFriend, UserLists } from "@components";
import { useSettings, useUrls } from "@/store";
import { useEffect } from "react";

export default function Content() {
    const settings = useSettings((state) => state.settings);
    const setChannelUrl = useUrls((state) => state.setMe);
    const tab = settings.friendTab;

    useEffect(() => {
        document.title = "Spark | Friends";
        setChannelUrl("/channels/me");
    }, []);

    if (tab === "add") return <AddFriend />;
    else return <UserLists content={tab} />;
}
