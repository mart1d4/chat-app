import { Header, Footer } from '../components';
import styles from '../styles/Download.module.css';
import Head from 'next/head';

const cardItems = [
    "iOS",
    "Android",
    "Linux",
    "Mac",
    "Feeling experimental?",
];

const links = [
    "https://discord.com/api/downloads/app/ios/latest",
    "https://discord.com/api/downloads/app/android/latest",
    "https://discord.com/api/downloads/app/linux/latest",
    "https://discord.com/api/downloads/app/mac/latest",
    "https://discord.com/api/downloads/app/experimental/latest",
];

const Download = () => {
    return (
        <>
            <Head>
                <title>Download Discord to Talk, Chat and Hang Out</title>
            </Head>

            <div className={styles.mainContainer}>
                <div className={styles.heading}>
                    <Header />

                    <div className={styles.hero}>
                        <div>
                            <div>
                                <h1>
                                    Get Discord for any device
                                </h1>

                                <div>
                                    An adventure awaits. Hang out with your friends on our desktop app and keep the conversation going on mobile.
                                </div>
                            </div>

                            <div>
                                <a href="/api/downloads/app/windows/latest">
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                    >
                                        <g fill="currentColor">
                                            <path d="M17.707 10.708L16.293 9.29398L13 12.587V2.00098H11V12.587L7.70697 9.29398L6.29297 10.708L12 16.415L17.707 10.708Z"
                                            />
                                            <path d="M18 18.001V20.001H6V18.001H4V20.001C4 21.103 4.897 22.001 6 22.001H18C19.104 22.001 20 21.103 20 20.001V18.001H18Z"
                                            />
                                        </g>
                                    </svg>
                                    Download for Windows
                                </a>

                                <div>
                                    Windows 7 or higher
                                </div>
                            </div>
                        </div>

                        <div>
                            <img src="/assets/download-hero.svg" />
                        </div>
                    </div>

                </div>

                <div className={styles.content}>
                    <div>
                        <div>
                            {cardItems.map((item, index) => (
                                <div
                                    className={styles.card}
                                    key={index}
                                >
                                    {index === 4 ? (
                                        <>
                                            <h3>
                                                Feeling experimental?
                                            </h3>

                                            <div>
                                                Try our Public Test Build and test new features before they launch.
                                            </div>

                                            <div>
                                                <button>
                                                    Download Public Test Build
                                                    <svg
                                                        width="24"
                                                        height="24"
                                                        viewBox="0 0 32 32"
                                                        fill="none"
                                                    >
                                                        <path
                                                            fill="currentColor"
                                                            fillRule="evenodd"
                                                            clipRule="evenodd"
                                                            d="M22.2398 17.0778L11.8576 27.5689C11.2532 28.1437 10.3287 28.1437 9.75984 27.5689C9.19095 26.994 9.19095 26.0599 9.75984 25.4491L19.1109 16L9.75984 6.5509C9.19095 5.97605 9.19095 5.00599 9.75984 4.43114C10.3287 3.85629 11.2532 3.85629 11.8576 4.43114L22.2398 14.9581C22.8087 15.5329 22.8087 16.4671 22.2398 17.0778Z"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <h3>
                                                    {item}
                                                </h3>
                                                <a href="">
                                                    Download
                                                    {index === 2 && (
                                                        <svg
                                                            width="24"
                                                            height="24"
                                                            viewBox="0 0 32 32"
                                                            fill="none"
                                                        >
                                                            <path
                                                                fill="currentColor"
                                                                fillRule="evenodd"
                                                                clipRule="evenodd"
                                                                d="M22.2398 17.0778L11.8576 27.5689C11.2532 28.1437 10.3287 28.1437 9.75984 27.5689C9.19095 26.994 9.19095 26.0599 9.75984 25.4491L19.1109 16L9.75984 6.5509C9.19095 5.97605 9.19095 5.00599 9.75984 4.43114C10.3287 3.85629 11.2532 3.85629 11.8576 4.43114L22.2398 14.9581C22.8087 15.5329 22.8087 16.4671 22.2398 17.0778Z"
                                                            />
                                                        </svg>
                                                    )}
                                                </a>
                                            </div>

                                            <img src={`/assets/${item}.svg`} />
                                        </>
                                    )}
                                </div>
                            )
                            )}
                        </div>
                    </div>
                </div>

                <Footer />
            </div >
        </>
    );
}

export default Download;