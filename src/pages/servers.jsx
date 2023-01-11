import { Layout } from '../components';

const Servers = () => {
    return <div>servers</div>;
};

Servers.getLayout = function getLayout(page) {
    return (
        <Layout>
             {page}
        </Layout>
    );
};

export default Servers;
