import { useContext } from "react";
import { ComponentsContext } from "../context/ComponentsProvider";

export default function useComponents() {
    const {
        showSettings,
        setShowSettings,
        userProfile,
        setUserProfile,
        menu,
        setMenu,
        modal,
        setModal,
    } = useContext(ComponentsContext);
    return useContext(ComponentsContext);
}
