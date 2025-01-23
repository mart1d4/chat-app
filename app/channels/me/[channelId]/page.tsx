import { AppHeader, MemberList } from "@components";
import { isUserInChannel } from "@/lib/db/helpers";
import styles from "../FriendsPage.module.css";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Content from "./Content";

export default async function ChannelPage({ params }: { params: { channelId: string } }) {
    const userId = parseInt(headers().get("x-user-id") as string);
    const id = parseInt(params.channelId);

    if (!userId || !id || !(await isUserInChannel(userId, id))) {
        return redirect("/channels/me");
    }

    return (
        <div className={styles.main}>
            <AppHeader channelId={id} />

            <div className={styles.content}>
                <Content channelId={id} />
                <MemberList channelId={id} />
            </div>
        </div>
    );
}
