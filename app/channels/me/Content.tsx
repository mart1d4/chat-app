"use client";

import { AddFriend, UserLists } from "@components";
import { useSettings } from "@/lib/store";
import { ReactElement } from "react";

const Content = ({ data }: any): ReactElement => {
    const settings = useSettings((state) => state.settings);
    const tab = settings.friendTab;

    if (tab === "add") return <AddFriend />;
    else return <UserLists content={tab} />;
};

export default Content;
