import User from "../../../utils/models/User";
import connectDB from "../../../utils/connectDB";
import { serialize } from "cookie";

connectDB();

export default async (req, res) => {
    const { cookies } = req;
    if (!cookies?.jwt) {
        res.status(204);
        return res.redirect("/login");
    }
    const refreshToken = cookies.jwt;

    const user = await User.findOne({ refreshToken });
    if (!user) {
        res.setHeader("Set-Cookie", [
            serialize("jwt", "", {
                maxAge: -1,
                path: "/",
            }),
        ]);
        res.status(204);
        return res.redirect("/login");
    }

    user.refreshToken = "";
    await user.save();

    res.setHeader("Set-Cookie", [
        serialize("jwt", "", {
            maxAge: -1,
            path: "/",
        }),
    ]);
    res.status(204);
    return res.redirect("/login");
};
