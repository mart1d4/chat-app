"use client";

// import { TextEditor } from "../components/TextArea/TextEditor";
import { ImageCropper } from "../components/Images/Cropper";

export default function TestPage() {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                width: "100vw",
            }}
        >
            {/* <TextEditor /> */}

            <ImageCropper
                alt="avatar"
                src="https://images.unsplash.com/photo-1729731321992-5fdb6568816a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8NXx8fGVufDB8fHx8fA%3D%3D"
            />
        </div>
    );
}
