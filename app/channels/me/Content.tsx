"use client";

import { AddFriend, UserLists } from "@components";
import { useSettings, useUrls } from "@/store";
import { ReactElement, useEffect } from "react";

const Content = (): ReactElement => {
    const settings = useSettings((state) => state.settings);
    const setChannelUrl = useUrls((state) => state.setMe);
    const tab = settings.friendTab;

    useEffect(() => {
        document.title = "Spark | Friends";
        setChannelUrl("/channels/me");
    }, []);

    if (tab === "add") return <AddFriend />;
    else return <UserLists content={tab} />;
};

export default Content;
