import { base } from "@uploadcare/upload-client";
import useFetchHelper from "./useFetchHelper";

type Errors = {
    [key: string]: string;
};

export default function useRequests() {
    const { sendRequest } = useFetchHelper();

    async function modifyUsername({
        username,
        current,
        password,
        onSuccess,
        onError,
        setErrors,
        setLoading,
    }: {
        username: string;
        current: string;
        password: string;
        onSuccess?: (response: any) => void;
        onError?: () => void;
        setErrors?: (errors: Errors) => void;
        setLoading?: (loading: boolean) => void;
    }) {
        if (setLoading) setLoading(true);
        const errors: Errors = {};

        if (!username) {
            errors.username = "Username is required";
        }

        if (!password) {
            errors.password = "Password is required";
        }

        if (username.length < 2 || username.length > 32) {
            errors.username = "Username must be between 2 and 32 characters long";
        }

        if (username === current) {
            errors.username = "Username is the same as the current one";
        }

        if (Object.keys(errors).length > 0) {
            setErrors && setErrors(errors);
            onError && onError();
            setLoading && setLoading(false);
            return { errors };
        }

        try {
            const response = await sendRequest({
                query: "UPDATE_USER",
                data: {
                    username: username,
                    password: password,
                },
            });

            if (!response.success) {
                const message = response.message.toLowerCase();

                if (message.includes("username")) {
                    errors.username = response.message;
                }

                if (message.includes("password")) {
                    errors.password = response.message;
                }

                onError && onError();
                setErrors && setErrors(errors);
                setLoading && setLoading(false);
                return { errors };
            } else {
                onSuccess && onSuccess(response);
            }
        } catch (err) {
            console.error(`[useRequests] modifyUsername: ${err}`);
            onError && onError();
        }

        setLoading && setLoading(false);
    }

    async function createGuild({
        template,
        name,
        icon,
        onSuccess,
        onError,
        setErrors,
        setLoading,
    }: {
        template: number;
        name: string;
        icon?: File;
        onSuccess?: (response: any) => void;
        onError?: () => void;
        setErrors?: (errors: Errors) => void;
        setLoading?: (loading: boolean) => void;
    }) {
        if (setLoading) setLoading(true);
        const errors: Errors = {};

        if (template < 0 || template > 7) {
            errors.template = "Template is required";
        }

        if (!name) {
            errors.name = "Name is required";
        }

        if (name.length < 2 || name.length > 100) {
            errors.name = "Name must be between 2 and 100 characters long";
        }

        if (Object.keys(errors).length > 0) {
            setErrors && setErrors(errors);
            onError && onError();
            setLoading && setLoading(false);
            return { errors };
        }

        try {
            const uploadedIcon = await (async () => {
                if (!icon) return null;
                const key = process.env.NEXT_PUBLIC_CDN_TOKEN;
                if (!key) throw new Error("No CDN token found");

                const result = await base(icon, {
                    publicKey: key,
                    store: "auto",
                });

                if (!result.file) {
                    throw new Error("No file returned");
                } else {
                    return result.file;
                }
            })();

            const response = await sendRequest({
                query: "GUILD_CREATE",
                data: {
                    name: name,
                    icon: uploadedIcon,
                    template: template,
                },
            });

            if (!response.success) {
                errors.name = response.message;
            } else {
                onSuccess && onSuccess(response);
            }
        } catch (err) {
            console.error(`[useRequests] createGuild: ${err}`);
            onError && onError();
        }

        setLoading && setLoading(false);
    }

    return {
        modifyUsername,
        createGuild,
    };
}
