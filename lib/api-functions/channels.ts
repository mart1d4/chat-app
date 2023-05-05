import useAxiosPrivate from "@/hooks/useAxiosPrivate";

const removeChannel = async (id: string) => {
    const axiosPrivate = useAxiosPrivate();

    const response = await axiosPrivate.delete(`/channels/${id}`);

    if (!response.data.success) {
        throw new Error('Could not delete channel');
    };
};

export { removeChannel };
