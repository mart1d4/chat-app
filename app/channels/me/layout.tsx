import { UserChannels, ClickLayer } from "@components";

export default function ChannelsLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <UserChannels />
            <ClickLayer>{children}</ClickLayer>
        </>
    );
}
