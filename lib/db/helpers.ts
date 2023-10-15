import { NewUser, UserTable } from "./types";
import { cookies } from "next/headers";
import { sql } from "kysely";
import { db } from "./db";

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
            .insertInto<NewUser>("users")
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
    toSelect,
}: {
    id?: number;
    username?: string;
    toSelect?: {
        [K in keyof UserTable]?: boolean;
    };
}) {
    const refreshToken = cookies().get("token")?.value;
    if (!id && !username && !refreshToken) return null;

    try {
        const user = await db
            .selectFrom("users")
            .select("id")
            .$if(!!toSelect?.username, (q) => q.select("username"))
            .$if(!!toSelect?.displayName, (q) => q.select("displayName"))
            .$if(!!toSelect?.email, (q) => q.select("email"))
            .$if(!!toSelect?.phone, (q) => q.select("phone"))
            .$if(!!toSelect?.avatar, (q) => q.select("avatar"))
            .$if(!!toSelect?.banner, (q) => q.select("banner"))
            .$if(!!toSelect?.primaryColor, (q) => q.select("primaryColor"))
            .$if(!!toSelect?.accentColor, (q) => q.select("accentColor"))
            .$if(!!toSelect?.description, (q) => q.select("description"))
            .$if(!!toSelect?.customStatus, (q) => q.select("customStatus"))
            .$if(!!toSelect?.password, (q) => q.select("password"))
            .$if(!!toSelect?.refreshTokens, (q) => q.select("refreshTokens"))
            .$if(!!toSelect?.hiddenChannelIds, (q) => q.select("hiddenChannelIds"))
            .$if(!!toSelect?.status, (q) => q.select("status"))
            .$if(!!toSelect?.system, (q) => q.select("system"))
            .$if(!!toSelect?.verified, (q) => q.select("verified"))
            .$if(!!toSelect?.notifications, (q) => q.select("notifications"))
            .$if(!!toSelect?.createdAt, (q) => q.select("createdAt"))
            .$if(!id && !username, (q) => q.where(sql`json_contains(refresh_tokens, json_quote(${refreshToken}))`))
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

    const userFields = [
        "id",
        "username",
        "displayName",
        "email",
        "phoneNumber",
        "avatar",
        "banner",
        "primaryColor",
        "accentColor",
        "description",
        "customStatus",
        "status",
        "notifications",
        "createdAt",
    ];

    try {
        const user = await db
            .selectFrom("users")
            .select(userFields)
            .where(sql`json_contains(refresh_tokens, json_quote(${refreshToken}))`)
            .executeTakeFirst();

        const friends = await db
            .selectFrom("friends")
            .innerJoin(
                (eb) => eb.selectFrom("users").select(userFields).as("friends"),
                (join) => join.onRef("friends.id", "=", "friends.A").onRef("friends.id", "=", "friends.B")
            )
            .where("friends.B", "=", user?.id)
            .where("friends.A", "=", user?.id)
            .execute();

        const blocked = await db
            .selectFrom("friends")
            .innerJoin(
                (eb) => eb.selectFrom("users").select(userFields).as("friends"),
                (join) => join.onRef("friends.id", "=", "friends.A").onRef("friends.id", "=", "friends.B")
            )
            .where("friends.B", "=", user?.id)
            .where("friends.A", "=", user?.id)
            .execute();

        const blockedBy = await db
            .selectFrom("friends")
            .innerJoin(
                (eb) => eb.selectFrom("users").select(userFields).as("friends"),
                (join) => join.onRef("friends.id", "=", "friends.A").onRef("friends.id", "=", "friends.B")
            )
            .where("friends.B", "=", user?.id)
            .where("friends.A", "=", user?.id)
            .execute();

        const received = await db
            .selectFrom("friends")
            .innerJoin(
                (eb) => eb.selectFrom("users").select(userFields).as("friends"),
                (join) => join.onRef("friends.id", "=", "friends.A").onRef("friends.id", "=", "friends.B")
            )
            .where("friends.B", "=", user?.id)
            .where("friends.A", "=", user?.id)
            .execute();

        const sent = await db
            .selectFrom("friends")
            .innerJoin(
                (eb) => eb.selectFrom("users").select(userFields).as("friends"),
                (join) => join.onRef("friends.id", "=", "friends.A").onRef("friends.id", "=", "friends.B")
            )
            .where("friends.B", "=", user?.id)
            .where("friends.A", "=", user?.id)
            .execute();

        const channels = await db
            .selectFrom("friends")
            .innerJoin(
                (eb) => eb.selectFrom("users").select(userFields).as("friends"),
                (join) => join.onRef("friends.id", "=", "friends.A").onRef("friends.id", "=", "friends.B")
            )
            .where("friends.B", "=", user?.id)
            .where("friends.A", "=", user?.id)
            .execute();

        const guilds = await db
            .selectFrom("friends")
            .innerJoin(
                (eb) => eb.selectFrom("users").select(userFields).as("friends"),
                (join) => join.onRef("friends.id", "=", "friends.A").onRef("friends.id", "=", "friends.B")
            )
            .where("friends.B", "=", user?.id)
            .where("friends.A", "=", user?.id)
            .execute();

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
