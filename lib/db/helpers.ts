import type { Channels, DB, Guilds, Messages, Users } from "./db.types";
import { type ExpressionBuilder, type Selectable, sql } from "kysely";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/mysql";
import type { AppChannel, AppUser, Channel, Friend, UnknownUser, User } from "@/type";
import { cookies } from "next/headers";
import { db } from "./db";

export const SelectAppUnknownUser: (keyof User)[] = ["id", "username", "avatar"];
export const selectAppRequest: (keyof User)[] = [...SelectAppUnknownUser, "displayName"];
export const SelectAppFriend: (keyof User)[] = [...selectAppRequest, "status"];

export const SelectAppChannel: (keyof Channel)[] = [
    "id",
    "type",
    "name",
    "icon",
    "topic",
    "ownerId",
];

export async function doesUserExist({ id, username }: Selectable<Users>) {
    if (!id && !username) return false;

    try {
        const user = await db
            .selectFrom("users")
            .select("id")
            .$if(!!id, (q) => q.where("id", "=", id))
            .$if(!!username, (q) => q.where("username", "=", username))
            .executeTakeFirst();

        return !!user;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function getUser({
    where,
    select,
}: {
    where?: Partial<Selectable<Users>>;
    select?: (keyof User)[] | keyof User;
}): Promise<User | null> {
    const miam = await cookies();
    const refreshToken = miam.get("token")?.value;

    if (!where?.id && !where?.username && !refreshToken) return null;

    try {
        const user = await db
            .selectFrom("users")
            .leftJoin("userTokens", "userTokens.userId", "users.id")
            .select("id")
            .$if(select!?.length > 0, (q) => q.select(select))
            .$if(!where?.id && !where?.username, (q) =>
                q.where("userTokens.token", "=", refreshToken as string)
            )
            .$if(!!where?.id, (q) => q.where("id", "=", where!.id as number))
            .$if(!!where?.username, (q) =>
                q.where("username", "=", sql<string>`BINARY ${where?.username}`)
            )
            .executeTakeFirst();

        return user || null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function canUserAccessChannel(userId: number, channelId: number) {
    try {
        const channel = await db
            .selectFrom("channelRecipients")
            .select("channelId")
            .where("userId", "=", userId)
            .where("channelId", "=", channelId)
            .executeTakeFirst();

        return !!channel;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function getInitialData() {
    const miam = await cookies();
    const refreshToken = miam.get("token")?.value;

    if (!refreshToken) return null;

    try {
        const start = Date.now();

        const user = await db
            .selectFrom("users")
            .innerJoin("userTokens", "userTokens.userId", "users.id")
            .select([
                "id",
                "email",
                "phone",
                "username",
                "displayName",
                "avatar",
                "banner",
                "primaryColor",
                "accentColor",
                "description",
                "customStatus",
                "status",
                "createdAt",
                "twoFactorEnabled",
            ])
            .where("userTokens.token", "=", refreshToken)
            .executeTakeFirst();

        if (!user) return null;

        const friends = await getFriends(user.id);
        const blocked = await getBlocked(user.id);
        const sent = await getRequestsSent(user.id);
        const received = await getRequestsReceived(user.id);
        const channels = await getUserChannels({ userId: user.id, getRecipients: true });

        const end = Date.now();

        console.log(`Initial data fetched in ${end - start}ms.`);

        // console.log("User: ", {
        //     ...user,
        //     friends,
        //     blocked,
        //     received,
        //     sent,
        //     channels,
        // });

        return {
            user: user as AppUser,
            friends: friends as Friend[],
            blocked: blocked as UnknownUser[],
            received: received as UnknownUser[],
            sent: sent as UnknownUser[],
            // @ts-ignore - Need to figure this one out
            channels: channels as AppChannel[],
            guilds: [],
        };
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function getFriends(userId: number) {
    try {
        const friends = await db
            .selectFrom("friends")
            .innerJoin("users", (join) =>
                join.on(({ eb, ref, and, or }) =>
                    and([
                        or([
                            eb("users.id", "=", ref("friends.A")),
                            eb("users.id", "=", ref("friends.B")),
                        ]),
                        eb("users.id", "!=", userId),
                    ])
                )
            )
            .select(SelectAppFriend)
            .where(({ eb, or }) => or([eb("A", "=", userId), eb("B", "=", userId)]))
            .execute();

        return friends || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getRequestsSent(userId: number) {
    try {
        const sent = await db
            .selectFrom("requests")
            .innerJoin("users", "users.id", "requests.requestedId")
            .select(selectAppRequest)
            .where("requests.requesterId", "=", userId)
            .execute();

        return sent || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getRequestsReceived(userId: number) {
    try {
        const received = await db
            .selectFrom("requests")
            .innerJoin("users", "users.id", "requests.requesterId")
            .select(selectAppRequest)
            .where("requests.requestedId", "=", userId)
            .execute();

        return received || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getBlocked(userId: number) {
    try {
        const blocked = await db
            .selectFrom("blocked")
            .innerJoin("users", "users.id", "blocked.blockedId")
            .select(SelectAppUnknownUser)
            .where("blocked.blockerId", "=", userId)
            .execute();

        return blocked || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getBlockedBy(userId: number) {
    try {
        const blockedBy = await db
            .selectFrom("blocked")
            .innerJoin("users", "users.id", "blocked.blockerId")
            .select(SelectAppUnknownUser)
            .where("blocked.blockedId", "=", userId)
            .execute();

        return blockedBy || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

/////////////////
/// Channels  ///
/////////////////

export async function getUserChannels({
    userId,
    select = SelectAppChannel,
    getRecipients = false,
    recipientSelect = SelectAppFriend,
}: {
    userId: number;
    select?: (keyof Channel)[];
    getRecipients?: boolean;
    recipientSelect?: (keyof User)[];
}) {
    if (!select.length) {
        select = SelectAppChannel;
    }

    try {
        const channels = await db
            .selectFrom("channels")
            .innerJoin("channelRecipients", "channelRecipients.channelId", "channels.id")
            .innerJoin("users", "users.id", "channelRecipients.userId")
            .select(select.map((key) => `channels.${key}`) as (keyof Channels)[])
            .$if(getRecipients, (q) => q.select((eb) => withRecipients(eb, recipientSelect)))
            .where(({ exists, selectFrom }) =>
                exists(
                    selectFrom("channelRecipients")
                        .select("userId")
                        .where("channelRecipients.userId", "=", userId)
                        .whereRef("channelRecipients.channelId", "=", "channels.id")
                )
            )
            .orderBy("updatedAt", "desc")
            .groupBy("channels.id")
            .execute();

        return channels || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getChannel({
    id,
    select = SelectAppChannel,
    getRecipients = false,
    recipientSelect = SelectAppFriend,
}: {
    id: number;
    select?: (keyof Channel)[];
    getRecipients?: boolean;
    recipientSelect?: (keyof User)[];
}) {
    if (!select.length) {
        select = SelectAppChannel;
    }

    try {
        const channel = await db
            .selectFrom("channels")
            .select(select)
            .$if(getRecipients, (q) => q.select((eb) => withRecipients(eb, recipientSelect)))
            .where("id", "=", id)
            .executeTakeFirst();

        return channel || null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getChannelRecipientCount(channelId: number) {
    try {
        const result = await db
            .selectFrom("channelRecipients")
            .select((eb) => eb.fn.countAll<number>().as("count"))
            .where("channelId", "=", channelId)
            .executeTakeFirst();

        return result?.count || 0;
    } catch (error) {
        console.error(error);
        return 0;
    }
}

export function withRecipients(eb: ExpressionBuilder<DB, "channels">, select = SelectAppFriend) {
    return jsonArrayFrom(
        eb
            .selectFrom("channelRecipients")
            .innerJoin(
                (eb) => eb.selectFrom("users as recipient").select(select).as("recipient"),
                (join) => join.onRef("recipient.id", "=", "channelRecipients.userId")
            )
            .select(select)
            .whereRef("channelRecipients.channelId", "=", "channels.id")
    ).as("recipients");
}

export async function isUserInChannel(userId: number, channelId: number) {
    try {
        const channel = await db
            .selectFrom("channelRecipients")
            .select("userId")
            .where("userId", "=", userId)
            .where("channelId", "=", channelId)
            .executeTakeFirst();

        return !!channel;
    } catch (error) {
        console.error(error);
        return false;
    }
}

/////////////////
////  Guild  ////
/////////////////

export async function getUserGuilds({
    userId,
    select,
    getMembers = false,
    getChannels = false,
    getRoles = false,
}: {
    userId: number;
    select?: (keyof Guilds)[];
    getMembers?: boolean;
    getChannels?: boolean;
    getRoles?: boolean;
}) {
    try {
        const guilds = await db
            .selectFrom("guilds")
            .select("id")
            .$if(!!select && select.length > 0, (q) => q.select(select))
            .$if(getMembers, (q) => q.select((eb) => withMembers(eb)))
            .$if(getChannels, (q) => q.select((eb) => withChannels(eb)))
            .$if(getRoles, (q) => q.select((eb) => withRoles(eb)))
            .where(({ exists, selectFrom }) =>
                exists(
                    selectFrom("guildMembers")
                        .select("userId")
                        .where("guildMembers.userId", "=", userId)
                        .whereRef("guildMembers.guildId", "=", "guilds.id")
                )
            )
            .orderBy("createdAt", "desc")
            .execute();

        return guilds || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getGuild({
    id,
    select,
    getMembers = false,
    getChannels = false,
    getRoles = false,
}: {
    id: number;
    select?: (keyof Guilds)[];
    getMembers?: boolean;
    getChannels?: boolean;
    getRoles?: boolean;
}) {
    try {
        const guild = await db
            .selectFrom("guilds")
            .select("id")
            .$if(!!select && select.length > 0, (q) => q.select(select))
            .$if(getMembers, (q) => q.select((eb) => withMembers(eb)))
            .$if(getChannels, (q) => q.select((eb) => withChannels(eb)))
            .$if(getRoles, (q) => q.select((eb) => withRoles(eb)))
            .where("id", "=", id)
            .executeTakeFirst();

        return guild || null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getGuildMemberCount(guildId: number) {
    try {
        const result = await db
            .selectFrom("guildMembers")
            .select((eb) => eb.fn.countAll<number>().as("count"))
            .where("guildId", "=", guildId)
            .executeTakeFirst();

        return result?.count || 0;
    } catch (error) {
        console.error(error);
        return 0;
    }
}

export function withMembers(eb: ExpressionBuilder<DB, "guilds">, select = userSelect) {
    return jsonArrayFrom(
        eb
            .selectFrom("guildMembers")
            .innerJoin(
                (eb) => eb.selectFrom("users as member").select(select).as("member"),
                (join) => join.onRef("member.id", "=", "guildMembers.userId")
            )
            .select(select)
            .select("profile")
            .whereRef("guildMembers.guildId", "=", "guilds.id")
    ).as("members");
}

export function withChannels(eb: ExpressionBuilder<DB, "guilds">, select = channelSelect) {
    // Need to also return a `permission` field for each channel
    // taking into consideration the user's role permissions and the channel's overwrites
    // So the client can determine if the user can read, send, manage, etc
    // without having to check each time using the server
    return jsonArrayFrom(
        eb
            .selectFrom("channels")
            .select(select)
            .whereRef("channels.guildId", "=", "guilds.id")
            .orderBy("position", "asc")
    ).as("channels");
}

export function withRoles(eb: ExpressionBuilder<DB, "guilds">) {
    return jsonArrayFrom(
        eb
            .selectFrom("roles")
            .select(["id", "name", "color", "permissions", "position"])
            .whereRef("roles.guildId", "=", "guilds.id")
            .orderBy("position", "asc")
    ).as("roles");
}

export async function isUserInGuild(userId: number, guildId: number) {
    try {
        const guild = await db
            .selectFrom("guildMembers")
            .select("userId")
            .where("userId", "=", userId)
            .where("guildId", "=", guildId)
            .executeTakeFirst();

        return !!guild;
    } catch (error) {
        console.error(error);
        return false;
    }
}

/////////////////
//// Message ////
/////////////////

export const defaultMessageSelect: (keyof Messages)[] = [
    "id",
    "type",
    "content",
    "attachments",
    "embeds",
    "edited",
    "pinned",
    "channelId",
    "createdAt",
];

export const defaultAuthorSelect: (keyof Users)[] = ["id", "displayName", "avatar"];

export async function getChannelMessages({
    channelId,
    select = ["id"],
    getAuthor = false,
    getMentions = false,
    getReference = false,
    authorSelect = ["id"],
    limit = 50,
    pinned = false,
}: {
    channelId: number;
    select?: (keyof Messages)[];
    getAuthor?: boolean;
    getMentions?: boolean;
    getReference?: boolean;
    authorSelect?: (keyof Users)[];
    limit?: number;
    pinned?: boolean;
}) {
    try {
        let query = db
            .selectFrom("messages")
            .select(select)
            .where("channelId", "=", channelId)
            .orderBy("createdAt", "asc")
            .limit(limit);

        if (getAuthor) query = query.select((eb) => withAuthor({ eb, select: authorSelect }));
        if (getMentions) query = query.select((eb) => withMentions({ eb, select: authorSelect }));
        if (getReference) query = query.select((eb) => withReference({ eb, select, authorSelect }));
        if (pinned) query = query.where("pinned", "is not", null);

        const messages = await query.execute();
        return messages || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getMessage({
    id,
    select = ["id"],
    getAuthor = false,
    getMentions = false,
    getReference = false,
    authorSelect = ["id"],
}: {
    id: number;
    select?: (keyof Messages)[];
    getAuthor?: boolean;
    getMentions?: boolean;
    getReference?: boolean;
    authorSelect?: (keyof Users)[];
}) {
    try {
        let query = db.selectFrom("messages").select(select).where("id", "=", id);

        if (getAuthor) query = query.select((eb) => withAuthor({ eb, select: authorSelect }));
        if (getMentions) query = query.select((eb) => withMentions({ eb, select: authorSelect }));
        if (getReference) query = query.select((eb) => withReference({ eb, select, authorSelect }));

        const message = await query.executeTakeFirst();
        return message;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export function withAuthor({
    eb,
    select = ["id"],
}: {
    eb: ExpressionBuilder<DB, "messages">;
    select?: (keyof Users)[];
}) {
    return jsonObjectFrom(
        eb
            .selectFrom("users as author")
            .select(select)
            .whereRef("author.id", "=", "messages.authorId")
    ).as("author");
}

export function withMentions({
    eb,
    select = ["id"],
}: {
    eb: ExpressionBuilder<DB, "messages">;
    select?: (keyof Users)[];
}) {
    return jsonArrayFrom(
        eb
            .selectFrom("users as mention")
            .select(select)
            .where(({ ref }) => {
                return sql`JSON_CONTAINS(${ref("messages.userMentions")}, JSON_ARRAY(${ref(
                    "mention.id"
                )}))`;
            })
    ).as("mentions");
}

export function withReference({
    eb,
    select = ["id"],
    getAuthor = true,
    authorSelect = ["id"],
    getMentions = true,
}: {
    eb: ExpressionBuilder<DB, "messages">;
    select?: (keyof Messages)[];
    getAuthor?: boolean;
    authorSelect?: (keyof Users)[];
    getMentions?: boolean;
}) {
    let query = eb
        .selectFrom("messages as reference")
        .select(select)
        .whereRef("reference.id", "=", "messages.messageReferenceId");

    if (getAuthor) query = query.select((eb) => withAuthor({ eb, select: authorSelect }));
    if (getMentions) query = query.select((eb) => withMentions({ eb, select: authorSelect }));

    return jsonObjectFrom(query).as("reference");
}
