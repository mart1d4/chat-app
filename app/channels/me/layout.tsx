import { UserChannels } from "@components";
import { ReactElement } from "react";

export default function ChannelsLayout({ children }: { children: ReactElement }) {
    return (
        <>
            <UserChannels />
            {children}
        </>
    );
}
