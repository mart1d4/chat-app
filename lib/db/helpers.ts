import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/mysql";
import { Channels, DB, Guilds, Messages, Users } from "./types";
import { ExpressionBuilder, Selectable, sql } from "kysely";
import { cookies } from "next/headers";
import { db } from "./db";
import type { Message } from "@/type";

export const selfUserSelect: (keyof Users)[] = [
    "id",
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
];

export const userSelect: (keyof Users)[] = [
    "id",
    "username",
    "displayName",
    "avatar",
    "banner",
    "primaryColor",
    "accentColor",
];

const messageSelect: (keyof Messages)[] = [
    "id",
    "type",
    "content",
    "attachments",
    "embeds",
    "edited",
    "pinned",
    "mentionEveryone",
    "userMentions",
    "roleMentions",
    "createdAt",
    "channelId",
];

const channelSelect: (keyof Channels)[] = [
    "id",
    "type",
    "name",
    "topic",
    "icon",
    "ownerId",
    "updatedAt",
    "guildId",
    "position",
    "parentId",
];

const guildSelect: (keyof Guilds)[] = [
    "id",
    "name",
    "icon",
    "banner",
    "description",
    "systemChannelId",
    "createdAt",
    "ownerId",
];

export async function doesUserExist({ id, username }: Selectable<Users>) {
    if (!id && !username) return false;

    try {
        const user = await db
            .selectFrom("users")
            .select("id")
            .$if(!!id, (q) => q.where("id", "=", id))
            .$if(!!username, (q) => q.where("username", "=", sql<string>`BINARY ${username}`))
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
    select?: (keyof Users)[] | keyof Users;
}): Promise<Selectable<Users> | null> {
    const refreshToken = cookies().get("token")?.value;
    if (!where?.id && !where?.username && !refreshToken) return null;

    try {
        const user = await db
            .selectFrom("users")
            .select("id")
            .$if(select!?.length > 0, (q) => q.select(select))
            .$if(!where?.id && !where?.username, (q) =>
                q.where(sql<string>`JSON_CONTAINS(tokens, JSON_OBJECT('token', ${refreshToken}))`)
            )
            .$if(!!where?.id, (q) => q.where("id", "=", where?.id))
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
            .selectFrom("channelrecipients")
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
    const refreshToken = cookies().get("token")?.value;
    if (!refreshToken) return null;

    try {
        const user = await getUser({
            select: [...userSelect, "status", "customStatus", "createdAt"],
        });
        if (!user) return null;

        const friends = await getFriends(user.id);
        const blocked = await getBlocked(user.id);
        const received = await getRequestsReceived(user.id);
        const sent = await getRequestsSent(user.id);

        const channels = await getUserChannels({
            userId: user.id,
            select: channelSelect,
            getRecipients: true,
        });

        const guilds = await getUserGuilds({
            userId: user.id,
            select: guildSelect,
            getMembers: true,
            getChannels: true,
            getRoles: true,
        });

        return {
            user,
            friends,
            blocked,
            received,
            sent,
            channels,
            guilds,
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
            .innerJoin(
                (eb) =>
                    eb
                        .selectFrom("users")
                        .select(selfUserSelect)
                        .where("id", "!=", userId)
                        .as("users"),
                (join) =>
                    join.on(({ eb, ref }) =>
                        eb("users.id", "=", ref("friends.A")).or("users.id", "=", ref("friends.B"))
                    )
            )
            .select(selfUserSelect)
            .where(({ eb, or, and }) =>
                or([
                    and([eb("A", "=", userId), eb("B", "!=", userId)]),
                    and([eb("A", "!=", userId), eb("B", "=", userId)]),
                ])
            )
            .execute();

        return friends || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getRequestsSent(userId: number) {
    try {
        const requests = await db
            .selectFrom("requests")
            .innerJoin(
                (eb) => eb.selectFrom("users").select(selfUserSelect).as("users"),
                (join) => join.onRef("users.id", "=", "requests.requestedId")
            )
            .select(selfUserSelect)
            .where("requests.requesterId", "=", userId)
            .execute();

        return requests || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getRequestsReceived(userId: number) {
    try {
        const requests = await db
            .selectFrom("requests")
            .innerJoin(
                (eb) => eb.selectFrom("users").select(selfUserSelect).as("users"),
                (join) => join.onRef("users.id", "=", "requests.requesterId")
            )
            .select(selfUserSelect)
            .where("requests.requestedId", "=", userId)
            .execute();

        return requests || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getBlocked(userId: number) {
    try {
        const blocked = await db
            .selectFrom("blocked")
            .innerJoin(
                (eb) => eb.selectFrom("users").select(selfUserSelect).as("users"),
                (join) => join.onRef("users.id", "=", "blocked.blockedId")
            )
            .select(selfUserSelect)
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
        const blocked = await db
            .selectFrom("blocked")
            .innerJoin(
                (eb) => eb.selectFrom("users").select(selfUserSelect).as("users"),
                (join) => join.onRef("users.id", "=", "blocked.blockerId")
            )
            .select(selfUserSelect)
            .where("blocked.blockedId", "=", userId)
            .execute();

        return blocked || [];
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
    select,
    getRecipients = false,
}: {
    userId: number;
    select?: (keyof Channels)[];
    getRecipients?: boolean;
}) {
    try {
        const channels = await db
            .selectFrom("channels")
            .select("id")
            .$if(!!select && select.length > 0, (q) => q.select(select))
            .$if(getRecipients, (q) => q.select((eb) => withRecipients(eb)))
            .where(({ exists, selectFrom }) =>
                exists(
                    selectFrom("channelrecipients")
                        .select("userId")
                        .where("channelrecipients.userId", "=", userId)
                        .whereRef("channelrecipients.channelId", "=", "channels.id")
                )
            )
            .orderBy("updatedAt", "desc")
            .execute();

        return channels || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getChannel({
    id,
    select,
    getRecipients = false,
}: {
    id: number;
    select?: (keyof Channels)[];
    getRecipients?: boolean;
}) {
    try {
        const channel = await db
            .selectFrom("channels")
            .select("id")
            .$if(!!select && select.length > 0, (q) => q.select(select))
            .$if(getRecipients, (q) => q.select((eb) => withRecipients(eb)))
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
            .selectFrom("channelrecipients")
            .select((eb) => eb.fn.countAll<number>().as("count"))
            .where("channelId", "=", channelId)
            .executeTakeFirst();

        return result?.count || 0;
    } catch (error) {
        console.error(error);
        return 0;
    }
}

export function withRecipients(eb: ExpressionBuilder<DB, "channels">, select = selfUserSelect) {
    return jsonArrayFrom(
        eb
            .selectFrom("channelrecipients")
            .innerJoin(
                (eb) => eb.selectFrom("users as recipient").select(select).as("recipient"),
                (join) => join.onRef("recipient.id", "=", "channelrecipients.userId")
            )
            .select(select)
            .whereRef("channelrecipients.channelId", "=", "channels.id")
    ).as("recipients");
}

export async function isUserInChannel(userId: number, channelId: number) {
    try {
        const channel = await db
            .selectFrom("channelrecipients")
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
                    selectFrom("guildmembers")
                        .select("userId")
                        .where("guildmembers.userId", "=", userId)
                        .whereRef("guildmembers.guildId", "=", "guilds.id")
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
            .selectFrom("guildmembers")
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
            .selectFrom("guildmembers")
            .innerJoin(
                (eb) => eb.selectFrom("users as member").select(select).as("member"),
                (join) => join.onRef("member.id", "=", "guildmembers.userId")
            )
            .select(select)
            .select("profile")
            .whereRef("guildmembers.guildId", "=", "guilds.id")
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
            .selectFrom("guildmembers")
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
    ).as("userMentions");
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
