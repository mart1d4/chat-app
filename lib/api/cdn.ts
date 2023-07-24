export const removeImage = async (id: string) => {
    try {
        await fetch(`https://api.uploadcare.com/files/${id}/storage/`, {
            method: 'DELETE',
            headers: {
                Authorization: `Uploadcare.Simple ${process.env.UPLOADCARE_PUBLIC_KEY}:${process.env.UPLOADCARE_SECRET_KEY}`,
                Accept: 'application/vnd.uploadcare-v0.7+json',
            },
        });
    } catch (error) {
        console.log(error);
        throw new Error('Error removing image');
    }

    return;
};
