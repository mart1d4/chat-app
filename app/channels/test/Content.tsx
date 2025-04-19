"use client";

import { useRequests } from "@/hooks/useRequests";
// import { TextEditor } from "@/app/components/TextArea/TextEditor";
import { useRoom, useParticipant, AudioRenderer, VideoRenderer } from "@livekit/react-core";
import type { RoomOptions } from "livekit-client";
// import { ColorPicker, ImageCropper } from "@components";
// import { getApiUrl } from "@/lib/uploadthing";
import { useEffect, useState } from "react";
// import type Cropper from "cropperjs";

import { ColorPicker, ImageCropper, Input } from "@/app/components";

export function TestContent() {
    const radioChoices = [
        { label: "Choice 1", value: "choice1", description: "Description 1", icon: "voice" },
        { label: "Choice 2", value: "choice2", description: "Description 2", icon: "voice" },
        { label: "Choice 3", value: "choice3", description: "Description 3", icon: "hashtag" },
    ];

    const selectChoices = [
        { label: "Select a channel", value: null },
        { label: "Choice 1", value: "choice1", description: "Description 1", icon: "voice" },
        { label: "Choice 2", value: "choice2", description: "Description 2", icon: "voice" },
        { label: "Choice 3", value: "choice3", description: "Description 3", icon: "hashtag" },
        { label: "Choice 4", value: "choice4", description: "Description 4", icon: "hashtag" },
        { label: "Choice 5", value: "choice5", description: "Description 5", icon: "hashtag" },
        { label: "Choice 6", value: "choice6", description: "Description 6", icon: "hashtag" },
    ];

    const [text, setText] = useState<string>("");
    const [radio, setRadio] = useState<string>(radioChoices[0].value);
    const [checkbox, setCheckbox] = useState<boolean>(false);
    const [checkbox2, setCheckbox2] = useState<boolean>(false);
    const [select, setSelect] = useState<string>(selectChoices[0].value);

    const [croppedImage, setCroppedImage] = useState<Blob | undefined>();
    const [image, setImage] = useState<HTMLImageElement | undefined>();
    const [cropper, setCropper] = useState<Cropper | undefined>();

    // const [color, setColor] = useState(null);

    // const [channelId, setChannelId] = useState("");
    // const [error, setError] = useState("");

    // async function sendMessageToChannel(channeId, i) {
    //     const message = {
    //         content: "Hello, World! " + i,
    //     };

    //     try {
    //         await fetch(`${getApiUrl}/channels/${channeId}/messages`, {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 Authorization: `Bearer ${localStorage.getItem("token")}`,
    //             },
    //             body: JSON.stringify({
    //                 message,
    //             }),
    //         });
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }

    // useEffect(() => {
    //     if (!cropper || !image) return;

    //     async function getCroppedImage() {
    //         if (cropper) {
    //             const d = cropper.getData();
    //             console.log(d);

    //             const data = cropper.getCanvasData();
    //             const canvas = cropper.getCroppedCanvas({
    //                 width: data.width,
    //                 height: data.height,
    //             });
    //             const blob = await new Promise<Blob | undefined>((resolve) => {
    //                 canvas.toBlob((blob) => resolve(blob));
    //             });

    //             setCroppedImage(blob);
    //         }
    //     }

    //     image.addEventListener("cropend", getCroppedImage);
    // }, [cropper]);

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {/* <TextEditor /> */}

            {/* <div>
                <input
                    type="text"
                    value={channelId}
                    placeholder="Channel ID"
                    onChange={(e) => setChannelId(e.target.value)}
                />

                <button
                    type="button"
                    onClick={async () => {
                        for (let i = 0; i < 10000; i++) {
                            await sendMessageToChannel(channelId, i);
                        }
                    }}
                >
                    Send Message
                </button>

                {error && (
                    <p>
                        <strong>Error:</strong> {error}
                    </p>
                )}
            </div> */}

            <div>
                <ImageCropper
                    alt="avatar"
                    aspectRatio={3}
                    setImage={setImage}
                    setCropper={setCropper}
                    src="https://utfs.io/f/HVcOIr52x0E5OSpgHQQMYxj6r20gUACZlRdOyWzecSHLnDXw"
                />

                <div>
                    {croppedImage && (
                        <img
                            src={URL.createObjectURL(croppedImage)}
                            style={{
                                maxWidth: 500,
                                maxHeight: 500,
                            }}
                        />
                    )}
                </div>
            </div>

            {/* <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                }}
            >
                <ColorPicker
                    initColor={color}
                    onColorChange={setColor}
                />

                <div
                    style={{
                        margin: 40,
                        width: 200,
                        height: 200,
                        borderRadius: 4,
                        backgroundColor: color,
                    }}
                />
            </div> */}

            {/* <div
                style={{
                    gap: 40,
                    width: 450,
                    padding: 20,
                    display: "flex",
                    borderRadius: 5,
                    flexDirection: "column",
                    backgroundColor: "var(--bg-2)",
                }}
            >
                <Input
                    type="text"
                    value={text}
                    label="Text"
                    placeholder="Some text"
                    onChange={(v) => setText(v as string)}
                />

                <Input
                    type="radio"
                    value={radio}
                    radioSide="right"
                    label="Channel type"
                    choices={radioChoices}
                    onChange={(v) => setRadio(v as string)}
                />

                <Input
                    type="checkbox"
                    label="Checkbox"
                    value={checkbox}
                    checkboxType="checkbox"
                    onChange={(v) => setCheckbox(v as boolean)}
                />

                <Input
                    type="checkbox"
                    label="Checkbox"
                    value={checkbox2}
                    onChange={(v) => setCheckbox2(v as boolean)}
                />

                <Input
                    type="select"
                    label="Select"
                    value={select}
                    choices={selectChoices}
                    onChange={(v) => setSelect(v as string)}
                />
            </div> */}
        </div>
    );
}
