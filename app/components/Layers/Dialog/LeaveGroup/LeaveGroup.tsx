"use client";

import { DialogContent, useDialogContext, Input } from "@components";
import { useRequests } from "@/hooks/useRequests";
import { useState } from "react";

export function LeaveGroup({ channelId, channelName }: { channelId: number; channelName: string }) {
    const [noNotify, setNoNotify] = useState(false);

    const { deleteChannel } = useRequests();
    const { setOpen } = useDialogContext();

    return (
        <DialogContent
            confirmColor="red"
            confirmLabel="Leave Group"
            heading={`Leave '${channelName}'`}
            confirmLoading={deleteChannel.isLoading}
            onConfirm={() => {
                deleteChannel.send({ channelId, noNotify }, { onComplete: () => setOpen(false) });
            }}
        >
            <p>
                Are you sure you want to leave <strong>{channelName}</strong>? You won't be able to
                rejoin this group unless you are re-invited.
            </p>

            <Input
                type="checkbox"
                value={noNotify}
                onChange={() => setNoNotify((prev) => !prev)}
                label="Leave without notifying other members"
            />
        </DialogContent>
    );
}
