"use client";

import { ColorPicker, ImageCropper } from "@components";
import type Cropper from "cropperjs";
import { useEffect, useState } from "react";

export default function TestPage() {
    const [croppedImage, setCroppedImage] = useState<Blob | undefined>();
    const [image, setImage] = useState<HTMLImageElement | undefined>();
    const [cropper, setCropper] = useState<Cropper | undefined>();

    const [color, setColor] = useState<string | undefined>();

    useEffect(() => {
        if (!cropper || !image) return;

        async function getCroppedImage() {
            if (cropper) {
                const d = cropper.getData();
                console.log(d);

                const data = cropper.getCanvasData();
                const canvas = cropper.getCroppedCanvas({
                    width: data.width,
                    height: data.height,
                });
                const blob = await new Promise<Blob | undefined>((resolve) => {
                    canvas.toBlob((blob) => resolve(blob));
                });

                setCroppedImage(blob);
            }
        }

        image.addEventListener("cropend", getCroppedImage);
    }, [cropper]);

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

            <div>
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
        </div>
    );
}
