import { getGuild, useUser, getGuildChannels } from "@/lib/auth";
import { GuildChannels } from "@components";
import { redirect } from "next/navigation";
import Content from "./Content";

const Page = async ({ params }: { params: { guildId: string; channelId: string } }) => {
    const user = await useUser();
    if (!user) redirect("/login");

    const guild = await getGuild(params.guildId);
    if (!guild || !user.guildIds.includes(guild.id)) redirect("/channels/me");

    const channels = await getGuildChannels(guild.id);
    const channel = channels.find((c) => c.id === params.channelId);
    if (!channel) {
        const textChannel = channels.find((c) => c.type === 2);
        if (textChannel) redirect(`/channels/${guild.id}/${textChannel.id}`);
        redirect(`/channels/${guild.id}`);
    }

    channels.sort((a, b) => (a.position as number) - (b.position as number));

    return (
        <>
            <GuildChannels
                guild={guild}
                channels={channels}
                user={user}
            />

            <Content
                guild={guild}
                channel={channel}
            />
        </>
    );
};

export default Page;
