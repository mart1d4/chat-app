import { useAuthenticatedUser } from "./useAuthenticatedUser";
import { useData } from "@/store";

export function useRelationships(userId?: number) {
    if (!userId) return {} as any;

    const { channels, friends, received, sent, blocked } = useData();
    const user = useAuthenticatedUser();

    return {
        isCurrentUser: user.id === userId,
        isFriend: !!friends.find((f) => f.id === userId),
        isBlocked: !!blocked.find((f) => f.id === userId),
        wasRequested: !!sent.find((f) => f.id === userId),
        hasRequested: !!received.find((f) => f.id === userId),
        sharesDM: !!channels.find((c) => c.type === 0 && c.recipients.find((r) => r.id === userId)),
    };
}
