import { doesUserExist, getUser } from "@/lib/db/helpers";
import { regexes } from "@/lib/verifications";
import { NextResponse } from "next/server";
import { removeImage } from "@/lib/cdn";
import { headers } from "next/headers";
import { catchError } from "@/lib/api";
import { db } from "@/lib/db/db";
import bcrypt from "bcrypt";

export async function PATCH(req: Request) {
    const userId = parseInt(headers().get("X-UserId") || "0");

    const {
        username,
        password,
        newPassword,
        displayName,
        description,
        customStatus,
        avatar,
        banner,
        primaryColor,
        accentColor,
        status,
    } = await req.json();

    try {
        const user = await getUser({
            id: userId,
            select: {
                username: true,
                password: true,
                avatar: true,
                banner: true,
            },
            throwOnNotFound: true,
        });

        if (newPassword) {
            if (!password) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "You must provide your current password to change it.",
                    },
                    { status: 400 }
                );
            }

            if (newPassword === password) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "New password cannot be the same as the old password.",
                    },
                    { status: 400 }
                );
            }

            if (!newPassword.match(regexes.password)) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "The new password you provided is invalid.",
                    },
                    { status: 400 }
                );
            }

            const passwordsMatch = await bcrypt.compare(password, user.password);

            if (!passwordsMatch) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "The password you provided is incorrect.",
                    },
                    { status: 401 }
                );
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await db
                .updateTable("users")
                .set({ password: hashedPassword })
                .where("id", "=", userId)
                .execute();

            return NextResponse.json(
                {
                    success: true,
                    message: "Successfully updated user.",
                },
                { status: 200 }
            );
        } else if (username) {
            if (!username.match(regexes.username)) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "The username you provided is invalid.",
                    },
                    { status: 400 }
                );
            }

            if (user.username === username) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "New username cannot be the same as the old username.",
                    },
                    { status: 400 }
                );
            }

            if (await doesUserExist({ username })) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Username is already taken.",
                    },
                    { status: 409 }
                );
            }

            if (!password) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Password is required to change username.",
                    },
                    { status: 400 }
                );
            }

            const passwordsMatch = await bcrypt.compare(password, user.password);

            if (!passwordsMatch) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "The password you provided is incorrect.",
                    },
                    { status: 401 }
                );
            }

            await db.updateTable("users").set({ username }).where("id", "=", userId).execute();
        } else {
            [displayName, description, customStatus, primaryColor, accentColor, status].forEach(
                (item) => {
                    const varName = Object.keys({ item })[0] as keyof typeof regexes;
                    if (typeof item === "string" && !regexes[varName].test(item)) {
                        return NextResponse.json(
                            {
                                success: false,
                                message: `The ${varName} you provided is invalid.`,
                            },
                            { status: 400 }
                        );
                    }
                }
            );

            if (avatar === null && user.avatar) {
                removeImage(user.avatar);
            }

            if (banner === null && user.banner) {
                removeImage(user.banner);
            }

            await db
                .updateTable("users")
                .$if(typeof displayName === "string", (q) =>
                    q.set({ displayName: displayName || user.username })
                )
                .$if(typeof description === "string", (q) => q.set({ description }))
                .$if(typeof customStatus === "string", (q) => q.set({ customStatus }))
                .$if(typeof avatar === "string" || avatar === null, (q) => q.set({ avatar }))
                .$if(typeof banner === "string" || banner === null, (q) => q.set({ banner }))
                .$if(typeof primaryColor === "string", (q) => q.set({ primaryColor }))
                .$if(typeof accentColor === "string", (q) => q.set({ accentColor }))
                .$if(typeof status === "string", (q) => q.set({ status }))
                .where("id", "=", userId)
                .execute();
        }

        return NextResponse.json(
            {
                success: true,
                message: "Successfully updated user.",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchError(req, error);
    }
}
