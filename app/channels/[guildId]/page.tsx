import { redirect } from 'next/navigation';
import { getGuild } from '@/lib/auth';

const Page = async ({ params }: { params: { guildId: string } }) => {
    const guild = await getGuild(params.guildId);
    if (!guild) redirect('/channels/me');

    redirect(`/channels/${params.guildId}/${guild.systemChannelId}`);
};

export default Page;
