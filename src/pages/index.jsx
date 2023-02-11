import Head from 'next/head';
import { Header, Main, Footer } from '../components';

const Index = () => {
    return (
        <>
            <Head>
                <title>Unthrust | Your Place to Talk and to Hang Out</title>
            </Head>
            <Header />
            <Main />
            <Footer />
        </>
    );
}

export default Index;
