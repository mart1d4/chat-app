import { getGuild, getGuildChannels, useUser } from "@/lib/auth";
import { GuildChannels } from "@components";

const Page = async ({ params }: { params: { guildId: string } }) => {
    const guild = (await getGuild(params.guildId)) as TGuild;

    const user = (await useUser()) as TCleanUser;
    const channels = await getGuildChannels(guild.id);

    channels.sort((a, b) => (a.position as number) - (b.position as number));

    return (
        <>
            <GuildChannels guild={guild} channels={channels} user={user} />

            <div>
                <h1>Welcome to {guild.name}</h1>
            </div>
        </>
    );
};

export default Page;
