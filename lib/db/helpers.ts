import { type ExpressionBuilder, type Selectable, sql } from "kysely";
import type { Channels, DB, Guilds, Users } from "./db.types";
import { jsonArrayFrom } from "kysely/helpers/mysql";
import { cookies } from "next/headers";
import { db } from "./db";
import type {
    DMChannelWithRecipients,
    UnknownUser,
    UserGuild,
    KnownUser,
    AppUser,
    Channel,
    User,
} from "@/type";

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

export const SelectAppGuild: (keyof Guilds)[] = [
    "id",
    "name",
    "icon",
    "ownerId",
    "systemChannelId",
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

export async function areUsersBlocked(user1: number, user2: number) {
    try {
        const blocked = await db
            .selectFrom("blocked")
            .select("blockedId")
            .where(({ eb, or, and }) =>
                or([
                    and([eb("blockerId", "=", user1), eb("blockedId", "=", user2)]),
                    and([eb("blockerId", "=", user2), eb("blockedId", "=", user1)]),
                ])
            )
            .executeTakeFirst();

        return !!blocked;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function canUserAccessChannel(userId: number, channelId: number) {
    try {
        const channel = await db
            .selectFrom("channelRecipients")
            .leftJoin("channels", "channels.id", "channelRecipients.channelId")
            .select("channelId")
            .where("userId", "=", userId)
            .where("channelId", "=", channelId)
            .where("channels.isDeleted", "=", false)
            .executeTakeFirst();

        return !!channel;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function canUserAccessGuildChannel(
    userId: number,
    guildId: number,
    channelId: number
) {
    try {
        // Channel needs to be in a guild in which the user is a member of
        // then, we need to check if the channel has special permissions
        // for the user, or if the user has a role that has special permissions to see the channel
        const channel = await db
            .selectFrom("channels")
            .leftJoin("guilds", "guilds.id", "channels.guildId")
            .leftJoin("guildMembers", "guildMembers.guildId", "guilds.id")
            .select(["channels.id", "channels.permissionOverwrites", "guildMembers.profile"])
            .where("channels.id", "=", channelId)
            .where("guilds.id", "=", guildId)
            .where("guildMembers.userId", "=", userId)
            .where("channels.isDeleted", "=", false)
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
                "bannerColor",
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

        const [friends, blocked, sent, received, channels, guilds] = await Promise.all([
            getFriends(user.id),
            getBlocked(user.id),
            getRequestsSent(user.id),
            getRequestsReceived(user.id),
            getUserChannels({ userId: user.id, getRecipients: true }),
            getUserGuilds({ userId: user.id }),
        ]);

        const end = Date.now();

        console.log(`Initial data fetched in ${end - start}ms.`);

        return {
            user: user as AppUser,
            friends: friends as KnownUser[],
            blocked: blocked as UnknownUser[],
            received: received as UnknownUser[],
            sent: sent as UnknownUser[],
            // @ts-ignore - Need to figure this one out
            channels: channels as DMChannelWithRecipients[],
            // @ts-ignore - Need to figure this one out
            guilds: guilds.map((g) => ({ ...g, channels: [] })) as UserGuild[],
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
    recipientSelect = [...SelectAppFriend, "customStatus"],
}: {
    userId: number;
    select?: (keyof Channel)[];
    getRecipients?: boolean;
    recipientSelect?: (keyof User)[];
}) {
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
                        .where("channelRecipients.isHidden", "=", false)
                        .whereRef("channelRecipients.channelId", "=", "channels.id")
                )
            )
            .where("channels.isDeleted", "=", false)
            .orderBy("updatedAt", "desc")
            .groupBy("channels.id")
            .limit(50)
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
            .innerJoin("channels", "channels.id", "channelRecipients.channelId")
            .select("userId")
            .where("userId", "=", userId)
            .where("channelId", "=", channelId)
            .where("channels.isDeleted", "=", false)
            .where("channelRecipients.isHidden", "=", false)
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
    select = SelectAppGuild,
}: {
    userId: number;
    select?: (keyof Guilds)[];
}) {
    try {
        const guilds = await db
            .selectFrom("guilds")
            .innerJoin("guildMembers", (join) =>
                join
                    .onRef("guildMembers.guildId", "=", "guilds.id")
                    .on("guildMembers.userId", "=", userId)
            )
            // .innerJoin("guildMembers as members", "members.guildId", "guilds.id")
            .innerJoin("roles", "roles.guildId", "guilds.id")
            .select(select.map((key) => `guilds.${key}`) as (keyof Guilds)[])
            // @ts-ignore - Need to figure this one out
            .select([
                JsonArray({
                    table: "roles",
                    columns: [
                        "id",
                        "name",
                        "color",
                        "permissions",
                        "position",
                        "everyone",
                        "hoist",
                        "mentionable",
                    ],
                    as: "roles",
                }),
                // JsonArray({ table: "members", columns: ["profile"], as: "members" }),
            ])
            .where("guilds.isDeleted", "=", false)
            .groupBy("guilds.id")
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
            .$if(!!select && select.length > 0, (q) => q.select(select as (keyof Guilds)[]))
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

export function withMembers(eb: ExpressionBuilder<DB, "guilds">, select = SelectAppFriend) {
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

export function withChannels(eb: ExpressionBuilder<DB, "guilds">, select = SelectAppChannel) {
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
            .leftJoin("guilds", "guilds.id", "guildMembers.guildId")
            .select("userId")
            .where("userId", "=", userId)
            .where("guildId", "=", guildId)
            .where("guilds.isDeleted", "=", false)
            .executeTakeFirst();

        return !!guild;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export function toString(obj: any) {
    return JSON.stringify(
        obj,
        (_, value) => (typeof value === "bigint" ? value.toString() : value),
        4
    );
}

export function camelCaseToSnakeCase(str: string) {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

type JsonObjectOptions = {
    table: string;
    columns: string[];
    as?: string;
    otherTable?: string;
    otherColumns?: string[];
    otherAs?: string;
};

export function JsonObject({
    table,
    columns,
    as,
    otherTable,
    otherColumns,
    otherAs,
}: JsonObjectOptions): string | ReturnType<typeof sql> {
    let fields = columns.map((c) => `'${c}', ${table}.${camelCaseToSnakeCase(c)}`).join(", ");

    if (otherTable && otherColumns) {
        const otherFields = otherColumns
            .map(
                (c) =>
                    `'${
                        otherAs + c[0].toUpperCase() + c.slice(1)
                    }', ${otherTable}.${camelCaseToSnakeCase(c)}`
            )
            .join(", ");

        fields += `, ${otherFields}`;
    }

    return sql`
        CASE
            WHEN ${sql.raw(`${table}.${columns[0]}`)} IS NULL
            THEN NULL
            ELSE JSON_OBJECT(${sql.raw(fields)})
        END
        ${as ? sql.raw(` as ${as}`) : sql.raw(``)}`;
}

export function JsonArray({
    table,
    columns,
    as,
}: {
    table: string;
    columns: string[];
    as?: string;
}) {
    return sql`
        CASE
            WHEN COUNT(${sql.raw(`${table}.${columns[0]}`)}) = 0
            THEN JSON_ARRAY()
            ELSE JSON_ARRAYAGG(${JsonObject({ table, columns })})
        END
        ${as ? sql.raw(` as ${as}`) : sql.raw(``)}`;
}
