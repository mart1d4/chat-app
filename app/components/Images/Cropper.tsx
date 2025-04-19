"use client";

import { useEffect, useRef, useState } from "react";
import { Icon, Range } from "@components";
import styles from "./Cropper.module.css";
import "cropperjs/dist/cropper.css";
import Cropper from "cropperjs";

export function ImageCropper({
    src,
    alt,
    aspectRatio = 1,
    setCropper,
    setImage,
}: {
    src: string;
    alt: string;
    aspectRatio?: number;
    setCropper?: (cropper: Cropper | null) => void;
    setImage?: (image: HTMLImageElement) => void;
}) {
    const [isReady, setIsReady] = useState(false);
    const [zoom, setZoom] = useState(0);

    const imageRef = useRef<HTMLImageElement>(null);
    const cropperRef = useRef<Cropper>(null);

    useEffect(() => {
        if (!imageRef.current) return;
        if (setImage) setImage(imageRef.current);

        const cropper = new Cropper(imageRef.current, {
            aspectRatio,
            viewMode: 1,
            dragMode: "move",
            background: false,
            guides: false,
            autoCrop: true,
            rotatable: false,
            autoCropArea: 1,
            cropBoxResizable: false,
            zoomOnTouch: false,
            zoomOnWheel: false,
            toggleDragModeOnDblclick: false,
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
        <div className={aspectRatio === 1 ? "round" : undefined}>
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
                                max={4}
                                val={zoom}
                                step={0.05}
                                onChange={(value) => {
                                    setZoom(value);
                                    if (!cropperRef.current) return;
                                    cropperRef.current.zoomTo(value);
                                }}
                            />
                        </div>

                        <Icon
                            size={48}
                            name="image"
                        />
                    </>
                )}
            </div>
        </div>
    );
}
