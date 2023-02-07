import { jwtVerify } from 'jose';

export default async function verifyAuth(req) {
    const authorization = req.headers.get('authorization') || req.headers.get('Authorization');

    if (!authorization) {
        return { success: false, message: 'No authorization header' };
    } else {
        const token = authorization.split(' ')[1];
        if (!token) {
            return { success: false, message: 'No token' };
        } else {
            try {
                const payload = await jwtVerify(
                    token,
                    new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET)
                );
                return { success: true, user: payload.payload };
            } catch (error) {
                return { success: false, message: error.message };
            }
        }
    }
}
