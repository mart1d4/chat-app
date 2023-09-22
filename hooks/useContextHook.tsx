"use client";

import { LayerContext } from "@/context/LayerProvider";
import { useContext } from "react";

const useContextHook = ({ context }: { context: string }) => {
    if (context === "layer") return useContext(LayerContext);
    return null;
};

export default useContextHook;
