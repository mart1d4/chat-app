"use client";

import { Checkbox, FixedMessage, UserChannels } from "@/app/components";
import { getNanoId } from "@/lib/insertions";
import styles from "./Discover.module.css";
import { useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeading,
    DialogTrigger,
} from "@/app/components/Layers/Dialog/Dialog";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function DiscoverPage() {
    const [checked1, setChecked1] = useState(false);
    const [checked2, setChecked2] = useState(false);

    async function postData() {
        for (let i = 0; i < 1000; i++) {
            await fetch(`${apiUrl}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: getNanoId(),
                    password: "Password",
                }),
            });
        }
    }

    return (
        <>
            <UserChannels />
            <div className={`${styles.container} scrollbar`}>
                <h1>Tests</h1>

                <div className={styles.buttons}>
                    <button
                        className="button blue"
                        onClick={postData}
                    >
                        Create User
                    </button>
                </div>

                <div className={styles.buttons}>
                    <Checkbox
                        checked={checked1}
                        onChange={() => setChecked1(!checked1)}
                    />

                    <Checkbox
                        checked={checked2}
                        onChange={() => setChecked2(!checked2)}
                        box
                    />

                    <Dialog>
                        <DialogTrigger>
                            <button className="button grey">Hey y'all, open me!</button>
                        </DialogTrigger>

                        <DialogContent
                            heading="Pin It. Pin It Good."
                            description="Hey, just double checking that you want to pin this message to the current channel for posterity and greatness?"
                        >
                            <FixedMessage
                                message={{
                                    id: 9273806286234,
                                    channelId: 2387807324,
                                    type: 0,
                                    author: {
                                        id: 82367486724,
                                        username: "User",
                                        avatar: "4_zaaf5608f2b4d18548df90c14_f105e7453fe94cd3c_d20240425_m140321_c005_v0501002_t0033_u01714053801839",
                                        displayName: "User",
                                    },
                                    content: "Hello, world!",
                                    attachments: [],
                                    createdAt: new Date(),
                                    edited: null,
                                    pinned: false,
                                    embeds: [],
                                    userMentions: [],
                                    reference: null,
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </>
    );
}
