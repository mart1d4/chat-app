import Head from 'next/head';
import Calculator from '../components/Calculator';

const Main = () => {
    return (
        <>
            <Head>
                <title>Calculator</title>
                <link rel='icon' href='/images/favicon.webp' />
            </Head>
            <Calculator />
        </>
    )
}

export default Main