import filetypeinfo from "magic-bytes.js";
import { useLayers } from "@/lib/store";

const imageTypes = ["image/png", "image/jpeg", "image/gif", "image/apng", "image/webp"];

export default function useFiles() {
    const setLayers = useLayers((state) => state.setLayers);

    async function onFileChange(
        e: React.ChangeEvent<HTMLInputElement>,
        isImage: boolean = true,
        multiple: boolean = false
    ) {
        const uploadedFiles = e.target.files;
        if (!uploadedFiles?.length) return (e.target.value = "");

        // Run checks
        const maxFileSize = 1024 * 1024 * 5; // 5MB

        const files = [];
        const allowedFileTypes = isImage
            ? imageTypes
            : [...imageTypes, "audio/mpeg", "audio/ogg", "audio/wav"];

        for (const file of uploadedFiles) {
            if (file.size > maxFileSize) {
                setLayers({
                    settings: {
                        type: "POPUP",
                    },
                    content: {
                        type: "WARNING",
                        warning: "FILE_SIZE",
                    },
                });
                return (e.target.value = "");
            }

            const fileBytes = new Uint8Array(await file.arrayBuffer());
            const fileType = filetypeinfo(fileBytes)?.[0].mime?.toString();

            if (!fileType || !allowedFileTypes.includes(fileType)) {
                setLayers({
                    settings: {
                        type: "POPUP",
                    },
                    content: {
                        type: "WARNING",
                        warning: "FILE_TYPE",
                    },
                });
                return (e.target.value = "");
            }

            const newFile = new File([file], "image", {
                type: file.type,
            });

            files.push(newFile);
        }

        e.target.value = "";

        if (multiple) return files;
        return files[0];
    }

    return {
        onFileChange,
    };
}
