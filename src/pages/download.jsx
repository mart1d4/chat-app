import { useEffect, useRef, useState } from 'react';
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
    "https://discordapp.page.link/?link=https%3A%2F%2Fitunes.apple.com%2Fus%2Fapp%2Fdiscord-chat-for-games%2Fid985746746%3Ffingerprint%3D1092831789422231652.x9i4PP2nnHVziQUEcJ-AyT6JMhc%26attemptId%3D37564996-cad5-4c57-94be-4f457efc5298&utm_source=download&apn=com.discord&isi=985746746&ibi=com.hammerandchisel.discord&sd=Your%20place%20to%20talk%20with%20communities%20and%20friends.&efr=1",
    "https://discordapp.page.link/?link=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.discord%26fingerprint%3D1092831789422231652.x9i4PP2nnHVziQUEcJ-AyT6JMhc%26attemptId%3D4df194cc-5b37-4d47-97a1-fe4976b60f62&utm_source=download&apn=com.discord&isi=985746746&ibi=com.hammerandchisel.discord&sd=Your%20place%20to%20talk%20with%20communities%20and%20friends.&efr=1",
    {
        deb: "https://discord.com/api/download?platform=linux&format=deb",
        tar: "https://discord.com/api/download?platform=linux&format=tar.gz",
    },
    "https://discord.com/api/download?platform=osx",
    {
        windows: "https://discord.com/api/downloads/distributions/app/installers/latest?channel=ptb&platform=win&arch=x86",
        deb: "https://discord.com/api/download/ptb?platform=linux&format=deb",
        tar: "https://discord.com/api/download/ptb?platform=linux&format=tar.gz",
        mac: "https://discord.com/api/download/ptb?platform=osx",
    },
];

const Download = () => {
    const [linuxOpen, setLinuxOpen] = useState(false);
    const [testOpen, setTestOpen] = useState(false);

    const linuxButton = useRef(null);
    const linuxPopup = useRef(null);
    const testButton = useRef(null);
    const testPopup = useRef(null);

    useEffect(() => {
        const handleClick = (e) => {
            console.log("click");

            if (
                e.target.includes(linuxButton) || e.target.includes(testButton)
                || e.target.includes(linuxPopup) || e.target.includes(testPopup)
            ) {
                return;
            }

            setLinuxOpen(false);
            setTestOpen(false);
        };

        document.addEventListener('click', handleClick);

        return document.removeEventListener('click', handleClick);
    }, [])

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
                                <a href="https://discord.com/api/downloads/distributions/app/installers/latest?channel=stable&platform=win&arch=x86">
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
                                                <button
                                                    ref={testButton}
                                                    onClick={() => {
                                                        setTestOpen(prev => !prev);
                                                        setLinuxOpen(false);
                                                    }}
                                                >
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

                                                {testOpen && (
                                                    <div className={styles.popup} ref={testPopup}>
                                                        <div>
                                                            <a href={links[index]?.windows}>
                                                                <div>
                                                                    Windows
                                                                </div>
                                                            </a>
                                                        </div>

                                                        <div>
                                                            <a href={links[index]?.deb}>
                                                                <div>
                                                                    Linux deb
                                                                </div>
                                                            </a>
                                                        </div>

                                                        <div>
                                                            <a href={links[index]?.tar}>
                                                                <div>
                                                                    Linux tar.gz
                                                                </div>
                                                            </a>
                                                        </div>

                                                        <div>
                                                            <a href={links[index]?.mac}>
                                                                <div>
                                                                    Mac
                                                                </div>
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <h3>
                                                    {item}
                                                </h3>
                                                {index === 2 ? (
                                                    <div>
                                                        <button
                                                            ref={linuxButton}
                                                            onClick={() => {
                                                                setLinuxOpen(prev => !prev);
                                                                setTestOpen(false);
                                                            }}
                                                        >
                                                            Download
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

                                                        {linuxOpen && (
                                                            <div className={styles.popup} ref={linuxPopup}>
                                                                <div>
                                                                    <a href={links[index]?.deb}>
                                                                        <div>
                                                                            deb
                                                                        </div>
                                                                    </a>
                                                                </div>

                                                                <div>
                                                                    <a href={links[index]?.tar}>
                                                                        <div>
                                                                            tar.gz
                                                                        </div>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <a href={links[index]}>
                                                        Download
                                                    </a>
                                                )}
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