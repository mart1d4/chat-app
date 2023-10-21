import Channels from "pusher";

const appId = process.env.PUSHER_APP_ID;
const key = process.env.PUSHER_KEY;
const secret = process.env.PUSHER_SECRET;
const cluster = process.env.PUSHER_CLUSTER;

if (!appId || !key || !secret || !cluster) {
    throw new Error("Pusher key or cluster not found.");
}

const pusher = new Channels({
    appId: appId,
    key: key,
    secret: secret,
    cluster: cluster,
    useTLS: true,
    encryptionMasterKeyBase64: process.env.PUSHER_ENCRYPTION_KEY,
});

export default pusher;
