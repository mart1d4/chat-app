import { Header, Main, Footer } from '../components';
import Head from 'next/head';

const Index = () => {
    return (
        <>
            <Head>
                <title>Unthrust | Chat with your friends</title>
                <link rel='icon' href='/images/favicon.svg' />
            </Head>
            <Header />
            <Main />
            <Footer />
        </>
    );
}

export default Index;
