import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/mysql";
import { Channels, Guilds, Messages, Users } from "./types";
import { ExpressionBuilder, sql } from "kysely";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "./db";

type id = string | number;

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
    "mentions",
    "mentionRoleIds",
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
];

const guildSelect: (keyof Guilds)[] = [
    "id",
    "name",
    "icon",
    "banner",
    "description",
    "members",
    "systemChannelId",
    "createdAt",
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

export async function doesUserExist({ id, username, email }: Partial<Users>) {
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

export async function createUser(user: Partial<Users>) {
    if (!user.username || !user.password) {
        return null;
    }

    const id = getRandomId();

    try {
        const profile = getRandomProfile();

        const newUser = await db
            .insertInto("users")
            .values({
                id: id,
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
        await db.deleteFrom("users").where("id", "=", id).execute();
        throw new Error("Failed to create user");
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
        [K in keyof Users]?: boolean;
    };
    throwOnNotFound?: boolean;
}): Promise<Partial<Users> | NextResponse | null> {
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
                q.where(sql`JSON_CONTAINS(refresh_tokens, JSON_OBJECT('token', ${refreshToken}))`)
            )
            .$if(!!id, (q) => q.where("id", "=", id))
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

        return user;
    } catch (error) {
        console.error(error);

        if (throwOnNotFound) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
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
            .select(selfUserSelect)
            .where(sql`JSON_CONTAINS(refresh_tokens, JSON_OBJECT('token', ${refreshToken}))`)
            .executeTakeFirst();

        if (!user) return null;

        const friends = await getFriends(user.id);
        const blocked = await getBlocked(user.id);
        const received = await getRequestsReceived(user.id);
        const sent = await getRequestsSent(user.id);

        const channels = await getChannels(user.id);
        const guilds = await getGuilds(user.id);

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

export async function getFriends(userId: id) {
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

export async function getRequestsSent(userId: id) {
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

export async function getRequestsReceived(userId: id) {
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

export async function getBlocked(userId: id) {
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

export async function getBlockedBy(userId: id) {
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

export function withRecipients(eb: ExpressionBuilder<DB, "users">, select = selfUserSelect) {
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

export async function getChannels(userId: id) {
    try {
        const channels = await db
            .selectFrom("channels")
            .select(channelSelect)
            .select((eb) => withRecipients(eb))
            .where(({ exists, selectFrom }) =>
                exists(
                    selectFrom("channelrecipients")
                        .select("id")
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

export async function getChannel(channelId: id, select?: (keyof Channels)[]) {
    try {
        const channel = await db
            .selectFrom("channels")
            .$if(!!select, (q) => q.select(select))
            .$if(!select, (q) => q.select(channelSelect))
            .$if(!select, (q) => q.select((eb) => withRecipients(eb)))
            .where("id", "=", channelId)
            .executeTakeFirst();

        return channel;
    } catch (error) {
        return error;
    }
}

export async function getChannelRecipientCount(channelId: id) {
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

export async function getGuilds(userId: id) {
    try {
        const guilds = await db
            .selectFrom("guildmembers")
            .innerJoin(
                (eb) => eb.selectFrom("guilds").select(guildSelect).as("guilds"),
                (join) => join.onRef("guilds.id", "=", "guildmembers.guildId")
            )
            .select(guildSelect)
            .where("guildmembers.userId", "=", userId)
            .orderBy("createdAt", "desc")
            .execute();

        return guilds || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getGuild(guildId: id) {
    if (!guildId) return null;

    try {
        const guild = await db
            .selectFrom("guilds")
            .select(guildSelect)
            .where("id", "=", guildId)
            .executeTakeFirst();

        return guild;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getGuildChannels(guildId: id) {
    if (!guildId) return [];

    try {
        const channels = await db
            .selectFrom("channels")
            .select([
                "id",
                "type",
                "name",
                "position",
                "parentId",
                "guildId",
                "permissionOverwrites",
            ])
            .where("guildId", "=", guildId)
            .execute();

        return channels || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getGuildMembers(guildId: id) {
    try {
        const members = await db
            .selectFrom("guildmembers")
            .innerJoin(
                (eb) => eb.selectFrom("users").select(selfUserSelect).as("users"),
                (join) => join.onRef("users.id", "=", "guildmembers.userId")
            )
            .select(selfUserSelect)
            .where("guildId", "=", guildId)
            .execute();

        return members || [];
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
    if (!userId || !guildId) return false;

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

export async function didUserHideChannel(userId: id, channelId: id) {
    try {
        const hidden = await db
            .selectFrom("channelrecipients")
            .select("isHidden")
            .where("userId", "=", userId)
            .where("channelId", "=", channelId)
            .executeTakeFirst();

        return hidden ? hidden.isHidden : false;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export function withAuthor(eb: ExpressionBuilder<DB, "users">) {
    return jsonObjectFrom(
        eb
            .selectFrom("users as author")
            .select(userSelect)
            .whereRef("author.id", "=", "messages.authorId")
    ).as("author");
}

export function withMentions(eb: ExpressionBuilder<DB, "users">) {
    return jsonArrayFrom(
        eb
            .selectFrom("users as mention")
            .select(userSelect)
            // Where mention id is in the mentions arraym which is a JSON array
            .where("mention.id", "=", "messages.authorId")
    ).as("mentions");
}

export function withReference(eb: ExpressionBuilder<DB, "messages">) {
    return jsonObjectFrom(
        eb
            .selectFrom("messages as reference")
            .select((eb) => [...messageSelect, withAuthor(eb)])
            .whereRef("reference.id", "=", "messages.messageReferenceId")
    ).as("reference");
}

export async function getMessages(channelId: id, limit: number = 50, pinned: boolean = false) {
    try {
        const messages = await db
            .selectFrom("messages")
            .select(messageSelect)
            .select((eb) => [withAuthor(eb), withMentions(eb), withReference(eb)])
            .where("channelId", "=", channelId)
            .$if(pinned, (q) => q.where("pinned", "is not", null))
            .orderBy("createdAt", "desc")
            .limit(limit)
            .execute();

        return messages || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getMessage(messageId: id) {
    try {
        const message = await db
            .selectFrom("messages")
            .select(messageSelect)
            .select((eb) => [withAuthor(eb), withMentions(eb), withReference(eb)])
            .where("id", "=", messageId)
            .executeTakeFirst();

        return message;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export function withInviter(eb: ExpressionBuilder<DB, "users">, select = selfUserSelect) {
    return jsonObjectFrom(
        eb
            .selectFrom("users as inviter")
            .select(select)
            .whereRef("inviter.id", "=", "invites.inviterId")
    ).as("inviter");
}

export function withGuild(eb: ExpressionBuilder<DB, "guilds">) {
    return jsonObjectFrom(
        eb.selectFrom("guilds").select(guildSelect).whereRef("guilds.id", "=", "invites.guildId")
    ).as("guild");
}

export function withChannel(eb: ExpressionBuilder<DB, "channels">, select = channelSelect) {
    return jsonObjectFrom(
        eb
            .selectFrom("channels")
            .select((eb) => [...select, withRecipients(eb, ["id", "displayName"])])
            .whereRef("channels.id", "=", "invites.channelId")
    ).as("channel");
}

export async function getInvites(channelId: id) {
    try {
        const invites = await db
            .selectFrom("invites")
            .select((eb) => [
                "id",
                "code",
                "maxUses",
                "maxAge",
                "temporary",
                withInviter(eb),
                withGuild(eb),
                withChannel(eb),
            ])

            .where("channelId", "=", channelId)
            .execute();

        return invites || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getInvite(code: string) {
    try {
        const invite = await db
            .selectFrom("invites")
            .select((eb) => [
                "id",
                "code",
                "maxUses",
                "maxAge",
                "temporary",
                "inviterId",
                withGuild(eb),
                withChannel(eb, ["id", "name", "icon"]),
            ])
            .where("code", "=", code)
            .executeTakeFirstOrThrow();

        return invite;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function isUserGuildOwner(userId: id, guildId: id) {
    try {
        const guild = await db
            .selectFrom("guilds")
            .select("ownerId")
            .where("id", "=", guildId)
            .executeTakeFirst();

        return guild?.ownerId === userId;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function isUserChannelOwner(userId: id, channelId: id) {
    try {
        const channel = await db
            .selectFrom("channels")
            .select("ownerId")
            .where("id", "=", channelId)
            .executeTakeFirst();

        return channel?.ownerId === userId;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function canUserManageChannel(userId: id, guildId: id) {
    // In the future, in addition to checking if the user is the guild owner,
    // check if user has the "MANAGE_CHANNELS" permission (4)
    // through the user's roles in the guild

    try {
        const guild = await db
            .selectFrom("guilds")
            .select("ownerId")
            .where("id", "=", guildId)
            .executeTakeFirst();

        return guild?.ownerId == userId;
    } catch (error) {
        console.error(error);
        return false;
    }
}
