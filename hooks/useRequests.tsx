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
                body: {
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

    return {
        modifyUsername,
    };
}
