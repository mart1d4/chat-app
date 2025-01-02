import { useData } from "@/store";

export const useAuthenticatedUser = () => {
    const user = useData((state) => state.user);

    if (!user) {
        throw new Error("User is not authenticated");
    }

    return user;
};
