import type { GuildChannel } from "@/type";

export function handleChannelDeletion(channels: GuildChannel[], deletedChannelId: number) {
    const deletedChannel = channels.find((c) => c.id === deletedChannelId);
    if (!deletedChannel) return channels;

    let newChannels = channels.filter((c) => c.id !== deletedChannelId);

    if (deletedChannel.type === 4) {
        // Category deleted, find its children
        const children = channels.filter((c) => c.parentId === deletedChannelId);
        newChannels = newChannels.filter((c) => c.parentId !== deletedChannelId); // Remove them temporarily

        // Separate text and voice channels
        const textChannels = children.filter((c) => c.type === 2);
        const voiceChannels = children.filter((c) => c.type === 3);

        const topText = newChannels.filter((c) => c.type === 2 && c.parentId === null);
        const topVoice = newChannels.filter((c) => c.type === 3 && c.parentId === null);

        // Find top-level text & voice channel counts (to place moved channels correctly)
        const topTextCount = topText.length;
        const topVoiceCount = topVoice.length;
        const totalTopCount = topTextCount + topVoiceCount;

        // Reposition moved channels
        textChannels.forEach((c, i) => {
            c.parentId = null;
            c.position = topTextCount + i;
        });

        voiceChannels.forEach((c, i) => {
            c.parentId = null;
            c.position = totalTopCount + textChannels.length + i;
        });

        if (!!textChannels.length) {
            topVoice.forEach((c) => {
                c.position += textChannels.length;
            });
        }

        newChannels.forEach((c) => {
            if (c.type === 4 || !!c.parentId) {
                if (c.position > deletedChannel.position) {
                    c.position -= 1;
                } else {
                    c.position += textChannels.length + voiceChannels.length;
                }
            }
        });

        newChannels.push(...textChannels, ...voiceChannels);
    } else {
        // Normal channel deletion, shift all channels after it up by 1
        newChannels.forEach((c) => {
            if (c.position > deletedChannel.position) {
                c.position -= 1;
            }
        });
    }

    return newChannels.sort((a, b) => a.position - b.position);
}
