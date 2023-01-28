import { Layout, NestedLayout } from '../components/';

const servers = () => {
    return (
        <div>
            LMFAO
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
