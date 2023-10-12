import { cookies } from "next/headers";
import { NewUser, UserTable } from "./types";
import { db } from "./db";
import { sql } from "kysely";

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
    if (!id && !username && !email) throw new Error("id, username or email is required");
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
        throw new Error("Error checking if user exists");
    }
}

export async function createUser(user: Partial<UserTable>) {
    if (!user.username || !user.password) {
        throw new Error("Username and password are required");
    }

    try {
        const exists = await doesUserExist({ username: user.username });
        if (exists) throw new Error("User already exists");

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
            })
            .executeTakeFirstOrThrow();

        return newUser.insertId;
    } catch (error) {
        console.log(error);
        throw new Error("Error creating user");
    }
}

export async function getUser({
    id,
    toSelect,
}: {
    id?: number;
    toSelect?: {
        [K in keyof UserTable]?: boolean;
    };
}) {
    if (!id) {
        const refreshToken = cookies().get("token")?.value;
        if (!refreshToken) throw new Error("No refresh token found");

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
            .where(sql`json_contains(refresh_tokens, "${refreshToken}")`)
            .executeTakeFirstOrThrow();

        return user;
    }

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
            .where("id", "=", id)
            .execute();

        return user;
    } catch (error) {
        console.log(error);
        throw new Error("Error getting user");
    }
}
