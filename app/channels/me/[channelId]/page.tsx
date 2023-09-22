import { useUser, getChannel } from "@/lib/auth";
import { UserChannels } from "@components";
import { redirect } from "next/navigation";
import Content from "./Content";

const ChannelPage = async ({ params }: { params: { channelId: string } }) => {
    const user = await useUser();
    if (!user) redirect("/login");

    const channel = await getChannel(params.channelId);
    if (!channel || !user.channelIds.includes(channel.id)) redirect("/channels/me");

    const friend = channel.type === 0 ? channel.recipients.find((u) => u.id !== user.id) : undefined;

    return (
        <>
            <UserChannels />

            <Content
                channel={channel}
                user={user}
                friend={friend}
            />
        </>
    );
};

export default ChannelPage;
