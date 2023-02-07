import { Layout, NestedLayout } from '../components/';

const servers = () => {
    return (
        <div
            style={{
                backgroundColor: "var(--background-4)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                width: "100%",
                fontSize: "2rem",
            }}
        >
            Servers coming soon!
        </div>
    );
}

servers.getLayout = (page) => {
    return (
        <Layout>
            <NestedLayout>
                {page}
            </NestedLayout>
        </Layout>
    );
};

export default servers;
