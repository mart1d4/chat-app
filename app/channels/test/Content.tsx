"use client";

import { useRequests } from "@/hooks/useRequests";
// import { TextEditor } from "@/app/components/TextArea/TextEditor";
import { useRoom, useParticipant, AudioRenderer, VideoRenderer } from "@livekit/react-core";
import type { RoomOptions } from "livekit-client";
// import { ColorPicker, ImageCropper } from "@components";
// import { getApiUrl } from "@/lib/uploadthing";
import { useEffect, useState } from "react";
// import type Cropper from "cropperjs";

import { Track } from "livekit-client";

import {
    ControlBar,
    GridLayout,
    LiveKitRoom,
    ParticipantTile,
    RoomAudioRenderer,
    useTracks,
} from "@livekit/components-react";

import "@livekit/components-styles";

export function TestContent() {
    const [voiceToken, setVoiceToken] = useState<string | undefined>();

    const { authorizeVoice } = useRequests();

    // const [croppedImage, setCroppedImage] = useState<Blob | undefined>();
    // const [image, setImage] = useState<HTMLImageElement | undefined>();
    // const [cropper, setCropper] = useState<Cropper | undefined>();

    // const [color, setColor] = useState("#000000");

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

    useEffect(() => {
        async function getVoiceToken() {
            try {
                const { token } = await authorizeVoice.send(
                    { channelId: 69 },
                    { onComplete: () => console.log("Completed") }
                );

                if (!token) {
                    console.error("Could not get voice token");
                    return;
                }

                setVoiceToken(token);
            } catch (error) {
                console.error(error);
            }
        }

        getVoiceToken();
    }, []);

    return null;

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

            {/* <div>
                <ImageCropper
                    alt="avatar"
                    aspectRatio={3}
                    setImage={setImage}
                    setCropper={setCropper}
                    src="https://images.unsplash.com/photo-1729731321992-5fdb6568816a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8NXx8fGVufDB8fHx8fA%3D%3D"
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
            </div> */}

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

            {voiceToken && (
                <LiveKitRoom
                    video={true}
                    audio={true}
                    token={voiceToken}
                    serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                    // Use the default LiveKit theme for nice styles.
                    data-lk-theme="default"
                    style={{ height: "50%", width: "70%" }}
                >
                    {/* Your custom component with basic video conferencing functionality. */}
                    <MyVideoConference />
                    {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
                    <RoomAudioRenderer />
                    {/* Controls for the user to start/stop audio, video, and screen
      share tracks and to leave the room. */}
                    <ControlBar />
                </LiveKitRoom>
            )}
        </div>
    );
}

function MyVideoConference() {
    // `useTracks` returns all camera and screen share tracks. If a user
    // joins without a published camera track, a placeholder track is returned.
    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: false }
    );

    return (
        <GridLayout
            tracks={tracks}
            style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}
        >
            {/* The GridLayout accepts zero or one child. The child is used
        as a template to render all passed in tracks. */}
            <ParticipantTile />
        </GridLayout>
    );
}
