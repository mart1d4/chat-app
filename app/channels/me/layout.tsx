import { UserChannels, ClickLayer } from "@components";

export default function ChannelsLayout({ children }) {
    return (
        <>
            <UserChannels />
            <ClickLayer>{children}</ClickLayer>
        </>
    );
}
