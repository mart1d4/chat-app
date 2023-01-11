import { Layout } from '../components';

const Account = () => {
    return <div>account</div>;
};

Account.getLayout = function getLayout(page) {
    return (
        <Layout>
            {page}
        </Layout>
    );
};

export default Account;
