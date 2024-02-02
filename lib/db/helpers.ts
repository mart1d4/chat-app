import { NextResponse } from "next/server";
import { User, UserTable } from "./types";
import { cookies } from "next/headers";
import { sql } from "kysely";
import { db } from "./db";

// Fields selections

type id = string | number;

export const defaultSelect = [
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

export const sensitiveSelect = [
    "id",
    "username",
    "displayName",
    "avatar",
    "banner",
    "primaryColor",
    "accentColor",
];

const avatars = [
    {
        avatar: "178ba6e1-5551-42f3-b199-ddb9fc0f80de",
        color: "#5865F2",
    },
    {
        avatar: "9a5bf989-b884-4f81-b26c-ca1995cdce5e",
        color: "#3BA45C",
    },
    {
        avatar: "7cb3f75d-4cad-4023-a643-18c329b5b469",
        color: "#737C89",
    },
    {
        avatar: "220b2392-c4c5-4226-8b91-2b60c5a13d0f",
        color: "#ED4245",
    },
    {
        avatar: "51073721-c1b9-4d47-a2f3-34f0fbb1c0a8",
        color: "#FAA51A",
    },
];

export function getRandomProfile() {
    const index = Math.floor(Math.random() * avatars.length);
    return { avatar: avatars[index].avatar, color: avatars[index].color };
}

export function getRandomId() {
    const timestamp = Date.now().toString();
    const first9Digits = timestamp.slice(0, 9);

    let randomDigits = "";
    for (let i = 0; i < 8; i++) {
        randomDigits += Math.floor(Math.random() * 10);
    }

    randomDigits += Math.floor(Math.random() * 9) + 1;
    const result = first9Digits + randomDigits;
    return parseInt(result, 10);
}

export async function doesUserExist({ id, username, email }: Partial<UserTable>) {
    if (!id && !username && !email) return false;
    let query = db.selectFrom("users").select("id");

    try {
        if (id) {
            query = query.where("id", "=", id);
        } else if (username) {
            // @ts-expect-error
            query = query.where(sql`username = BINARY ${username}`);
        } else if (email) {
            query = query.where("email", "=", email);
        }

        const user = await query.executeTakeFirst();
        return !!user;
    } catch (error) {
        return false;
    }
}

export async function createUser(user: Partial<UserTable>) {
    if (!user.username || !user.password) {
        return null;
    }

    try {
        const profile = getRandomProfile();

        const newUser = await db
            .insertInto("users")
            .values({
                id: getRandomId(),
                username: user.username,
                displayName: user.username,
                password: user.password,
                avatar: profile.avatar,
                primaryColor: profile.color,
                accentColor: profile.color,
                notes: "[]",
                notifications: "[]",
                refreshTokens: "[]",
            })
            .executeTakeFirst();

        return newUser;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getUser({
    id,
    username,
    select,
    throwOnNotFound,
}: {
    id?: id;
    username?: string;
    select?: {
        [K in keyof UserTable]?: boolean;
    };
    throwOnNotFound?: boolean;
}): Promise<Partial<UserTable> | NextResponse | null> {
    const refreshToken = cookies().get("token")?.value;

    if (!id && !username && !refreshToken) {
        if (throwOnNotFound) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        return null;
    }

    try {
        const user = await db
            .selectFrom("users")
            .select("id")
            .$if(!!select?.username, (q) => q.select("username"))
            .$if(!!select?.displayName, (q) => q.select("displayName"))
            .$if(!!select?.email, (q) => q.select("email"))
            .$if(!!select?.phone, (q) => q.select("phone"))
            .$if(!!select?.avatar, (q) => q.select("avatar"))
            .$if(!!select?.banner, (q) => q.select("banner"))
            .$if(!!select?.primaryColor, (q) => q.select("primaryColor"))
            .$if(!!select?.accentColor, (q) => q.select("accentColor"))
            .$if(!!select?.description, (q) => q.select("description"))
            .$if(!!select?.customStatus, (q) => q.select("customStatus"))
            .$if(!!select?.password, (q) => q.select("password"))
            .$if(!!select?.refreshTokens, (q) => q.select("refreshTokens"))
            .$if(!!select?.status, (q) => q.select("status"))
            .$if(!!select?.system, (q) => q.select("system"))
            .$if(!!select?.verified, (q) => q.select("verified"))
            .$if(!!select?.notifications, (q) => q.select("notifications"))
            .$if(!!select?.createdAt, (q) => q.select("createdAt"))
            .$if(!id && !username, (q) =>
                // @ts-expect-error
                q.where(sql`JSON_CONTAINS(refresh_tokens, JSON_OBJECT('token', ${refreshToken}))`)
            )
            .$if(!!id, (q) => q.where("id", "=", id as number))
            // @ts-expect-error
            .$if(!!username, (q) => q.where(sql`username = BINARY ${username}`))
            .executeTakeFirst();

        if (!user) {
            if (throwOnNotFound) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "User not found",
                    },
                    { status: 404 }
                );
            }

            return null;
        }

        // @ts-expect-error
        return user;
    } catch (error) {
        console.error(error);

        if (throwOnNotFound) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

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
        const user = await db
            .selectFrom("users")
            .select(defaultSelect)
            .where(sql`JSON_CONTAINS(refresh_tokens, JSON_OBJECT('token', ${refreshToken}))`)
            .executeTakeFirst();

        if (!user) return null;

        const friends = await getFriends(user.id);
        const blocked = await getBlocked(user.id);
        const blockedBy = await getBlockedBy(user.id);
        const received = await getRequestsReceived(user.id);
        const sent = await getRequestsSent(user.id);

        const channels = await getChannels(user.id);
        const guilds = await getGuilds(user.id);

        return {
            user,
            friends,
            blocked,
            blockedBy,
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

export async function getFriends(userId: id) {
    try {
        const friends = await sql<Partial<User>[]>`
            SELECT
                ${sql.ref("id")},
                ${sql.ref("username")},
                ${sql.ref("displayName")},
                ${sql.ref("avatar")},
                ${sql.ref("status")},
                ${sql.ref("createdAt")}
            FROM
                ${sql.ref("friends")}
            INNER JOIN (
                SELECT
                    ${sql.ref("id")},
                    ${sql.ref("username")},
                    ${sql.ref("displayName")},
                    ${sql.ref("avatar")},
                    ${sql.ref("status")},
                    ${sql.ref("createdAt")}
                FROM
                    ${sql.ref("users")}
                WHERE
                    ${sql.ref("id")} != ${userId}
            )
            AS ${sql.ref("users")}
            ON ${sql.ref("users.id")} = ${sql.ref("friends.A")}
            OR ${sql.ref("users.id")} = ${sql.ref("friends.B")}
            WHERE (
                (
                    ${sql.ref("A")} = ${userId}
                    AND ${sql.ref("B")} != ${userId}
                )
            OR (
                    ${sql.ref("A")} != ${userId}
                    AND ${sql.ref("B")} = ${userId}
                )
            )`.execute(db);

        // const rows = await kysely
        //     .selectFrom("user as u1")
        //     .innerJoin("user as u2", (jb) =>
        //         jb.on(({ eb, ref }) =>
        //             eb("u1.id", "=", ref("u2.id")).or("u1.first_name", "=", ref("u2.first_name"))
        //         )
        //     )
        //     .innerJoin("user as u3", (jb) =>
        //         jb.on(({ eb, or, ref }) =>
        //             or([
        //                 eb("u2.id", "=", ref("u3.id")),
        //                 eb("u2.first_name", "=", ref("u2.first_name")),
        //             ])
        //         )
        //     )
        //     .execute();

        return friends.rows || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getRequestsSent(userId: id) {
    try {
        const requests =
            (await db
                .selectFrom("requests")
                .innerJoin(
                    (eb) => eb.selectFrom("users").select(defaultSelect).as("users"),
                    (join) => join.onRef("users.id", "=", "requests.requestedId")
                )
                .select(defaultSelect)
                .where("requests.requesterId", "=", userId)
                .execute()) || [];

        return requests;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getRequestsReceived(userId: id) {
    try {
        const requests =
            (await db
                .selectFrom("requests")
                .innerJoin(
                    (eb) => eb.selectFrom("users").select(defaultSelect).as("users"),
                    (join) => join.onRef("users.id", "=", "requests.requesterId")
                )
                .select(defaultSelect)
                .where("requests.requestedId", "=", userId)
                .execute()) || [];

        return requests;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getBlocked(userId: id) {
    try {
        const blocked =
            (await db
                .selectFrom("blocked")
                .innerJoin(
                    (eb) => eb.selectFrom("users").select(sensitiveSelect).as("users"),
                    (join) => join.onRef("users.id", "=", "blocked.blockedId")
                )
                .select(sensitiveSelect)
                .where("blocked.blockerId", "=", userId)
                .execute()) || [];

        return blocked;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getBlockedBy(userId: id) {
    try {
        const blocked =
            (await db
                .selectFrom("blocked")
                .innerJoin(
                    (eb) => eb.selectFrom("users").select(sensitiveSelect).as("users"),
                    (join) => join.onRef("users.id", "=", "blocked.blockerId")
                )
                .select(sensitiveSelect)
                .where("blocked.blockedId", "=", userId)
                .execute()) || [];

        return blocked;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getChannels(userId: id) {
    try {
        const channels =
            (await db
                .selectFrom("channelrecipients")
                .innerJoin(
                    (eb) =>
                        eb
                            .selectFrom("channels")
                            .select(["id", "type", "name", "icon", "updatedAt"])
                            .as("channels"),
                    (join) => join.onRef("channels.id", "=", "channelrecipients.channelId")
                )
                .select(["id", "type", "name", "icon", "updatedAt"])
                .orderBy("channels.updatedAt", "desc")
                .where("channelrecipients.userId", "=", userId)
                .execute()) || [];

        // MAYBE REALLY TRY TO GET THE RECIPIENTS IN ONE QUERY

        const newChannels = await Promise.all(
            channels.map(async (channel) => {
                const recipients =
                    (await db
                        .selectFrom("channelrecipients")
                        .innerJoin(
                            (eb) => eb.selectFrom("users").select(defaultSelect).as("users"),
                            (join) => join.onRef("users.id", "=", "channelrecipients.userId")
                        )
                        .select(defaultSelect)
                        .where("channelId", "=", channel.id)
                        .execute()) || [];

                return { ...channel, recipients };
            })
        );

        return newChannels;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getChannel(channelId: id) {
    try {
        const channel = await db
            .selectFrom("channels")
            .select(["id", "type", "name", "icon", "guildId", "updatedAt"])
            .where("id", "=", channelId)
            .executeTakeFirst();

        if (!channel) return null;

        // MAYBE REALLY TRY TO GET THE RECIPIENTS IN ONE QUERY

        const recipients =
            (await db
                .selectFrom("channelrecipients")
                .innerJoin(
                    (eb) => eb.selectFrom("users").select(defaultSelect).as("users"),
                    (join) => join.onRef("users.id", "=", "channelrecipients.userId")
                )
                .select(defaultSelect)
                .where("channelId", "=", channel.id)
                .execute()) || [];

        return { ...channel, recipients };
    } catch (error) {
        return error;
    }
}

export async function getGuilds(userId: id) {
    try {
        const guilds =
            (await db
                .selectFrom("guildmembers")
                .innerJoin(
                    (eb) => eb.selectFrom("guilds").select(["id", "name"]).as("guilds"),
                    (join) => join.onRef("guilds.id", "=", "guildmembers.guildId")
                )
                .select(["id", "name"])
                .where("guildmembers.userId", "=", userId)
                .execute()) || [];

        return guilds;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function hasUserBlocked(userId: id, blockedId: id) {
    try {
        const blocked = await db
            .selectFrom("blocked")
            .select("blockedId")
            .where("blockerId", "=", userId)
            .where("blockedId", "=", blockedId)
            .executeTakeFirst();

        return !!blocked;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function isUserBlockedBy(userId: id, blockerId: id) {
    try {
        const blocked = await db
            .selectFrom("blocked")
            .select("blockedId")
            .where("blockerId", "=", blockerId)
            .where("blockedId", "=", userId)
            .executeTakeFirst();

        return !!blocked;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function areFriends(userId: id, friendId: id) {
    try {
        const friends = await db
            .selectFrom("friends")
            .select("A")
            .where(({ eb, or, and }) =>
                or([
                    and([eb("A", "=", userId), eb("B", "=", friendId)]),
                    and([eb("A", "=", friendId), eb("B", "=", userId)]),
                ])
            )
            .executeTakeFirst();

        return !!friends;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function removeFriends(user1: id, user2: id) {
    try {
        const result = await db
            .deleteFrom("friends")
            .where(({ eb, or, and }) =>
                or([
                    and([eb("A", "=", user1), eb("B", "=", user2)]),
                    and([eb("A", "=", user2), eb("B", "=", user1)]),
                ])
            )
            .execute();

        return !!result;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function hasUserSentRequest(userId: id, requestedId: id) {
    try {
        const request = await db
            .selectFrom("requests")
            .select("requesterId")
            .where("requesterId", "=", userId)
            .where("requestedId", "=", requestedId)
            .executeTakeFirst();

        return !!request;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function hasUserReceivedRequest(userId: id, requesterId: id) {
    try {
        const request = await db
            .selectFrom("requests")
            .select("requesterId")
            .where("requesterId", "=", requesterId)
            .where("requestedId", "=", userId)
            .executeTakeFirst();

        return !!request;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function isUserInChannel(userId: id, channelId: id) {
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

export async function isUserInGuild(userId: id, guildId: id) {
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

export async function areUsersBlocked([firstUserId, secondUserId]: [id, id]) {
    try {
        const blocked = await db
            .selectFrom("blocked")
            .select("blockedId")
            .where(({ eb, or, and }) =>
                or([
                    and([eb("blockerId", "=", firstUserId), eb("blockedId", "=", secondUserId)]),
                    and([eb("blockerId", "=", secondUserId), eb("blockedId", "=", firstUserId)]),
                ])
            )
            .executeTakeFirst();

        return !!blocked;
    } catch (error) {
        console.error(error);
        return false;
    }
}
