import { canUserAccessChannel, getChannel, getUser } from "@/lib/db/helpers";
import { AppHeader, MemberList } from "@components";
import styles from "../FriendsPage.module.css";
import { getFullChannel } from "@/lib/strings";
import { redirect } from "next/navigation";
import type { Channel } from "@/type";
import Content from "./Content";

function getFriend(userId: number, channel: Channel) {
    if (channel.type === 0) {
        return channel.recipients.find((r) => r.id !== userId);
    }
    return null;
}

export default async function ChannelPage({ params }: { params: { channelId: string } }) {
    const user = await getUser({});
    if (!user) redirect("/login");

    const channelId = parseInt(params.channelId);

    if (!(await canUserAccessChannel(user.id, channelId))) {
        redirect("/channels/me");
    }

    const channelFetch = await getChannel({
        id: channelId,
        select: ["id", "icon", "name", "type", "ownerId"],
        getRecipients: true,
    });
    if (!channelFetch) redirect("/channels/me");

    const channel = getFullChannel(channelFetch, user);
    const friend = getFriend(user.id, channel);

    return (
        <div className={styles.main}>
            <AppHeader
                channel={channel}
                friend={friend}
            />

            <div className={styles.content}>
                <Content
                    friend={friend}
                    channel={channel}
                />

                <MemberList
                    channel={channel}
                    friend={friend}
                />
            </div>
        </div>
    );
}
