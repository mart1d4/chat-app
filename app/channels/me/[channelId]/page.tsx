import { canUserAccessChannel, getUser } from "@/lib/db/helpers";
import { AppHeader, MemberList } from "@components";
import styles from "../FriendsPage.module.css";
import { redirect } from "next/navigation";
import Content from "./Content";

export default async function ChannelPage({ params }: { params: { channelId: string } }) {
    const user = await getUser({});
    if (!user) redirect("/login");

    const id = parseInt(params.channelId);

    if (!(await canUserAccessChannel(user.id, id))) {
        redirect("/channels/me");
    }

    const countObj = await db
        .selectFrom("messages")
        .select(({ fn }) => fn.count<number>("id").as("count"))
        .where("channelId", "=", id)
        .executeTakeFirst();

    return (
        <div className={styles.main}>
            <AppHeader id={id} />

            <div className={styles.content}>
                <Content
                    id={id}
                    count={countObj?.count || 0}
                />
                <MemberList channelId={id} />
            </div>
        </div>
    );
}
