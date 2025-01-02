import { UserChannels, ClickLayer } from "@components";
import type { ReactElement } from "react";

export default function ChannelsLayout({ children }: { children: ReactElement }) {
    return (
        <>
            <UserChannels />
            <ClickLayer>{children}</ClickLayer>
        </>
    );
}
