import { Layout, NestedLayout, AppHeader } from '../components/';

const servers = () => {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "var(--background-4)",
                height: "100%",
                width: "100%",
            }}
        >
            <AppHeader
                content="friends"
                active={"online"}
            />

            <div
                style={{
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
