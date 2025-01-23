"use client";

import { useEffect, useRef, useState } from "react";
import { Icon, Range } from "@components";
import styles from "./Cropper.module.css";
import "cropperjs/dist/cropper.css";
import Cropper from "cropperjs";

export function ImageCropper({
    src,
    alt,
    aspectRatio = "1",
    setCropper,
}: {
    src: string;
    alt: string;
    aspectRatio?: string;
    setCropper: (cropper: Cropper | null) => void;
}) {
    const [isReady, setIsReady] = useState(false);

    const imageRef = useRef<HTMLImageElement>(null);
    const cropperRef = useRef<Cropper>(null);

    useEffect(() => {
        if (!imageRef.current) return;

        const cropper = new Cropper(imageRef.current, {
            aspectRatio,
            initialAspectRatio: aspectRatio,
            viewMode: 1,
            dragMode: "move",
            background: false,
            guides: false,
            autoCrop: true,
            rotatable: false,
            autoCropArea: 1,
            cropBoxResizable: false,
            ready: () => {
                setIsReady(true);
            },
        });

        cropperRef.current = cropper;
        if (setCropper) setCropper(cropper);

        return () => {
            cropperRef.current?.destroy();
            if (setCropper) setCropper(null);
        };
    }, []);

    return (
        <div>
            <div className={styles.container}>
                <img
                    src={src}
                    alt={alt}
                    ref={imageRef}
                    className={styles.image}
                />
            </div>

            <div className={styles.controls}>
                {isReady && (
                    <>
                        <Icon name="image" />

                        <div>
                            <Range
                                min={0}
                                max={100}
                                initValue={0}
                                onChange={(value) => {
                                    if (!cropperRef.current) return;

                                    // Zoom is from 0.5 to 2
                                    const zoom = value / 100 + 0.5;
                                    cropperRef.current.zoomTo(zoom);
                                }}
                            />
                        </div>

                        <Icon
                            name="image"
                            size={48}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
