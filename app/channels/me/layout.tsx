import { ClickLayer } from "@/app/components/ClickLayer/ClickLayer";
import { UserChannels } from "@components";
import { ReactElement } from "react";

export default function ChannelsLayout({ children }: { children: ReactElement }) {
    return (
        <>
            <UserChannels />
            <ClickLayer>{children}</ClickLayer>
        </>
    );
}
