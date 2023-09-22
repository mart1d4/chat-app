import Channels from 'pusher';

const pusher = new Channels({
    appId: process.env.PUSHER_APP_ID ?? '',
    key: process.env.PUSHER_KEY ?? '',
    secret: process.env.PUSHER_SECRET ?? '',
    cluster: process.env.PUSHER_CLUSTER ?? '',
    useTLS: true,
    encryptionMasterKeyBase64: process.env.PUSHER_ENCRYPTION_KEY,
});

export default pusher;
