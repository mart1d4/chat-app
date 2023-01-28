import User from "../../../utils/models/User";
import connectDB from "../../../utils/connectDB";
import { serialize } from "cookie";

connectDB();

export default async (req, res) => {
    const { cookies } = req;
    if (!cookies?.jwt) {
        return res.status(204).send({
            message: "No cookie found",
        });
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
        return res.status(204).send({
            message: "No user found",
        });
    }

    user.refreshToken = "";
    await user.save();

    res.setHeader("Set-Cookie", [
        serialize("jwt", "", {
            maxAge: -1,
            path: "/",
        }),
    ]);
    return res.status(204).send({
        message: "Logged out",
    });
};
