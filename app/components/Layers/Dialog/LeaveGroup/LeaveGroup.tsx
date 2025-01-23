"use client";

import { DialogContent, useDialogContext, Input } from "@components";
import { usePathname, useRouter } from "next/navigation";
import useFetchHelper from "@/hooks/useFetchHelper";
import { useData } from "@/store";
import { useState } from "react";

export function LeaveGroup({ channelId, channelName }: { channelId: number; channelName: string }) {
    const [noNotify, setNoNotify] = useState(false);
    const [loading, setLoading] = useState(false);

    const { sendRequest } = useFetchHelper();
    const { setOpen } = useDialogContext();
    const { removeChannel } = useData();
    const pathname = usePathname();
    const router = useRouter();

    const sameUrl = pathname.includes(channelId.toString());

    return (
        <DialogContent
            heading={`Leave '${channelName}'`}
            confirmLabel="Leave Group"
            confirmColor="red"
            confirmLoading={loading}
            onConfirm={async () => {
                setLoading(true);

                const { errors } = await sendRequest({
                    query: "CHANNEL_DELETE",
                    params: {
                        channelId: channelId,
                        noNotify,
                    },
                });

                setLoading(false);

                if (!errors) {
                    removeChannel(channelId);
                    setOpen(false);

                    if (sameUrl) {
                        router.push("/channels/me");
                    }
                }
            }}
        >
            <p>
                Are you sure you want to leave <strong>{channelName}</strong>? You won't be able to
                rejoin this group unless you are re-invited.
            </p>

            <Input
                type="checkbox"
                name="noNotify"
                checked={noNotify}
                onChange={() => setNoNotify((prev) => !prev)}
                label="Leave without notifying other members"
            />
        </DialogContent>
    );
}
