import { User, UserTable } from "./types";
import { cookies } from "next/headers";
import { sql } from "kysely";
import { db } from "./db";

// Fields selections

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

function getRandomProfile() {
    const index = Math.floor(Math.random() * avatars.length);
    return { avatar: avatars[index].avatar, color: avatars[index].color };
}

function getRandomId() {
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
            query = query.where("username", "=", username);
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
                hiddenChannelIds: "[]",
            })
            .executeTakeFirst();

        return newUser;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function getUser({
    id,
    username,
    select,
}: {
    id?: number;
    username?: string;
    select?: {
        [K in keyof UserTable]?: boolean;
    };
}): Promise<Partial<User> | null> {
    const refreshToken = cookies().get("token")?.value;
    if (!id && !username && !refreshToken) return null;

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
            .$if(!!select?.hiddenChannelIds, (q) => q.select("hiddenChannelIds"))
            .$if(!!select?.status, (q) => q.select("status"))
            .$if(!!select?.system, (q) => q.select("system"))
            .$if(!!select?.verified, (q) => q.select("verified"))
            .$if(!!select?.notifications, (q) => q.select("notifications"))
            .$if(!!select?.createdAt, (q) => q.select("createdAt"))
            .$if(!id && !username, (q) =>
                q.where(sql`JSON_CONTAINS(refresh_tokens, JSON_OBJECT('token', ${refreshToken}))`)
            )
            .$if(!!id, (q) => q.where("id", "=", id as number))
            .$if(!!username, (q) => q.where("username", "=", username as string))
            .executeTakeFirst();

        return user;
    } catch (error) {
        console.log(error);
        return null;
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

export async function getFriends(userId: number) {
    try {
        const friends = await db
            .selectFrom("friends")
            .innerJoin(
                (eb) => eb.selectFrom("users").select(defaultSelect).as("users"),
                (join) =>
                    // This makes an "AND" instead of an "OR" for some reason
                    // So no friends are returned
                    // join.onRef("users.id", "=", "friends.A").onRef("users.id", "=", "friends.B")
                    // Trying to fix this manually
                    join.on(
                        sql`(friends.A = user.id AND friends.B <> user.id) OR (friends.A <> user.id AND friends.B = user.id))`
                    )
            )
            .select(defaultSelect)
            .where(({ eb, or }) => or([eb("friends.B", "=", userId), eb("friends.A", "=", userId)]))
            .execute();

        console.log("FRIENDS", JSON.stringify(friends, null, 4));
        return friends;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function getRequestsSent(userId: number) {
    try {
        const requests = await db
            .selectFrom("requests")
            .innerJoin(
                (eb) => eb.selectFrom("users").select(defaultSelect).as("users"),
                (join) => join.onRef("users.id", "=", "requests.requestedId")
            )
            .select(defaultSelect)
            .where("requests.requesterId", "=", userId)
            .execute();

        return requests;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function getRequestsReceived(userId: number) {
    try {
        const requests = await db
            .selectFrom("requests")
            .innerJoin(
                (eb) => eb.selectFrom("users").select(defaultSelect).as("users"),
                (join) => join.onRef("users.id", "=", "requests.requesterId")
            )
            .select(defaultSelect)
            .where("requests.requestedId", "=", userId)
            .execute();

        return requests;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function getBlocked(userId: number) {
    try {
        const blocked = await db
            .selectFrom("blocked")
            .innerJoin(
                (eb) => eb.selectFrom("users").select(sensitiveSelect).as("users"),
                (join) => join.onRef("users.id", "=", "blocked.blockedId")
            )
            .select(sensitiveSelect)
            .where("blocked.blockerId", "=", userId)
            .execute();

        return blocked;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function getBlockedBy(userId: number) {
    try {
        const blocked = await db
            .selectFrom("blocked")
            .select("blockerId")
            .innerJoin(
                (eb) =>
                    eb
                        .selectFrom("users")
                        .select([
                            "id",
                            "username",
                            "displayName",
                            "avatar",
                            "primaryColor",
                            "accentColor",
                        ])
                        .as("users"),
                (join) => join.onRef("users.id", "=", "blocked.blockerId")
            )
            .where("blocked.blockedId", "=", userId)
            .execute();

        return blocked;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function getChannels(userId: number) {
    try {
        const channels = await db
            .selectFrom("channelrecipients")
            .innerJoin(
                (eb) => eb.selectFrom("channels").select(["id", "name"]).as("channels"),
                (join) => join.onRef("channels.id", "=", "channelrecipients.channelId")
            )
            .select(["id", "name"])
            .where("channelrecipients.userId", "=", userId)
            .execute();

        return channels;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function getGuilds(userId: number) {
    try {
        const guilds = await db
            .selectFrom("guildmembers")
            .innerJoin(
                (eb) => eb.selectFrom("guilds").select(["id", "name"]).as("guilds"),
                (join) => join.onRef("guilds.id", "=", "guildmembers.guildId")
            )
            .select(["id", "name"])
            .where("guildmembers.userId", "=", userId)
            .execute();

        return guilds;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function hasUserBlocked(userId: number, blockedId: number) {
    try {
        const blocked = await db
            .selectFrom("blocked")
            .select("blockedId")
            .where("blockerId", "=", userId)
            .where("blockedId", "=", blockedId)
            .executeTakeFirst();

        return !!blocked;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function isUserBlockedBy(userId: number, blockerId: number) {
    try {
        const blocked = await db
            .selectFrom("blocked")
            .select("blockedId")
            .where("blockerId", "=", blockerId)
            .where("blockedId", "=", userId)
            .executeTakeFirst();

        return !!blocked;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function areFriends(userId: number, friendId: number) {
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
        console.log(error);
        return false;
    }
}

export async function hasUserSentRequest(userId: number, requestedId: number) {
    try {
        const request = await db
            .selectFrom("requests")
            .select("requesterId")
            .where("requesterId", "=", userId)
            .where("requestedId", "=", requestedId)
            .executeTakeFirst();

        return !!request;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function hasUserReceivedRequest(userId: number, requesterId: number) {
    try {
        const request = await db
            .selectFrom("requests")
            .select("requesterId")
            .where("requesterId", "=", requesterId)
            .where("requestedId", "=", userId)
            .executeTakeFirst();

        return !!request;
    } catch (error) {
        console.log(error);
        return false;
    }
}
