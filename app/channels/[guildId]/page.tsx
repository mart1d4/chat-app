import { getGuild } from '@/lib/auth';

const Page = async ({ params }: { params: { guildId: string; } }) => {
    const guild = (await getGuild(params.guildId)) as TGuild;

    return (
        <div>
            <h1>Welcome to {guild.name}</h1>
        </div>
    );
};

export default Page;
