import { useContext } from "react";
import { UserSettingsContext } from "../context/UserSettingsProvider";

export default function useUserSettings() {
    const {
        userSettings,
        setUserSettings,
    } = useContext(UserSettingsContext);
    return useContext(UserSettingsContext);
}
