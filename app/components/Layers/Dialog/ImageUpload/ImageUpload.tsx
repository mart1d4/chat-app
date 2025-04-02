import { useEffect, useRef, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { useRequests } from "@/hooks/useRequests";
import { DialogContent } from "@components";
import { ImageCropper } from "@components";
import { useTriggerAlert } from "@/store";
import Cropper from "cropperjs";

export function ImageUpload({
    file,
    channelId,
    remove,
}: {
    file: File;
    channelId: number;
    remove: () => void;
}) {
    const [croppedFile, setCroppedFile] = useState<File | null>(null);
    const [cropper, setCropper] = useState<Cropper | null>(null);

    async function handleCrop(canvas: HTMLCanvasElement) {
        const blob = await new Promise<Blob>((resolve) =>
            canvas.toBlob((blob) => resolve(blob as any))
        );

        setCroppedFile(new File([blob], file.name, { type: file.type }));
    }

    return (
        <>
            {!croppedFile && (
                <DialogContent
                    width={600}
                    heading="Edit"
                    confirmLabel="Apply"
                    onConfirm={() => {
                        if (cropper) {
                            handleCrop(cropper.getCroppedCanvas());
                        }
                    }}
                >
                    <ImageCropper
                        alt="Channel Icon"
                        setCropper={setCropper}
                        src={URL.createObjectURL(file)}
                    />
                </DialogContent>
            )}

            {croppedFile && (
                <SendToServer
                    remove={remove}
                    file={croppedFile}
                    channelId={channelId}
                />
            )}
        </>
    );
}

function SendToServer({
    file,
    channelId,
    remove,
}: {
    file: File;
    channelId: number;
    remove: () => void;
}) {
    const [fileId, setFileId] = useState<string | null>(null);

    const { triggerAlert } = useTriggerAlert();
    const { updateChannel } = useRequests();
    const hasRun = useRef(false);

    const { startUpload: uploadAvatar } = useUploadThing("imageUploader", {
        onClientUploadComplete: (files) => {
            const { key: fileId } = files[0];
            setFileId(fileId);
        },
        onUploadError: (error) => {
            console.error(error);
            triggerAlert("error", "Failed to upload image");
        },
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    async function sendToServer() {
        await updateChannel.send(
            {
                channelId,
                body: { icon: fileId },
            },
            {
                onComplete: () => remove(),
                onFail: () => triggerAlert("error", "Failed to update channel"),
            }
        );
    }

    useEffect(() => {
        if (fileId) {
            sendToServer();
        }
    }, [fileId]);

    useEffect(() => {
        if (!hasRun.current) {
            uploadAvatar([file]);
        }

        return () => {
            hasRun.current = true;
        };
    }, []);

    return null;
}
